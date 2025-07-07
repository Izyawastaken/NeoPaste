// config.js must be loaded before this file
const statNameMap = {
  hp: "HP", attack: "Atk", defense: "Def",
  "special-attack": "SpA", "special-defense": "SpD", speed: "Spe"
};
const validTypes = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy"
];


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

function sanitizeType(type) {
  const clean = toShowdownId(type.trim());
  return validTypes.includes(clean) ? clean : null;
}

function toShowdownId(name) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const params = new URLSearchParams(location.search);
const pasteId = params.get('id');

if (!pasteId) {
  document.getElementById('paste-title').textContent = "Invalid Paste Link";
  throw new Error("Missing paste ID");
}

async function loadPaste() {
  if (typeof client === "undefined") {
    console.error("Supabase client not defined");
    return;
  }

  const { data, error } = await client.from('pastes').select().eq('id', pasteId).single();
  if (error || !data) {
    document.getElementById('paste-title').textContent = "Paste Not Found";
    return;
  }

  const { title, author, content } = data;
  const team = parsePaste(content);

  document.getElementById('paste-title').textContent = title || "Untitled Paste";
  document.getElementById('paste-author').textContent = author ? `By ${author}` : "";
  document.getElementById('pasteDisplay').textContent = content;
  window.rawPasteText = content;

  const container = document.getElementById('team-container');
  container.innerHTML = "";

  for (const mon of team) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';

    const spriteUrl = `https://play.pokemonshowdown.com/sprites/dex${mon.shiny ? "-shiny" : ""}/${toShowdownId(mon.name)}.png`;
    const statBlock = await renderStatBlock(mon);
    const movePills = await renderMovePills(mon.moves);

const teraType = sanitizeType(mon.teraType || "");
const teraTypeClass = teraType ? `type-${teraType}` : "";


    card.innerHTML = `
      <h2>${mon.nickname ? `${mon.nickname} (${mon.name})` : mon.name}
        <small>@ ${mon.item || "None"}</small></h2>
      <img src="${spriteUrl}" alt="${mon.name}" />
      <p><strong>Ability:</strong> <span class="info-pill">${mon.ability || "—"}</span></p>
      <p><strong>Tera Type:</strong> <span class="info-pill ${teraTypeClass}">${mon.teraType || "—"}</span></p>
      <p><strong>Nature:</strong> <span class="info-pill nature-pill nature-${mon.nature?.toLowerCase() || 'none'}">${mon.nature || "—"}</span></p>
      <p><strong>EVs:</strong> ${formatEVs(mon.evs)}</p>
      <p><strong>IVs:</strong> ${formatIVs(mon.ivs)}</p>
      ${statBlock}
      <div class="moves">
        <strong>Moves:</strong>
        <div class="move-pill-container">${movePills}</div>
      </div>
    `;
    container.appendChild(card);
  }

  animateStatBars();
}

function getIVColor(percent) {
  const r = percent < 0.5 ? 255 : Math.round(510 * (1 - percent));
  const g = percent < 0.5 ? Math.round(510 * percent) : 255;
  return `rgb(${r}, ${g}, 100)`;
}

function formatEVs(evs = {}) {
  return Object.entries(evs)
    .filter(([_, v]) => v > 0)
   .map(([k, v]) => {
  const shortKey = k.toLowerCase();
  const short = statNameMap[k] || shortKey;
  const cssKey = short.toLowerCase(); // "atk", "spa", etc.
  return `<span class="info-pill stat-${cssKey}">${v} ${short}</span>`;
})

}

function formatIVs(ivs = {}) {
  const output = Object.entries(ivs)
    .filter(([_, v]) => v < 31)
    .map(([k, v]) => `<span class="info-pill" style="background-color:${getIVColor(v / 31)};">${v} ${k.toUpperCase()}</span>`);
  return output.length ? output.join(" ") : `<span class="info-pill" style="background-color:${getIVColor(1)};">Default (31)</span>`;
}

