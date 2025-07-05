window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('pasteForm');
  const contentArea = document.getElementById('content');
  const layoutToggle = document.getElementById('layoutToggle');

  // Handle layout toggle
  layoutToggle.addEventListener('click', () => {
    document.body.classList.toggle('vertical');
    layoutToggle.classList.toggle('active');
    layoutToggle.textContent = document.body.classList.contains('vertical')
      ? '🔄 Horizontal Layout'
      : '📱 Vertical Layout';
  });

  // Import from Pokepaste link on paste
  contentArea.addEventListener('paste', async (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    if (paste.includes('pokepast.es')) {
      e.preventDefault();
      const raw = await tryImportFromPokepaste(paste);
      if (raw) {
        contentArea.value = raw.trim();
      } else {
        alert("⚠️ Failed to import from Pokepaste. Check the link!");
      }
    }
  });

  // Form submission handler
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
      alert("⚠️ Invalid team format! Please check your paste.");
      return;
    }

    const id = Math.random().toString(36).substring(2, 8);

    const { error } = await client.from('pastes').insert([
      { id, title, author, content, created_at: new Date().toISOString() }
    ]);

    if (error) {
      console.error(error);
      alert("❌ Failed to save paste to Supabase!");
      return;
    }

    showLink(id);
  });

  // Link display handler
  function showLink(id) {
    const container = document.getElementById("paste-link");
    const fullURL = `${location.origin}/NeoPaste/view.html?id=${id}`;

    container.innerHTML = `
      <div class="paste-output">
        <p><strong>Your Paste Link:</strong></p>
        <a class="paste-url" href="${fullURL}" target="_blank">${fullURL}</a>
        <button class="copy-link-btn" data-link="${fullURL}">Copy Link</button>
      </div>
    `;

    const copyBtn = container.querySelector(".copy-link-btn");
    copyBtn.addEventListener("click", () => {
      const url = copyBtn.dataset.link;
      navigator.clipboard.writeText(url).then(() => {
        copyBtn.textContent = "✅ Copied!";
        copyBtn.disabled = true;
        copyBtn.classList.add("copied");

        setTimeout(() => {
          copyBtn.textContent = "Copy Link";
          copyBtn.disabled = false;
          copyBtn.classList.remove("copied");
        }, 1500);
      });
    });

    container.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Fetch from Pokepaste
  async function tryImportFromPokepaste(url) {
    const match = url.match(/pokepast\.es\/([a-z0-9]+)/i);
    if (!match) return null;

    const pasteId = match[1];
    const targetUrl = `https://pokepast.es/${pasteId}`;
    const proxyUrl = `https://neopasteworker.agastyawastaken.workers.dev/?url=${encodeURIComponent(targetUrl)}`;

    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error("Bad response");

      const text = await res.text();
      if (text.toLowerCase().includes("<html")) {
        throw new Error("Received HTML instead of paste content");
      }

      return text.trim();
    } catch (err) {
      console.error("Pokepaste import failed:", err);
      return null;
    }
  }

  // Parser
  function parsePaste(text) {
    const team = [];

    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = text.trim().split(/\n{2,}(?=\S)/g);

    for (const block of blocks) {
      const lines = block
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

      if (lines.length === 0) continue;

      const mon = {
        name: "",
        gender: null,
        item: "",
        ability: "",
        shiny: false,
        teraType: "",
        evs: {},
        ivs: {},
        nature: "",
        moves: []
      };

      const firstLine = lines[0];
      const nameMatch = firstLine.match(/^(.+?)(?: \((M|F)\))? @ (.+)$/);
      const fallbackMatch = firstLine.match(/^(.+?)(?: \((M|F)\))?$/);

      if (nameMatch) {
        mon.name = nameMatch[1].trim();
        mon.gender = nameMatch[2] || null;
        mon.item = nameMatch[3].trim();
      } else if (fallbackMatch) {
        mon.name = fallbackMatch[1].trim();
        mon.gender = fallbackMatch[2] || null;
        mon.item = "";
      } else {
        continue;
      }

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("Ability:")) {
          mon.ability = line.split(":")[1].trim();
        } else if (line.startsWith("Shiny:")) {
          mon.shiny = line.split(":")[1].trim().toLowerCase() === "yes";
        } else if (line.startsWith("Tera Type:")) {
          mon.teraType = line.split(":")[1].trim();
        } else if (line.startsWith("EVs:")) {
          const parts = line.slice(4).split("/");
          for (const part of parts) {
            const [val, stat] = part.trim().split(" ");
            if (val && stat) mon.evs[stat.toLowerCase()] = parseInt(val);
          }
        } else if (line.startsWith("IVs:")) {
          const parts = line.slice(4).split("/");
          for (const part of parts) {
            const [val, stat] = part.trim().split(" ");
            if (val && stat) mon.ivs[stat.toLowerCase()] = parseInt(val);
          }
        } else if (line.endsWith("Nature")) {
          mon.nature = line.replace("Nature", "").trim();
        } else if (line.startsWith("- ")) {
          mon.moves.push(line.slice(2).trim());
        }
      }

      team.push(mon);
    }

    return team;
  }
});
