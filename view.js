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

const pokeapiNameMap = {
  // Gendered forms
  "indeedee-f": "indeedee-female",
  "indeedee-m": "indeedee-male",
  "meowstic-f": "meowstic-female",
  "meowstic-m": "meowstic-male",
  "basculegion-f": "basculegion-female",
  "basculegion-m": "basculegion-male",
  "oinkologne-f": "oinkologne-female",
  "oinkologne-m": "oinkologne-male",
  "frillish-f": "frillish-female",
  "frillish-m": "frillish-male",
  "jellicent-f": "jellicent-female",
  "jellicent-m": "jellicent-male",
  "pyroar-f": "pyroar-female",
  "pyroar-m": "pyroar-male",
  "unfezant-f": "unfezant-female",
  "unfezant-m": "unfezant-male",

  // Normal form aliases (for default male mapping)
  "indeedee": "indeedee-male",
  "meowstic": "meowstic-male",
  "basculegion": "basculegion-male",
  "oinkologne": "oinkologne-male",
  "frillish": "frillish-male",
  "jellicent": "jellicent-male",
  "pyroar": "pyroar-male",
  "unfezant": "unfezant-male",

  // Formes & variants
  "rotom-wash": "rotom-wash",
  "rotom-heat": "rotom-heat",
  "rotom-frost": "rotom-frost",
  "rotom-fan": "rotom-fan",
  "rotom-mow": "rotom-mow",
  "rotom": "rotom", // base form

  "urshifu-rapid-strike": "urshifu-rapid-strike",
  "urshifu-single-strike": "urshifu-single-strike",
  "urshifu": "urshifu-single-strike",

  "zacian-crowned": "zacian-crowned",
  "zamazenta-crowned": "zamazenta-crowned",

  "calyrex-ice": "calyrex-ice",
  "calyrex-shadow": "calyrex-shadow",

  "toxtricity-low-key": "toxtricity-low-key",
  "toxtricity-amped": "toxtricity-amped",
  "toxtricity": "toxtricity-amped",

  "basculin-blue-striped": "basculin-blue-striped",
  "basculin-white-striped": "basculin-white-striped",
  "basculin-red-striped": "basculin-red-striped", // default
  "basculin": "basculin-red-striped",

  "lycanroc-midnight": "lycanroc-midnight",
  "lycanroc-dusk": "lycanroc-dusk",
  "lycanroc": "lycanroc", // midday default

  "darmanitan-galar": "darmanitan-galar",
  "darmanitan-galar-zen": "darmanitan-galar-zen",
  "darmanitan": "darmanitan", // normal form

  "giratina-origin": "giratina-origin",
  "giratina": "giratina-altered",

  "shaymin-sky": "shaymin-sky",
  "shaymin": "shaymin-land",

  "tornadus-therian": "tornadus-therian",
  "thundurus-therian": "thundurus-therian",
  "landorus-therian": "landorus-therian",
  "tornadus": "tornadus-incarnate",
  "thundurus": "thundurus-incarnate",
  "landorus": "landorus-incarnate",

  "enamorus-therian": "enamorus-therian",
  "enamorus": "enamorus-incarnate",

  "zygarde-10": "zygarde-10",
  "zygarde-complete": "zygarde-complete",
  "zygarde": "zygarde", // 50%

  "polteageist-antique": "polteageist",
  "polteageist": "polteageist",

  "sinistea-antique": "sinistea",
  "sinistea": "sinistea",

  "minior-red": "minior-red-meteor", // core form = red-meteor
  "minior": "minior-red-meteor",

  "mimikyu-busted": "mimikyu-busted",
  "mimikyu": "mimikyu-disguised",

    // Paradox Pokémon
  "greattusk": "great-tusk",
  "screamtail": "scream-tail",
  "brutebonnet": "brute-bonnet",
  "fluttermane": "flutter-mane",
  "slitherwing": "slither-wing",
  "sandyshocks": "sandy-shocks",
  "irontreads": "iron-treads",
  "ironbundle": "iron-bundle",
  "ironhands": "iron-hands",
  "ironjugulis": "iron-jugulis",
  "ironmoth": "iron-moth",
  "ironthorns": "iron-thorns",
  "roaringmoon": "roaring-moon",
  "ironvaliant": "iron-valiant"
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
let expertMode = false;
const toggleExpertModeBtn = document.getElementById('toggleExpertMode');

toggleExpertModeBtn.addEventListener('click', () => {
  expertMode = !expertMode;
  toggleExpertModeBtn.textContent = expertMode ? 'Hide Raw Damage Modifiers' : 'Show Raw Damage Modifiers';
  document.body.classList.toggle('expert-mode', expertMode);

  const statValues = document.querySelectorAll('.stat-value');
  statValues.forEach(el => {
    const base = parseInt(el.dataset.base);
    if (isNaN(base)) return;

    const statKey = el.dataset.stat;
    const statLine = el.closest('.stat-line');
    const monCard = el.closest('.pokemon-card');
    const natureText = monCard?.querySelector('.nature-pill')?.textContent?.toLowerCase() || '';
    const mods = natureMods[natureText] || {};

    const ev = parseInt(el.dataset.ev) || 0;
    let iv;
    if (el.dataset.iv !== undefined) {
      iv = parseInt(el.dataset.iv);
    } else {
      iv = (statKey === 'atk' ? 0 : 31);
    }
    const level = 100;
    

    if (expertMode) {
      let stat;
      if (statKey === 'hp') {
        stat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
      } else {
        const baseStat = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
        const natureMult = statKey === mods.up ? 1.1 : statKey === mods.down ? 0.9 : 1;
        stat = Math.floor(baseStat * natureMult);
      }

      if (!el.dataset.original) {
        el.dataset.original = el.textContent;
      }

      el.textContent = stat;
    } else {
      if (el.dataset.original) {
        el.textContent = el.dataset.original;
      }
    }
  });
});

function sanitizeType(type) {
  const clean = toShowdownId(type.trim());
  return validTypes.includes(clean) ? clean : null;
}

function toShowdownId(name) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, ""); // removes everything but a-z and 0-9
}

