// Make sure config.js is loaded BEFORE this file!
const statNameMap = {
  hp: "HP", attack: "Atk", defense: "Def",
  "special-attack": "SpA", "special-defense": "SpD", speed: "Spe"
};

const natureMods = {
  adamant: { up: "atk", down: "spa" },
  modest: { up: "spa", down: "atk" },
  timid: { up: "spe", down: "atk" },
  jolly: { up: "spe", down: "spa" },
  bold: { up: "def", down: "atk" },
  calm: { up: "spd", down: "atk" },
  careful: { up: "spd", down: "spa" },
  impish: { up: "def", down: "spa" },
  relaxed: { up: "def", down: "spe" },
  quiet: { up: "spa", down: "spe" },
  brave: { up: "atk", down: "spe" },
  lonely: { up: "atk", down: "def" }
};

function toShowdownId(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const params = new URLSearchParams(window.location.search);
const pasteId = params.get('id');

if (!pasteId) {
  document.getElementById('paste-title').textContent = "Invalid Paste Link";
  throw new Error("Missing paste ID in URL");
}

async function loadPaste() {
  if (typeof client === "undefined") {
    console.error("Supabase client is not defined. Check if config.js loaded correctly.");
    return;
  }

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
  document.getElementById('pasteDisplay').textContent = content;
  window.rawPasteText = content;

  document.getElementById('paste-title').textContent = title || "Untitled Paste";
  document.getElementById('paste-author').textContent = author ? `By ${author}` : "";

  const team = parsePaste(content);
  const teamContainer = document.getElementById('team-container');
  teamContainer.innerHTML = "";

  for (const pokemon of team) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';

    const spriteUrl = `https://play.pokemonshowdown.com/sprites/dex${pokemon.shiny ? "-shiny" : ""}/${toShowdownId(pokemon.name)}.png`;
    const statBlockHTML = await renderStatBlock(pokemon);
    const movesHTML = await renderMovePills(pokemon.moves);

    const teraTypeClass = pokemon.teraType ? `type-${pokemon.teraType.toLowerCase()}` : "";

    card.innerHTML = `
      <h2>${pokemon.nickname ? `${pokemon.nickname} (${pokemon.name})` : pokemon.name} <small>@ ${pokemon.item || "None"}</small></h2>
      <img src="${spriteUrl}" alt="${pokemon.name}" />
      <p><strong>Ability:</strong> <span class="info-pill">${pokemon.ability || "—"}</span></p>
      <p><strong>Tera Type:</strong> <span class="info-pill ${teraTypeClass}">${pokemon.teraType || "—"}</span></p>
      <p><strong>Nature:</strong> <span class="info-pill">${pokemon.nature || "—"}</span></p>
      <p><strong>EVs:</strong> ${formatEVs(pokemon.evs)}</p>
      <p><strong>IVs:</strong> ${formatIVs(pokemon.ivs)}</p>
      ${statBlockHTML}
      <div class="moves">
        <strong>Moves:</strong>
        <div class="move-pill-container">${movesHTML}</div>
      </div>
    `;

    teamContainer.appendChild(card);
  }

  animateStatBars();
}

// 🆕 Gradient IVs: 0 (red) → 31 (green)
function getIVColor(percent) {
  let r, g;
  if (percent < 0.5) {
    r = 255;
    g = Math.round(510 * percent);
  } else {
    r = Math.round(510 * (1 - percent));
    g = 255;
  }
  return `rgb(${r}, ${g}, 100)`;
}

// ✅ EVs match stat color classes (e.g. .stat-atk)
function formatEVs(evs) {
  const evStatMap = {
    hp: "hp", attack: "atk", defense: "def",
    "special-attack": "spa", "special-defense": "spd", speed: "spe"
  };

  const entries = Object.entries(evs || {})
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => {
      const short = evStatMap[k.toLowerCase()] || k.toLowerCase();
      return `<span class="info-pill stat-${short}">${v} ${short.toUpperCase()}</span>`;
    });

  return entries.length ? entries.join(" ") : '<span class="info-pill">—</span>';
}

