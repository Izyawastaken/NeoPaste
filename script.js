  // script.js
  window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pasteForm');
    const contentArea = document.getElementById('content');

    // Handle Pokepaste URL import on paste
    contentArea.addEventListener('paste', async (e) => {
      const paste = (e.clipboardData || window.clipboardData).getData('text');
      if (paste.includes('pokepast.es')) {
        e.preventDefault();
        const raw = await tryImportFromPokepaste(paste);
        if (raw) {
          contentArea.value = raw.trim();
        } else {
          alert("Failed to import from Pokepaste. Check the link!");
        }
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('title').value.trim();
      const author = document.getElementById('author').value.trim();
      const raw = contentArea.value;

      const content = raw
        .replace(/[“”]/g, '"')
        .replace(/\u200B/g, '')
        .replace(/\r/g, '')
        .trim();

      if (!content) {
        alert("Paste content can't be empty!");
        return;
      }

      let parsedTeam;
      try {
        parsedTeam = parsePaste(content);
        if (!parsedTeam || parsedTeam.length === 0) throw new Error("Empty");
      } catch (err) {
        alert("Invalid team format! Please check your paste.");
        return;
      }

      const id = Math.random().toString(36).substring(2, 8);

      const { error } = await client.from('pastes').insert([
        { id, title, author, content, created_at: new Date().toISOString() }
      ]);

      if (error) {
        console.error(error);
        alert("Failed to save paste to Supabase!");
        return;
      }

      showLink(id);
    });

    function showLink(id) {
      let container = document.getElementById("paste-link");
      if (!container) {
        container = document.createElement("div");
        container.id = "paste-link";
        document.querySelector(".container").appendChild(container);
      } else {
        container.innerHTML = "";
      }

      const linkBox = document.createElement("div");
      linkBox.style.marginTop = "1rem";
      linkBox.style.padding = "1rem";
      linkBox.style.background = "rgba(255,255,255,0.05)";
      linkBox.style.border = "1px solid rgba(255,255,255,0.1)";
      linkBox.style.borderRadius = "12px";

      const fakeURL = `view.html?id=${id}`;
      linkBox.innerHTML = `
        <strong>Your paste link:</strong><br>
        <a href="${fakeURL}" target="_blank">${fakeURL}</a>
      `;

      container.appendChild(linkBox);
    }

  function parsePaste(text) {
  const team = [];
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = text.trim().split(/\n{2,}/); // split on 2+ newlines

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const mon = { name:"", gender:null, item:"", ability:"", shiny:false, teraType:"", evs:{}, ivs:{}, nature:"", moves:[] };
    const first = lines[0];
    const m = first.match(/^(.+?)(?: \((M|F)\))? @ (.+)$/);
    const f = first.match(/^(.+?)(?: \((M|F)\))?$/);
    if (m) { mon.name = m[1]; mon.gender = m[2]||null; mon.item = m[3]; }
    else if (f) { mon.name = f[1]; mon.gender = f[2]||null; }
    else continue;

    for (let i = 1; i < lines.length; i++) {
      const l = lines[i];
      if (l.startsWith("Ability:")) mon.ability = l.split(":")[1].trim();
      else if (l.startsWith("Shiny:")) mon.shiny = l.split(":")[1].trim().toLowerCase()==="yes";
      else if (l.startsWith("Tera Type:")) mon.teraType = l.split(":")[1].trim();
      else if (l.startsWith("EVs:")) {
        l.slice(4).split("/").forEach(p => {
          const [v,s] = p.trim().split(" ");
          if (v && s) mon.evs[s.toLowerCase()] = parseInt(v);
        });
      } else if (l.startsWith("IVs:")) {
        l.slice(4).split("/").forEach(p => {
          const [v,s] = p.trim().split(" ");
          if (v && s) mon.ivs[s.toLowerCase()] = parseInt(v);
        });
      } else if (l.endsWith("Nature")) {
        mon.nature = l.replace("Nature","").trim();
      } else if (l.startsWith("- ")) {
        mon.moves.push(l.slice(2).trim());
      }
    }

    team.push(mon);
  }
  return team;
}



      async function tryImportFromPokepaste(url) {
    const match = url.match(/pokepast\.es\/([a-z0-9]+)/i);
    if (!match) return null;

    const pasteId = match[1];
    const proxyUrl = `https://neopasteworker.agastyawastaken.workers.dev/?url=https://pokepast.es/${pasteId}.txt`;

    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error("Bad response");

      const text = await res.text();
      return text.trim();
    } catch (err) {
      console.error("Pokepaste import failed:", err);
      return null;
    }
  }


  });