function toSpriteId(name) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]/g, ""); // keeps hyphens for sprite names
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
  const team = await parsePaste(content);

  // Preload all sprite images for this team
  const head = document.head;
  // Remove previous preloads (if any)
  [...head.querySelectorAll('link[data-preload-sprite]')].forEach(link => link.remove());
  for (const mon of team) {
    const originalSpriteUrl = `https://play.pokemonshowdown.com/sprites/gen5${mon.shiny ? "-shiny" : ""}/${toSpriteId(mon.name)}.png`;
    const spriteUrl = `https://neopasteimgexporter.agastyawastaken.workers.dev/?url=${encodeURIComponent(originalSpriteUrl)}`;
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'image';
    preload.href = spriteUrl;
    preload.setAttribute('data-preload-sprite', '');
    head.appendChild(preload);
  }

  document.getElementById('paste-title').textContent = title || "Untitled Paste";
  document.getElementById('paste-author').textContent = author ? `By ${author}` : "";
  document.getElementById('pasteDisplay').textContent = content;
  window.rawPasteText = content;

  const container = document.getElementById('team-container');
  container.innerHTML = "";

  for (const mon of team) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
const showdownName = toSpriteId(mon.name);

let originalSpriteUrl;
if (mon.shiny) {
  originalSpriteUrl = `https://play.pokemonshowdown.com/sprites/gen5-shiny/${showdownName}.png`;
} else {
  originalSpriteUrl = `https://play.pokemonshowdown.com/sprites/gen5/${showdownName}.png`;
}

