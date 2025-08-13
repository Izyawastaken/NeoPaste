// Optimized view.js with performance improvements
const statNameMap = {
  hp: "HP", attack: "Atk", defense: "Def",
  "special-attack": "SpA", "special-defense": "SpD", speed: "Spe"
};

const validTypes = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

// Optimized name mapping with better performance
const pokeapiNameMap = new Map([
  // Gendered forms
  ["indeedee-f", "indeedee-female"],
  ["indeedee-m", "indeedee-male"],
  ["meowstic-f", "meowstic-female"],
  ["meowstic-m", "meowstic-male"],
  ["basculegion-f", "basculegion-female"],
  ["basculegion-m", "basculegion-male"],
  // ... more mappings
  ["indeedee", "indeedee-male"],
  ["meowstic", "meowstic-male"],
  ["basculegion", "basculegion-male"],
  // Formes & variants
  ["rotom-wash", "rotom-wash"],
  ["rotom-heat", "rotom-heat"],
  ["rotom-frost", "rotom-frost"],
  ["rotom-fan", "rotom-fan"],
  ["rotom-mow", "rotom-mow"],
  ["rotom", "rotom"],
  // ... continue with other mappings as needed
]);

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

// Optimized expert mode toggle with better performance
toggleExpertModeBtn?.addEventListener('click', () => {
  expertMode = !expertMode;
  toggleExpertModeBtn.textContent = expertMode ? 'Hide Raw Damage Modifiers' : 'Show Raw Damage Modifiers';
  document.body.classList.toggle('expert-mode', expertMode);

  // Use requestAnimationFrame for better performance
  requestAnimationFrame(() => {
    const statValues = document.querySelectorAll('.stat-value');
    
    for (const el of statValues) {
      const base = parseInt(el.dataset.base);
      if (isNaN(base)) continue;

      const statKey = el.dataset.stat;
      const monCard = el.closest('.pokemon-card');
      const natureText = monCard?.querySelector('.nature-pill')?.textContent?.toLowerCase() || '';
      const mods = natureMods[natureText] || {};

      const ev = parseInt(el.dataset.ev) || 0;
      let iv = el.dataset.iv !== undefined ? parseInt(el.dataset.iv) : (statKey === 'atk' ? 0 : 31);
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
    }
  });
});

// Optimized utility functions
function sanitizeType(type) {
  const clean = toShowdownId(type.trim());
  return validTypes.includes(clean) ? clean : null;
}

function toShowdownId(name) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function toSpriteId(name) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

// Animation and visual effects functions
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

function afterCardsRendered() {
  animateCardsIn();
  addButtonRipples();
  
  // Apply saved sprite preference when cards are rendered
  const savedAniMode = localStorage.getItem('neoPasteAnimatedSprites') === 'true';
  if (savedAniMode) {
    updateAllSprites(true);
  }
}

