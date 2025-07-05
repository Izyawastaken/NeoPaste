// Requires: config.js (with client), view.css (with new styles), view.html

const statNameMap = {
  hp: "HP", attack: "Atk", defense: "Def",
  "special-attack": "SpA", "special-defense": "SpD", speed: "Spe"
};

const natureMods = {
  adamant: { up: "atk", down: "spa" }, modest: { up: "spa", down: "atk" },
  timid: { up: "spe", down: "atk" }, jolly: { up: "spe", down: "spa" },
  bold: { up: "def", down: "atk" }, calm: { up: "spd", down: "atk" },
  careful: { up: "spd", down: "spa" }, impish: { up: "def", down: "spa" },
  relaxed: { up: "def", down: "spe" }, quiet: { up: "spa", down: "spe" },
  brave: { up: "atk", down: "spe" }, lonely: { up: "atk", down: "def" }
};

const params = new URLSearchParams(window.location.search);
const pasteId = params.get('id');

if (!pasteId) {
  document.getElementById('paste-title').textContent = "Invalid Paste Link";
  throw new Error("Missing paste ID in URL");
}

async function loadPaste() {
  const { data, error } = await client
    .from('pastes')
    .select()
    .eq('id', pasteId)
    .single();

  if (error || !data) {
    document.getElementById('paste-title').textContent = "Paste Not Found";
    return;
  }

  const { title, author, content } = data;
  document.getElementById('paste-title').textContent = title || "Untitled Paste";
  document.getElementById('paste-author').textContent = author ? `By ${author}` : "";

  const team = parsePaste(content);
  const teamContainer = document.getElementById('team-container');

  for (const pokemon of team) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';

    try {
      const api = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name.toLowerCase()}`);
      const poke = await api.json();

      const image = poke.sprites.other["official-artwork"].front_default;
      const stats = poke.stats;
      const statHTML = renderStatBars(stats, pokemon.nature);

      card.innerHTML = `
        <div class="pokemon-img-container">
          <img src="${image}" alt="${pokemon.name}" />
        </div>
        <h2>${pokemon.name} <small>@ ${pokemon.item || "None"}</small></h2>
        <p><strong>Ability:</strong> ${pokemon.ability || "—"}</p>
        <p><strong>Tera Type:</strong> ${pokemon.teraType || "—"}</p>
        <p><strong>Nature:</strong> ${pokemon.nature || "—"}</p>
        ${statHTML}
        <div class="moves">
          <strong>Moves:</strong>
          <ul>${pokemon.moves.map(m => `<li>${m}</li>`).join("")}</ul>
        </div>
      `;

      teamContainer.appendChild(card);
    } catch (e) {
      card.innerHTML = `<p>Failed to load info for ${pokemon.name}</p>`;
      teamContainer.appendChild(card);
    }
  }
}

function renderStatBars(stats, natureName) {
  const nature = (natureName || "").toLowerCase();
  const mods = natureMods[nature] || {};
  let maxV = Math.max(200, ...stats.map(s => s.base_stat));

  return `
    <div class="stat-block">
      ${stats.map(s => {
        const raw = s.stat.name;
        const short = statNameMap[raw] || raw.toUpperCase();
        const val = s.base_stat;
        const key = short.toLowerCase();
        const pct = (val / maxV * 100).toFixed(1);

        let cls = "terrible";
        if (val >= 140) cls = "ultra";
        else if (val >= 120) cls = "very-high";
        else if (val >= 100) cls = "high";
        else if (val >= 80) cls = "mid";
        else if (val >= 60) cls = "low";
        else if (val >= 40) cls = "very-low";

        const modPlus = key === mods.up ? '<span class="stat-modifier plus">+</span>' : '';
        const modMinus = key === mods.down ? '<span class="stat-modifier minus">−</span>' : '';

        return `
          <div class="stat-line">
            <span class="stat-label ${key}">${short}</span>
            <div class="stat-bar">
              <div class="stat-bar-fill ${cls}" style="width: ${pct}%"></div>
            </div>
            <span class="stat-value">${val}</span>
            ${modPlus}${modMinus}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function parsePaste(text) {
  const team = [];
  const blocks = text.trim().split(/\r?\n\r?\n/);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (!lines.length) continue;

    const mon = {
      name: "", gender: null, item: "", ability: "", shiny: false,
      teraType: "", evs: {}, ivs: {}, nature: "", moves: []
    };

    const nameLine = lines[0];
    const nameMatch = nameLine.match(/^(.+?)(?: \((M|F)\))? @ (.+)$/);
    if (nameMatch) {
      mon.name = nameMatch[1].trim();
      mon.gender = nameMatch[2] || null;
      mon.item = nameMatch[3].trim();
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("Ability:")) mon.ability = line.split(":")[1].trim();
      else if (line.startsWith("Shiny:")) mon.shiny = line.split(":")[1].trim().toLowerCase() === "yes";
      else if (line.startsWith("Tera Type:")) mon.teraType = line.split(":")[1].trim();
      else if (line.startsWith("EVs:")) {
        line.slice(4).split("/").forEach(part => {
          const [val, stat] = part.trim().split(" ");
          mon.evs[stat.toLowerCase()] = parseInt(val);
        });
      } else if (line.startsWith("IVs:")) {
        line.slice(4).split("/").forEach(part => {
          const [val, stat] = part.trim().split(" ");
          mon.ivs[stat.toLowerCase()] = parseInt(val);
        });
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

loadPaste();