const spriteUrl = `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(originalSpriteUrl)}`;

    const statBlock = await renderStatBlock(mon);
    const movePills = await renderMovePills(mon.moves);

    const teraType = sanitizeType(mon.teraType || ""); // ✅ uses toShowdownId internally
    const teraTypeClass = teraType ? `type-${teraType}` : "";

    // --- Item icon logic ---
    let itemIconHtml = '';
    if (mon.item) {
      const itemId = mon.item.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
      const itemUrl = `items/${itemId}.png`;
      itemIconHtml = ` <img class="item-icon" src="${itemUrl}" alt="${mon.item}" title="${mon.item}" loading="lazy" />`;
    }

    // Always use Gen 5 Showdown sprites for export and viewer, never animated for export
  
    let finalSpriteUrl;
    if (mon.shiny) {
      finalSpriteUrl = `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(`https://play.pokemonshowdown.com/sprites/gen5-shiny/${showdownName}.png`)}`;
    } else {
      finalSpriteUrl = `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(`https://play.pokemonshowdown.com/sprites/gen5/${showdownName}.png`)}`;
    }

    card.innerHTML = `
      <div class="card-header">
        <h2>${mon.nickname ? mon.nickname + ' (' + mon.name + ')' : mon.name}</h2>
        <p class="item-line">@ <span>${mon.item || "None"}${itemIconHtml}</span></p>
      </div>
      <img src="${finalSpriteUrl}" alt="${mon.name}" data-pokemon-name="${mon.name}" data-shiny="${mon.shiny ? '1' : '0'}" crossorigin="anonymous" />

      <p><strong>Ability:</strong> <span class="info-pill ability-pill">${mon.ability || "—"}</span></p>
      <p><strong>Tera Type:</strong> <span class="info-pill ${teraTypeClass}">${mon.teraType || "—"}</span></p>
${(() => {
  const nature = mon.nature?.toLowerCase();
  const upStat = natureMods[nature]?.up;
  const statAbbrMap = { hp: "HP", atk: "ATK", def: "DEF", spa: "SPA", spd: "SPD", spe: "SPE" };
  const colorClass = upStat ? `stat-${upStat}` : '';
  const boostAbbr = upStat ? statAbbrMap[upStat] : '';
  return `<p><strong>Nature:</strong> <span class="info-pill nature-pill ${colorClass}"${boostAbbr ? ` data-boost=\"${boostAbbr}\"` : ''}>${mon.nature || "—"}</span></p>`;
})()}
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
  afterCardsRendered();
  checkForSecretButton(author);
  if (window.updateAllSprites) window.updateAllSprites();

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
    const mappedKey = toSpriteId(p.name); // ✅ keep hyphens for mapping
    const mappedName = pokeapiNameMap[mappedKey] || mappedKey;

    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${mappedName}`);
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
              <span class="stat-value"
      data-base="${base}"
      data-stat="${k}"
      data-ev="${p.evs[k] ?? 0}"
      data-iv="${p.ivs[k] ?? 31}">
  ${base}
</span>

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

// Animate cards in with staggered delay
function animateCardsIn() {
  const cards = document.querySelectorAll('.pokemon-card');
  cards.forEach((card, i) => {
    card.style.setProperty('--card-delay', `${i * 60}ms`);
  });
}