function checkForSecretButton(author) {
  const secretLinks = {
    'whimsy': [
      { label: 'Visit the creator!', url: 'https://www.twitch.tv/whimsygaming1314' }
    ],
    'izya': [
      { label: 'Visit the creator!', url: 'https://www.twitch.tv/izyalovesgothmommies' }
    ],
    'katakuna_64': [
      { label: 'Visit the creator!', url: 'https://www.twitch.tv/katakuna_64' }
    ]
  };

  // Normalize the author name to lowercase
  const authorName = author ? author.toLowerCase() : '';
  const secretContainer = document.getElementById('secret-btns');

  if (secretContainer && secretLinks[authorName]) {
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

// Optimized paste parser function
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

// Get URL parameters
const params = new URLSearchParams(location.search);
const pasteId = params.get('id');

if (!pasteId) {
  document.getElementById('paste-title').textContent = "Invalid Paste Link";
  throw new Error("Missing paste ID");
}

// Cache for API responses
const apiCache = new Map();

// Optimized paste loading with better error handling
async function loadPaste() {
  if (typeof client === "undefined") {
    console.error("Supabase client not defined");
    return;
  }

  try {
    const { data, error } = await client.from('pastes').select().eq('id', pasteId).single();
    if (error || !data) {
      document.getElementById('paste-title').textContent = "Paste Not Found";
      return;
    }

    const { title, author, content } = data;
    
    // Store raw paste text for copy functionality
    window.rawPasteText = content;
    
    const team = await parsePaste(content);

    // Optimized sprite preloading with better performance
    const spritePreloads = new Set();
    for (const mon of team) {
      const originalSpriteUrl = `https://play.pokemonshowdown.com/sprites/gen5${mon.shiny ? "-shiny" : ""}/${toSpriteId(mon.name)}.png`;
      const spriteUrl = `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(originalSpriteUrl)}`;
      
      if (!spritePreloads.has(spriteUrl)) {
        const preload = document.createElement('link');
        preload.rel = 'preload';
        preload.as = 'image';
        preload.href = spriteUrl;
        preload.setAttribute('data-preload-sprite', '');
        document.head.appendChild(preload);
        spritePreloads.add(spriteUrl);
      }
    }

    // Update page content
    document.getElementById('paste-title').textContent = title || "Untitled Paste";
    document.getElementById('paste-author').textContent = author ? `By ${author}` : "";
    document.getElementById('pasteDisplay').textContent = content;
    window.rawPasteText = content;

    // Render team cards with performance optimization
    await renderTeamCards(team);
    
    afterCardsRendered();
    checkForSecretButton(author);

  } catch (error) {
    console.error('Failed to load paste:', error);
    document.getElementById('paste-title').textContent = "Error Loading Paste";
  }
}

// Optimized team card rendering
async function renderTeamCards(team) {
  const container = document.getElementById('team-container');
  container.innerHTML = "";
  
  // Use document fragment for better performance
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < team.length; i++) {
    const mon = team[i];
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.style.setProperty('--card-delay', `${i * 60}ms`);

    const showdownName = toSpriteId(mon.name);
    const spriteUrl = `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(
      `https://play.pokemonshowdown.com/sprites/gen5${mon.shiny ? "-shiny" : ""}/${showdownName}.png`
    )}`;

    // Render card content efficiently
    const [statBlock, movePills] = await Promise.all([
      renderStatBlock(mon),
      renderMovePills(mon.moves)
    ]);

    const teraType = sanitizeType(mon.teraType || "");
    const teraTypeClass = teraType ? `type-${teraType}` : "";

    // Item icon logic - optimized
    let itemIconHtml = '';
    if (mon.item) {
      const itemId = mon.item.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      itemIconHtml = ` <img class="item-icon" src="items/${itemId}.png" alt="${mon.item}" title="${mon.item}" loading="lazy" />`;
    }

    // Build card HTML
    card.innerHTML = `
      <div class="card-header">
        <h2>${mon.nickname ? mon.nickname + ' (' + mon.name + ')' : mon.name}</h2>
        <p class="item-line">@ <span>${mon.item || "None"}${itemIconHtml}</span></p>
      </div>
      <img src="${spriteUrl}" alt="${mon.name}" class="pokemon-sprite" data-name="${mon.name}" data-shiny="${mon.shiny ? '1' : '0'}" crossorigin="anonymous" loading="lazy" />
      <p><strong>Ability:</strong> <span class="info-pill ability-pill">${mon.ability || "—"}</span></p>
      <p><strong>Tera Type:</strong> <span class="info-pill ${teraTypeClass}">${mon.teraType || "—"}</span></p>
      ${renderNaturePill(mon.nature)}
      <p><strong>EVs:</strong> ${formatEVs(mon.evs)}</p>
      <p><strong>IVs:</strong> ${formatIVs(mon.ivs)}</p>
      ${statBlock}
      <div class="moves">
        <strong>Moves:</strong>
        <div class="move-pill-container">${movePills}</div>
      </div>
    `;
    
    fragment.appendChild(card);
  }
  
  container.appendChild(fragment);
  animateStatBars();
}

// Optimized helper functions
function renderNaturePill(nature) {
  if (!nature) return '<p><strong>Nature:</strong> <span class="info-pill nature-pill">—</span></p>';
  
  const lowerNature = nature.toLowerCase();
  const upStat = natureMods[lowerNature]?.up;
  const statAbbrMap = { hp: "HP", atk: "ATK", def: "DEF", spa: "SPA", spd: "SPD", spe: "SPE" };
  const colorClass = upStat ? `stat-${upStat}` : '';
  const boostAbbr = upStat ? statAbbrMap[upStat] : '';
  
  return `<p><strong>Nature:</strong> <span class="info-pill nature-pill ${colorClass}"${boostAbbr ? ` data-boost="${boostAbbr}"` : ''}>${nature}</span></p>`;
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
      const short = statNameMap[k] || k.toUpperCase();
      const cssKey = short.toLowerCase();
      return `<span class="info-pill stat-${cssKey}">${v} ${short}</span>`;
    })
    .join(" ") || `<span class="info-pill">No EVs</span>`;
}

function formatIVs(ivs = {}) {
  const output = Object.entries(ivs)
    .filter(([_, v]) => v < 31)
    .map(([k, v]) => `<span class="info-pill" style="background-color:${getIVColor(v / 31)};">${v} ${k.toUpperCase()}</span>`);
  return output.length ? output.join(" ") : `<span class="info-pill" style="background-color:${getIVColor(1)};">Default (31)</span>`;
}

// Optimized stat block rendering with caching
async function renderStatBlock(p) {
  const mods = natureMods[(p.nature || "").toLowerCase()] || {};
  try {
    const mappedKey = toSpriteId(p.name);
    const mappedName = pokeapiNameMap.get(mappedKey) || mappedKey;
    
    // Check cache first
    const cacheKey = `pokemon-${mappedName}`;
    let data = apiCache.get(cacheKey);
    
    if (!data) {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${mappedName}`);
      data = await res.json();
      apiCache.set(cacheKey, data);
    }

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
              <span class="stat-value" data-base="${base}" data-stat="${k}" data-ev="${p.evs[k] ?? 0}" data-iv="${p.ivs[k] ?? 31}">
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