async function renderStatBlock(p) {
  const mods = natureMods[(p.nature || "").toLowerCase()] || {};
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${toShowdownId(p.name)}`);
    const data = await res.json();

    return `
      <div class="stat-block">
        ${data.stats.map(s => {
          const raw = s.stat.name;
          const short = statNameMap[raw] || raw.toUpperCase();
          const base = s.base_stat;
          const k = short.toLowerCase();
          const mod = k === mods.up ? "+" : k === mods.down ? "−" : "";
          return `
            <div class="stat-line">
              <span class="stat-label ${k}">${short}</span>
              <div class="stat-bar"><div class="stat-bar-fill" data-base="${base}"></div></div>
              ${mod ? `<span class="stat-modifier ${mod === "+" ? "plus" : "minus"}">${mod}</span>` : ""}
              <span class="stat-value">${base}</span>
            </div>`;
        }).join("")}
      </div>
    `;
  } catch {
    return `<p>Failed to load stats for ${p.name}</p>`;
  }
}

async function renderMovePills(moves) {
  return (await Promise.all(moves.map(async move => {
    const id = move.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/move/${id}`);
      const { type } = await res.json();
      return `<span class="move-pill type-${type.name.toLowerCase()}">${move.replace(/-/g, ' ')}</span>`;
    } catch {
      return `<span class="move-pill type-normal">${move}</span>`;
    }
  }))).join("");
}

function animateStatBars() {
  requestAnimationFrame(() => {
    document.querySelectorAll(".stat-bar-fill").forEach(bar => {
      const base = +bar.dataset.base;
      bar.style.width = `${Math.min(100, base / 255 * 100)}%`;
      bar.style.backgroundColor =
        base >= 130 ? "#00e676" :
        base >= 100 ? "#ffee58" :
        base >= 70 ? "#ffa726" : "#ef5350";
    });
  });
}

function parsePaste(text) {
  const blocks = text.trim().split(/\n\s*\n/);
  return blocks.map(block => {
    const lines = block.trim().split("\n").map(line => line.trim());
    const mon = {
      name: "", nickname: "", gender: null, item: "", ability: "", shiny: false,
      teraType: "", evs: {}, ivs: {}, nature: "", moves: []
    };

    const [nameLine, ...rest] = lines;
    const [namePart, item] = nameLine.split(" @ ");
    mon.item = item?.trim() || "";
    const match = namePart.match(/^(.*?)\s*(?:\(([^()]+)\))?\s*(?:\(([^()]+)\))?$/);
    if (match) {
      mon.nickname = match[1]?.trim() || "";
      mon.name = match[2] && match[2] !== "M" && match[2] !== "F" ? match[2] : match[1]?.trim();
      mon.gender = ["M", "F"].includes(match[3]) ? match[3] : null;
    }

    rest.forEach(line => {
      if (line.startsWith("Ability:")) mon.ability = line.split(":")[1].trim();
      else if (line.startsWith("Shiny:")) mon.shiny = line.toLowerCase().includes("yes");
      else if (line.startsWith("Tera Type:")) mon.teraType = line.split(":")[1].trim().toLowerCase();
      else if (line.startsWith("EVs:")) line.slice(4).split("/").forEach(part => {
        const [val, stat] = part.trim().split(" ");
        mon.evs[stat.toLowerCase()] = +val;
      });
      else if (line.startsWith("IVs:")) line.slice(4).split("/").forEach(part => {
        const [val, stat] = part.trim().split(" ");
        mon.ivs[stat.toLowerCase()] = +val;
      });
      else if (line.endsWith("Nature")) mon.nature = line.replace("Nature", "").trim();
      else if (line.startsWith("- ")) mon.moves.push(line.slice(2).trim());
    });

    return mon;
  });
}

// Layout toggle
const layoutBtn = document.getElementById('layoutToggle');
const teamContainer = document.getElementById('team-container');

if (!teamContainer.dataset.layout) {
  teamContainer.dataset.layout = 'horizontal';
  teamContainer.classList.add('horizontal-layout');
  layoutBtn.textContent = '🔳 Grid Layout';
}

layoutBtn.addEventListener('click', () => {
  const next = teamContainer.dataset.layout === 'horizontal' ? 'grid' : 'horizontal';
  teamContainer.dataset.layout = next;
  teamContainer.className = `horizontal-layout grid-layout`.split(" ").filter(cls => cls.startsWith(next)).join(" ");
  layoutBtn.textContent = next === 'horizontal' ? '🔳 Grid Layout' : '➡️ Horizontal Layout';
});

document.getElementById('copyBtn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText((window.rawPasteText || "").trim());
    alert("✅ Copied to clipboard!");
  } catch (e) {
    console.error("Copy failed", e);
    alert("❌ Failed to copy!");
  }
});

loadPaste();