// Add ripple effect to all .fancy-btn and .report-btn
function addButtonRipples() {
  function createRipple(e) {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    circle.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${e.clientX - rect.left - size/2}px`;
    circle.style.top = `${e.clientY - rect.top - size/2}px`;
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 500);
  }
  document.querySelectorAll('.fancy-btn, .report-btn').forEach(btn => {
    btn.addEventListener('pointerdown', createRipple);
  });
}

// Call after cards are rendered
function afterCardsRendered() {
  animateCardsIn();
  addButtonRipples();
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

    const parens = [...namePart.matchAll(/\(([^)]+)\)/g)].map(m => m[1].trim());
    const baseName = namePart.replace(/\s*\([^)]*\)/g, '').trim();

    // Handle gender
    let gender = null;
    if (parens.length > 0 && ["M", "F"].includes(parens[parens.length - 1])) {
      gender = parens.pop();
    }
    mon.gender = gender;

    // Guess species (second-to-last paren if any left, else base)
    let species = parens.length ? parens.pop() : baseName;
    mon.name = species;

    // Whatever parens remain + baseName = nickname
    mon.nickname = parens.length ? `${baseName} (${parens.join(") (")})` : baseName;
    if (mon.nickname === mon.name) mon.nickname = "";
    // Build nickname
    mon.nickname = parens.length > 0
      ? `${baseName} (${parens.join(") (")})`
      : (mon.name !== baseName ? baseName : "");

    // Remaining lines: Ability, Nature, EVs, IVs, etc.
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

function updateLayoutLabel() {
  layoutBtn.textContent = teamContainer.classList.contains('horizontal-layout')
    ? 'Switch to Grid Layout'
    : 'Switch to Horizontal Layout';
}

layoutBtn.addEventListener('click', () => {
  if (window.innerWidth <= 768) return; // Disable toggle on mobile
  teamContainer.classList.toggle('horizontal-layout');
  teamContainer.classList.remove('mobile-layout'); // Ensure not active
  updateLayoutLabel();
});
function autoApplyMobileLayout() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    teamContainer.classList.remove('horizontal-layout');
    teamContainer.classList.remove('grid-layout');
    teamContainer.classList.add('mobile-layout');
    layoutBtn.style.display = 'none'; // hide button on mobile
  } else {
    teamContainer.classList.remove('mobile-layout');
    teamContainer.classList.add('grid-layout');
    layoutBtn.style.display = 'inline-block';
    updateLayoutLabel();
  }
}

window.addEventListener('resize', autoApplyMobileLayout);
window.addEventListener('DOMContentLoaded', autoApplyMobileLayout);


document.getElementById('copyBtn').addEventListener('click', async () => {
  const btn = document.getElementById('copyBtn');
  try {
    await navigator.clipboard.writeText((window.rawPasteText || "").trim());
    btn.classList.add('copied');
    btn.textContent = '📋 Copied!';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.textContent = '📋 Copy to Clipboard';
    }, 1200);
  } catch (e) {
    console.error("Copy failed", e);
    btn.classList.add('copied');
    btn.style.background = '#ef5350';
    btn.textContent = '❌ Copy Failed';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.style.background = '';
      btn.textContent = '📋 Copy to Clipboard';
    }, 1500);
  }
});

// Export single Pokémon card as PNG on click after export button is pressed
const exportBtn = document.getElementById('exportPngBtn');
let exportMode = false;

if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    exportMode = true;
    document.body.style.cursor = 'crosshair';
    const cards = document.querySelectorAll('.pokemon-card');
    cards.forEach(card => {
      card.classList.add('export-selectable');
      card.title = 'Click to export this card as PNG';
    });
    // Use event delegation for card click
    document.addEventListener('click', exportDelegatedHandler, { capture: true });
  });
}

function exportDelegatedHandler(e) {
  const card = e.target.closest('.pokemon-card.export-selectable');
  if (exportMode && card) {
    e.stopPropagation();
    exportCardHandler(card);
    cleanupExportMode();
  } else if (exportMode) {
    // Clicked outside any selectable card, cancel export mode
    cleanupExportMode();
  }
}

function highlightCard(e) {
  e.currentTarget.style.boxShadow = '0 0 0 4px var(--accent, #ff9800), 0 4px 24px rgba(0,0,0,0.18)';
  e.currentTarget.style.transform = 'scale(1.03)';
}
function unhighlightCard(e) {
  e.currentTarget.style.boxShadow = '';
  e.currentTarget.style.transform = '';
}

// Modified exportCardHandler to accept card element directly
function exportCardHandler(card) {
  card.classList.remove('export-selectable');
  card.classList.add('export-for-png');
  card.classList.add('force-glow');
  // --- Ensure accent color is set inline for html2canvas ---
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent');
  card.style.setProperty('--accent', accent);
  card.style.opacity = '1';
  card.style.transform = 'none';
  card.style.animation = 'none';
  card.style.animationDelay = '0s';
  card.querySelectorAll('*').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.animation = 'none';
    el.style.animationDelay = '0s';
  });
  // Get Pokémon name for filename
  const nameElem = card.querySelector('.card-header h2');
  let monName = 'pokemon-card';
  if (nameElem) {
    monName = nameElem.textContent.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase();
  }
  setTimeout(() => {
    // Always select the first img (the sprite)
    const img = card.querySelector('img');
if (img) {
  // Remove forced inline sizing for export so html2canvas uses natural size
  img.style.width = '';
  img.style.height = '';
  img.style.objectFit = '';
}

if (img && !img.complete) {
  img.onload = () => doExport();
  img.onerror = () => doExport();
} else {
  doExport();
}

    function doExport() {
      if (window.html2canvas) {
        html2canvas(card, {
          backgroundColor: '#23272e',
          useCORS: true,
          scale: 2,
          imageTimeout: 2000,
          allowTaint: false,
          logging: false
        }).then(canvas => {
          card.classList.remove('export-for-png');
          card.classList.remove('force-glow'); // Remove after export
          card.style.boxShadow = '';
          card.style.filter = '';
          card.style.opacity = '';
          card.style.transform = '';
          card.style.animation = '';
          card.style.animationDelay = '';
          card.querySelectorAll('*').forEach(el => {
            el.style.opacity = '';
            el.style.transform = '';
            el.style.animation = '';
            el.style.animationDelay = '';
          });
          const link = document.createElement('a');
          link.download = monName + '.png';
          link.href = canvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }).catch(() => {
          card.classList.remove('export-for-png');
          card.classList.remove('force-glow');
          card.style.boxShadow = '';
          card.style.filter = '';
          card.style.opacity = '';
          card.style.transform = '';
          card.style.animation = '';
          card.style.animationDelay = '';
          card.querySelectorAll('*').forEach(el => {
            el.style.opacity = '';
            el.style.transform = '';
            el.style.animation = '';
            el.style.animationDelay = '';
          });
          alert('Export failed. Try again.');
        });
      } else {
        card.classList.remove('export-for-png');
        card.classList.remove('force-glow');
        card.style.boxShadow = '';
        card.style.filter = '';
        card.style.opacity = '';
        card.style.transform = '';
        card.style.animation = '';
        card.style.animationDelay = '';
        card.querySelectorAll('*').forEach(el => {
          el.style.opacity = '';
          el.style.transform = '';
          el.style.animation = '';
          el.style.animationDelay = '';
        });
        alert('Export feature not loaded yet.');
      }
    }
  }, 30);
}

function cleanupExportMode() {
  exportMode = false;
  document.body.style.cursor = '';
  const cards = document.querySelectorAll('.pokemon-card');
  cards.forEach(card => {
    card.classList.remove('export-selectable');
    card.title = '';
    card.style.boxShadow = '';
    card.style.transform = '';
  });
  document.removeEventListener('click', exportDelegatedHandler, { capture: true });
}

// Add export-selectable style and subtle glow
const style = document.createElement('style');
style.textContent = `
.pokemon-card.export-selectable {
  cursor: pointer !important;
  filter: brightness(1.08) drop-shadow(0 0 8px var(--accent, #ff9800));
  box-shadow: 0 0 0 4px var(--accent, #ff9800), 0 4px 24px rgba(0,0,0,0.18) !important;
  transition: box-shadow 0.2s, filter 0.2s;
  z-index: 2000;
}
.pokemon-card.export-selectable:active,
.pokemon-card.export-selectable:focus {
  outline: none !important;
  box-shadow: 0 0 0 4px var(--accent, #ff9800), 0 4px 24px rgba(0,0,0,0.18) !important;
}
`;
document.head.appendChild(style);

// === Animated Sprites Button Logic (with localStorage, default true) ===
function updateAllSprites() {
  const aniMode = (function() {
    const val = localStorage.getItem('neopaste-ani-sprites');
    if (val === null) return true;
    return val === 'true';
  })();
  document.querySelectorAll('.pokemon-card > img:not(.item-icon)').forEach(img => {
    const name = img.getAttribute('data-pokemon-name');
    const isShiny = img.getAttribute('data-shiny') === '1';
    if (!name) return;
    const showdownName = (window.toSpriteId ? window.toSpriteId(name) : name.toLowerCase().replace(/[^a-z0-9-]/g, ""));
    const staticSrc = isShiny
      ? `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(`https://play.pokemonshowdown.com/sprites/gen5-shiny/${showdownName}.png`)}`
      : `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(`https://play.pokemonshowdown.com/sprites/gen5/${showdownName}.png`)}`;
    if (aniMode) {
      const gen5AniSrc = isShiny
        ? `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(`https://play.pokemonshowdown.com/sprites/gen5ani-shiny/${showdownName}.gif`)}`
        : `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(`https://play.pokemonshowdown.com/sprites/gen5ani/${showdownName}.gif`)}`;
      const fallbackAniSrc = isShiny
        ? `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(`https://play.pokemonshowdown.com/sprites/ani-shiny/${showdownName}.gif`)}`
        : `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(`https://play.pokemonshowdown.com/sprites/ani/${showdownName}.gif`)}`;
      img.src = gen5AniSrc;
      img.style.width = '120px';
      img.style.height = '120px';
      img.style.objectFit = 'contain';
      img.onerror = function() {
        img.onerror = function() {
          img.src = staticSrc;
          img.style.width = '';
          img.style.height = '';
          img.style.objectFit = '';
          img.onerror = null;
        };
        img.src = fallbackAniSrc;
      };
    } else {
      img.src = staticSrc;
      img.style.width = '';
      img.style.height = '';
      img.style.objectFit = '';
      img.onerror = null;
    }
  });
}
window.updateAllSprites = updateAllSprites;

document.addEventListener('DOMContentLoaded', function() {
  const aniBtn = document.getElementById('toggle-ani-sprites');
  if (!aniBtn) return;
  const STORAGE_KEY = 'neopaste-ani-sprites';
  function getAniPref() {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === null) return true; // default to true
    return val === 'true';
  }
  function setAniPref(val) {
    localStorage.setItem(STORAGE_KEY, val ? 'true' : 'false');
  }
  let aniMode = getAniPref();
  aniBtn.textContent = aniMode ? 'Static Sprites' : 'Animated Sprites';
  updateAllSprites();
  aniBtn.addEventListener('click', function() {
    aniMode = !aniMode;
    setAniPref(aniMode);
    aniBtn.textContent = aniMode ? 'Static Sprites' : 'Animated Sprites';
    updateAllSprites();
  });
});
function checkForSecretButton(author) {
  const secretLinks = {
    'Whimsy': [
      { label: 'Visit the creator!', url: 'https://www.twitch.tv/whimsygaming1314' }
    ],
    'whimsy': [
      { label: 'Visit the creator!', url: 'https://www.twitch.tv/whimsygaming1314' }
    ],
    'Izya': [
      { label: 'Visit the creator!', url: 'https://www.twitch.tv/izyalovesgothmommies' }
    ],
    'katakuna_64': [
      { label: 'Visit the creator!', url: 'https://www.twitch.tv/katakuna_64' }
    ]
    
  };

  // Use the author parameter directly instead of reading from DOM
  const authorName = author ? author.toLowerCase() : '';

  const secretContainer = document.getElementById('secret-btns');

  if (secretContainer && secretLinks[authorName]) {
    // Clear any existing buttons
    secretContainer.innerHTML = '';
    
    secretLinks[authorName].forEach(link => {
      const btn = document.createElement('button');
      btn.textContent = link.label;
      btn.className = 'secret-btn';
      btn.addEventListener('click', () => {
        window.open(link.url, '_blank');
      });
      secretContainer.appendChild(btn);
    });
  }
}
const btn = document.createElement('button');
btn.textContent = link.label;
btn.className = 'secret-btn';
btn.addEventListener('click', () => {
  window.open(link.url, '_blank');
});
secretContainer.appendChild(btn);

// === Open in Calculator Button Logic ===
(function() {
  const openCalcBtn = document.getElementById('openCalcBtn');
  if (!openCalcBtn) return;

  function showIfExtensionPresent() {
    if (document.querySelector('meta[name="neoShowdownExtPresent"]')) {
      openCalcBtn.style.display = '';
      return true;
    }
    return false;
  }

  if (!showIfExtensionPresent()) {
    // If not present, observe for it
    const observer = new MutationObserver(() => {
      if (showIfExtensionPresent()) observer.disconnect();
    });
    observer.observe(document.head, { childList: true });
  }

  let calculatorMode = false;
  openCalcBtn.addEventListener('click', () => {
    calculatorMode = true;
    document.body.style.cursor = 'crosshair';
    const cards = document.querySelectorAll('.pokemon-card');
    cards.forEach(card => {
      card.classList.add('calculator-selectable');
      card.title = 'Click to open this set in the Showdown Calculator';
    });
    document.addEventListener('click', calculatorDelegatedHandler, { capture: true });
  });
  function calculatorDelegatedHandler(e) {
    const card = e.target.closest('.pokemon-card.calculator-selectable');
    if (calculatorMode && card) {
      e.stopPropagation();
      exportToCalculator(card);
      cleanupCalculatorMode();
    } else if (calculatorMode) {
      // Clicked outside any selectable card, cancel calculator mode
      cleanupCalculatorMode();
    }
  }
  function exportToCalculator(card) {
    // Use card index to get the correct block from window.rawPasteText
    const cards = Array.from(document.querySelectorAll('.pokemon-card'));
    const idx = cards.indexOf(card);
    if (idx === -1) return;
    const blocks = (window.rawPasteText || '').trim().split(/\n\s*\n/);
    const setText = blocks[idx] || '';
    if (!setText) return;

    fetch('https://neocalc.agastyawastaken.workers.dev/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: setText
    })
      .then(res => res.text())
      .then(token => {
        if (token && token.length < 32) {
          window.open(`https://calc.pokemonshowdown.com/?neopaste=${encodeURIComponent(token)}`, '_blank');
        } else {
          alert('Failed to get token from worker.');
        }
      })
      .catch(() => alert('Failed to contact worker.'));
  }
  function cleanupCalculatorMode() {
    calculatorMode = false;
    document.body.style.cursor = '';
    const cards = document.querySelectorAll('.pokemon-card');
    cards.forEach(card => {
      card.classList.remove('calculator-selectable');
      card.title = '';
      card.style.boxShadow = '';
      card.style.transform = '';
    });
    document.removeEventListener('click', calculatorDelegatedHandler, { capture: true });
  }
})();

loadPaste();