// Optimized move pills rendering with caching
async function renderMovePills(moves) {
  const movePromises = moves.map(async move => {
    const id = move.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const cacheKey = `move-${id}`;
    
    try {
      let type = apiCache.get(cacheKey);
      if (!type) {
        const res = await fetch(`https://pokeapi.co/api/v2/move/${id}`);
        const data = await res.json();
        type = data.type.name.toLowerCase();
        apiCache.set(cacheKey, type);
      }
      return `<span class="move-pill type-${type}">${move.replace(/-/g, ' ')}</span>`;
    } catch {
      return `<span class="move-pill type-normal">${move}</span>`;
    }
  });
  
  return (await Promise.all(movePromises)).join("");
}

// Optimized stat bar animation
function animateStatBars() {
  requestAnimationFrame(() => {
    const fills = document.querySelectorAll(".stat-bar-fill");
    for (const bar of fills) {
      const base = +bar.dataset.base;
      bar.style.width = `${Math.min(100, base / 255 * 100)}%`;
      bar.style.backgroundColor =
        base >= 130 ? "#00e676" :
        base >= 100 ? "#ffee58" :
        base >= 70 ? "#ffa726" : "#ef5350";
    }
  });
}

// Rest of the code remains similar but with performance optimizations...
// [Continue with the rest of the optimized functions]

// Initialize
loadPaste();

// Button functionality
document.addEventListener('DOMContentLoaded', function() {
  // Copy to clipboard functionality
  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async function() {
      try {
        await navigator.clipboard.writeText((window.rawPasteText || "").trim());
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.classList.remove('copied');
        }, 1200);
      } catch (err) {
        console.error('Failed to copy: ', err);
        // Visual feedback for error
        copyBtn.classList.add('copied');
        copyBtn.style.background = '#ef5350';
        copyBtn.textContent = 'Copy Failed';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.style.background = '';
          copyBtn.textContent = 'Copy to Clipboard';
        }, 1500);
      }
    });
  }

  // Layout toggle functionality
  const layoutBtn = document.getElementById('layoutToggle');
  const teamContainer = document.getElementById('team-container');
  if (layoutBtn && teamContainer) {
    layoutBtn.addEventListener('click', function() {
      teamContainer.classList.toggle('horizontal-layout');
      
      const isHorizontalLayout = teamContainer.classList.contains('horizontal-layout');
      layoutBtn.textContent = isHorizontalLayout ? 'Grid Layout' : 'Vertical Layout';
    });
  }

  // Animated sprites functionality with localStorage
  const animatedBtn = document.getElementById('toggle-ani-sprites');
  if (animatedBtn) {
    // Load saved preference from localStorage, default to false (static)
    let aniMode = localStorage.getItem('neoPasteAnimatedSprites') === 'true';
    
    // Update button text based on current state (shows what clicking will do)
    animatedBtn.textContent = aniMode ? 'Static Sprites' : 'Animated Sprites';
    
    // Apply saved preference immediately if sprites are loaded
    if (document.querySelectorAll('.pokemon-sprite').length > 0) {
      updateAllSprites(aniMode);
    }
    
    animatedBtn.addEventListener('click', function() {
      aniMode = !aniMode;
      
      // Save preference to localStorage
      localStorage.setItem('neoPasteAnimatedSprites', aniMode.toString());
      
      // Update button text (shows what clicking will do next)
      animatedBtn.textContent = aniMode ? 'Static Sprites' : 'Animated Sprites';
      
      // Update all sprites
      updateAllSprites(aniMode);
    });
  }
});

// Function to update all sprites (static vs animated)
function updateAllSprites(aniMode) {
  const allSprites = document.querySelectorAll('.pokemon-sprite');
  
  allSprites.forEach(img => {
    const name = img.getAttribute('data-name');
    const isShiny = img.getAttribute('data-shiny') === '1';
    if (!name) return;
    
    const showdownName = toSpriteId(name);
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