// ✅ IVs now have colored backgrounds using gradient
function formatIVs(ivs) {
  const entries = Object.entries(ivs || {})
    .filter(([_, v]) => v < 31)
    .map(([k, v]) => {
      const percent = v / 31;
      const color = getIVColor(percent);
      return `<span class="info-pill" style="background-color: ${color};">${v} ${k.toUpperCase()}</span>`;
    });
  return entries.length ? entries.join(" ") : `<span class="info-pill" style="background-color: ${getIVColor(1)};">Default (31)</span>`;


}

async function renderStatBlock(pokemon) {
  const nature = (pokemon.nature || "").toLowerCase();
  const mods = natureMods[nature] || {};

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${toShowdownId(pokemon.name)}`);
    const data = await res.json();

    const lines = data.stats.map(statObj => {
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
    });

    return `<div class="stat-block">${lines.join("")}</div>`;
  } catch (e) {
    return `<p>Failed to load stats for ${pokemon.name}</p>`;
  }
}

async function renderMovePills(moves) {
  const pills = await Promise.all(
    moves.map(async (move) => {
      const moveId = move.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/move/${moveId}`);
        const data = await res.json();
        const type = data.type.name.toLowerCase();
        const label = move.replace(/-/g, ' ');
        return `<span class="move-pill type-${type}">${label}</span>`;
      } catch {
        return `<span class="move-pill type-normal">${move}</span>`;
      }
    })
  );
  return pills.join("");
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
    let namePart = "", itemPart = "";

    const atSplit = firstLine.split(" @ ");
    if (atSplit.length === 2) {
      namePart = atSplit[0].trim();
      itemPart = atSplit[1].trim();
      mon.item = itemPart;
    } else {
      namePart = firstLine.trim();
    }

    const parenMatches = [...namePart.matchAll(/\(([^)]+)\)/g)];

    if (parenMatches.length === 2) {
      mon.nickname = namePart.split("(")[0].trim();
      mon.name = parenMatches[0][1];
      mon.gender = parenMatches[1][1];
    } else if (parenMatches.length === 1) {
      const parenValue = parenMatches[0][1];
      if (parenValue === "F" || parenValue === "M") {
        mon.name = namePart.replace(/\s*\((M|F)\)/, "").trim();
        mon.gender = parenValue;
      } else {
        mon.nickname = namePart.split("(")[0].trim();
        mon.name = parenValue;
      }
    } else {
      mon.name = namePart;
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("Ability:")) mon.ability = line.split(":")[1].trim();
      else if (line.startsWith("Shiny:")) mon.shiny = line.split(":")[1].trim().toLowerCase() === "yes";
      else if (line.startsWith("Tera Type:")) mon.teraType = line.split(":")[1].trim();
      else if (line.startsWith("EVs:")) {
        const parts = line.slice(4).split("/");
        for (const part of parts) {
          const [val, stat] = part.trim().split(" ");
          mon.evs[stat.toLowerCase()] = parseInt(val);
        }
      } else if (line.startsWith("IVs:")) {
        const parts = line.slice(4).split("/");
        for (const part of parts) {
          const [val, stat] = part.trim().split(" ");
          mon.ivs[stat.toLowerCase()] = parseInt(val);
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

const layoutToggleBtn = document.getElementById('layoutToggle');
const teamContainer = document.getElementById('team-container');

if (!teamContainer.dataset.layout) {
  teamContainer.dataset.layout = 'horizontal';
  teamContainer.classList.add('horizontal-layout');
  layoutToggleBtn.textContent = '🔳 Grid Layout';
}

layoutToggleBtn.addEventListener('click', () => {
  const current = teamContainer.dataset.layout;
  const next = current === 'horizontal' ? 'grid' : 'horizontal';

  teamContainer.classList.remove('horizontal-layout', 'grid-layout');
  teamContainer.dataset.layout = next;
  teamContainer.classList.add(`${next}-layout`);

  layoutToggleBtn.textContent =
    next === 'horizontal' ? '🔳 Grid Layout' : '➡️ Horizontal Layout';
});

document.getElementById('copyBtn').addEventListener('click', async () => {
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
