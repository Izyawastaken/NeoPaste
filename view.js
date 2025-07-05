// view.js — Enhanced with Animations + Vertical Layout Toggle
// Make sure config.js is loaded BEFORE this file!

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

function toShowdownId(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

const params = new URLSearchParams(window.location.search);
const pasteId = params.get('id');

if (!pasteId) {
  document.getElementById('paste-title').textContent = "Invalid Paste Link";
  throw new Error("Missing paste ID in URL");
}

async function loadPaste() {
  const { data, error } = await client.from('pastes').select().eq('id', pasteId).single();

  if (error || !data) {
    document.getElementById('paste-title').textContent = "Paste Not Found";
    return;
  }

  const { title, author, content } = data;
  document.getElementById('pasteDisplay').textContent = content;
  window.rawPasteText = content;

  document.getElementById('paste-title').textContent = title || "Untitled Paste";
  document.getElementById('paste-author').textContent = author ? `By ${author}` : "";

  const team = parsePaste(content);
  const teamContainer = document.getElementById('team-container');

  for (const [i, pokemon] of team.entries()) {
    const card = document.createElement('div');
    card.className = 'pokemon-card fade-in-up';
    card.style.animationDelay = `${i * 100}ms`;

    const spriteUrl = `https://play.pokemonshowdown.com/sprites/dex${pokemon.shiny ? "-shiny" : ""}/${toShowdownId(pokemon.name)}.png`;
    const statBlockHTML = await renderStatBlock(pokemon);

    card.innerHTML = `
      <h2>${pokemon.nickname ? `${pokemon.nickname} (${pokemon.name})` : pokemon.name} <small>@ ${pokemon.item || "None"}</small></h2>
      <img src="${spriteUrl}" alt="${pokemon.name}" />
      <p><strong>Ability:</strong> ${pokemon.ability || "—"}</p>
      <p><strong>Tera Type:</strong> ${pokemon.teraType || "—"}</p>
      <p><strong>Nature:</strong> ${pokemon.nature || "—"}</p>
      <p><strong>EVs:</strong> ${formatEVs(pokemon.evs)}</p>
      <p><strong>IVs:</strong> ${formatIVs(pokemon.ivs)}</p>
      ${statBlockHTML}
      <div class="moves">
        <strong>Moves:</strong>
        <ul>${pokemon.moves.map(m => `<li>${m}</li>`).join("")}</ul>
      </div>
    `;

    teamContainer.appendChild(card);
  }

  animateStatBars();
}

// Animation + Layout Toggle UI
document.getElementById("layoutToggle")?.addEventListener("click", () => {
  const container = document.getElementById("team-container");
  container.classList.toggle("vertical-layout");

  const isVertical = container.classList.contains("vertical-layout");
  document.getElementById("layoutToggle").textContent = isVertical ? "Grid Layout" : "Vertical Layout";
});


function formatEVs(evs) {
  return Object.entries(evs || {}).filter(([_, v]) => v > 0).map(([k, v]) => `${v} ${k.toUpperCase()}`).join(" / ") || "—";
}

function formatIVs(ivs) {
  return Object.entries(ivs || {}).filter(([_, v]) => v < 31).map(([k, v]) => `${v} ${k.toUpperCase()}`).join(" / ") || "Default (31)";
}

async function renderStatBlock(pokemon) {
  const nature = (pokemon.nature || "").toLowerCase();
  const mods = natureMods[nature] || {};

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${toShowdownId(pokemon.name)}`);
    const data = await res.json();

    return `
      <div class="stat-block">
        ${data.stats.map(statObj => {
          const rawName = statObj.stat.name;
          const name = statNameMap[rawName] || rawName.toUpperCase();
          const value = statObj.base_stat;
          const key = name.toLowerCase();
          const isPlus = key === mods.up;
          const isMinus = key === mods.down;

          return `
            <div class="stat-line">
              <span class="stat-label ${key}">${name}</span>
              <div class="stat-bar">
                <div class="stat-bar-fill" data-base="${value}"></div>
              </div>
              ${isPlus ? '<span class="stat-modifier plus">+</span>' : isMinus ? '<span class="stat-modifier minus">−</span>' : ''}
              <span class="stat-value">${value}</span>
            </div>
          `;
        }).join("")}
      </div>
    `;
  } catch {
    return `<p>⚠️ Failed to load stats for ${pokemon.name}</p>`;
  }
}

function animateStatBars() {
  document.querySelectorAll(".stat-bar-fill").forEach(bar => {
    const base = parseInt(bar.dataset.base);
    const percent = Math.min(100, (base / 255) * 100);
    bar.style.width = percent + "%";

    let color = "#999";
    if (base >= 130) color = "#00e676";
    else if (base >= 100) color = "#ffee58";
    else if (base >= 70) color = "#ffa726";
    else color = "#ef5350";

    bar.style.backgroundColor = color;
  });
}

function parsePaste(text) {
  const team = [];
  const blocks = text.trim().split(/\r?\n\r?\n/);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const mon = {
      name: "", nickname: "", gender: null, item: "", ability: "", shiny: false,
      teraType: "", evs: {}, ivs: {}, nature: "", moves: []
    };

    const firstLine = lines[0];
    let match = firstLine.match(/^(.+?) \(([^)]+)\)(?: \((M|F)\))? @ (.+)$/);
    if (match) {
      mon.nickname = match[1].trim();
      mon.name = match[2].trim();
      mon.gender = match[3] || null;
      mon.item = match[4].trim();
    } else if ((match = firstLine.match(/^(.+?) \((M|F)\) @ (.+)$/))) {
      mon.name = match[1].trim(); mon.gender = match[2]; mon.item = match[3].trim();
    } else if ((match = firstLine.match(/^(.+?) @ (.+)$/))) {
      mon.name = match[1].trim(); mon.item = match[2].trim();
    } else if ((match = firstLine.match(/^(.+?)$/))) {
      mon.name = match[1].trim();
    } else continue;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("Ability:")) mon.ability = line.split(":")[1].trim();
      else if (line.startsWith("Shiny:")) mon.shiny = line.split(":")[1].trim().toLowerCase() === "yes";
      else if (line.startsWith("Tera Type:")) mon.teraType = line.split(":")[1].trim();
      else if (line.startsWith("EVs:")) line.slice(4).split("/").forEach(p => { const [v, s] = p.trim().split(" "); mon.evs[s.toLowerCase()] = parseInt(v); });
      else if (line.startsWith("IVs:")) line.slice(4).split("/").forEach(p => { const [v, s] = p.trim().split(" "); mon.ivs[s.toLowerCase()] = parseInt(v); });
      else if (line.endsWith("Nature")) mon.nature = line.replace("Nature", "").trim();
      else if (line.startsWith("- ")) mon.moves.push(line.slice(2).trim());
    }

    team.push(mon);
  }

  return team;
}

// Copy to Clipboard Button
document.getElementById('copyBtn')?.addEventListener('click', async () => {
  const text = window.rawPasteText || '';
  try {
    await navigator.clipboard.writeText(text.trim());
    alert("✅ Copied to clipboard!");
  } catch (err) {
    console.error("❌ Copy failed", err);
    alert("Failed to copy!");
  }
});

loadPaste();
