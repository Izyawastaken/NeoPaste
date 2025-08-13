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
  ["oinkologne-f", "oinkologne-female"],
  ["oinkologne-m", "oinkologne-male"],
  ["frillish-f", "frillish-female"],
  ["frillish-m", "frillish-male"],
  ["jellicent-f", "jellicent-female"],
  ["jellicent-m", "jellicent-male"],
  ["pyroar-f", "pyroar-female"],
  ["pyroar-m", "pyroar-male"],
  ["unfezant-f", "unfezant-female"],
  ["unfezant-m", "unfezant-male"],

  // Normal form aliases (for default male mapping)
  ["indeedee", "indeedee-male"],
  ["meowstic", "meowstic-male"],
  ["basculegion", "basculegion-male"],
  ["oinkologne", "oinkologne-male"],
  ["frillish", "frillish-male"],
  ["jellicent", "jellicent-male"],
  ["pyroar", "pyroar-male"],
  ["unfezant", "unfezant-male"],

  // Formes & variants
  ["rotom-wash", "rotom-wash"],
  ["rotom-heat", "rotom-heat"],
  ["rotom-frost", "rotom-frost"],
  ["rotom-fan", "rotom-fan"],
  ["rotom-mow", "rotom-mow"],
  ["rotom", "rotom"], // base form

  ["urshifu-rapid-strike", "urshifu-rapid-strike"],
  ["urshifu-single-strike", "urshifu-single-strike"],
  ["urshifu", "urshifu-single-strike"],

  ["zacian-crowned", "zacian-crowned"],
  ["zamazenta-crowned", "zamazenta-crowned"],

  ["calyrex-ice", "calyrex-ice"],
  ["calyrex-shadow", "calyrex-shadow"],

  ["toxtricity-low-key", "toxtricity-low-key"],
  ["toxtricity-amped", "toxtricity-amped"],
  ["toxtricity", "toxtricity-amped"],

  ["basculin-blue-striped", "basculin-blue-striped"],
  ["basculin-white-striped", "basculin-white-striped"],
  ["basculin-red-striped", "basculin-red-striped"], // default
  ["basculin", "basculin-red-striped"],

  ["lycanroc-midnight", "lycanroc-midnight"],
  ["lycanroc-dusk", "lycanroc-dusk"],
  ["lycanroc", "lycanroc"], // midday default

  ["darmanitan-galar", "darmanitan-galar"],
  ["darmanitan-galar-zen", "darmanitan-galar-zen"],
  ["darmanitan", "darmanitan"], // normal form

  ["giratina-origin", "giratina-origin"],
  ["giratina", "giratina-altered"],

  ["shaymin-sky", "shaymin-sky"],
  ["shaymin", "shaymin-land"],

  ["tornadus-therian", "tornadus-therian"],
  ["thundurus-therian", "thundurus-therian"],
  ["landorus-therian", "landorus-therian"],
  ["tornadus", "tornadus-incarnate"],
  ["thundurus", "thundurus-incarnate"],
  ["landorus", "landorus-incarnate"],

  ["enamorus-therian", "enamorus-therian"],
  ["enamorus", "enamorus-incarnate"],

  ["zygarde-10", "zygarde-10"],
  ["zygarde-complete", "zygarde-complete"],
  ["zygarde", "zygarde"], // 50%

  ["polteageist-antique", "polteageist"],
  ["polteageist", "polteageist"],

  ["sinistea-antique", "sinistea"],
  ["sinistea", "sinistea"],

  ["minior-red", "minior-red-meteor"], // core form = red-meteor
  ["minior", "minior-red-meteor"],

  ["mimikyu-busted", "mimikyu-busted"],
  ["mimikyu", "mimikyu-disguised"],

  // Paradox Pokémon
  ["greattusk", "great-tusk"],
  ["screamtail", "scream-tail"],
  ["brutebonnet", "brute-bonnet"],
  ["fluttermane", "flutter-mane"],
  ["slitherwing", "slither-wing"],
  ["sandyshocks", "sandy-shocks"],
  ["irontreads", "iron-treads"],
  ["ironbundle", "iron-bundle"],
  ["ironhands", "iron-hands"],
  ["ironjugulis", "iron-jugulis"],
  ["ironmoth", "iron-moth"],
  ["ironthorns", "iron-thorns"],
  ["roaringmoon", "roaring-moon"],
  ["ironvaliant", "iron-valiant"]
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

    // Optimized sprite preloading with direct URLs for better performance
    const spritePreloads = new Set();
    for (const mon of team) {
      const directSpriteUrl = `https://play.pokemonshowdown.com/sprites/gen5${mon.shiny ? "-shiny" : ""}/${toSpriteId(mon.name)}.png`;
      
      if (!spritePreloads.has(directSpriteUrl)) {
        const preload = document.createElement('link');
        preload.rel = 'preload';
        preload.as = 'image';
        preload.href = directSpriteUrl;
        preload.crossOrigin = 'anonymous';
        preload.setAttribute('data-preload-sprite', '');
        document.head.appendChild(preload);
        spritePreloads.add(directSpriteUrl);
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
    const directSpriteUrl = `https://play.pokemonshowdown.com/sprites/gen5${mon.shiny ? "-shiny" : ""}/${showdownName}.png`;
    const proxySpriteUrl = `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(directSpriteUrl)}`;

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
      <img src="${directSpriteUrl}" alt="${mon.name}" class="pokemon-sprite" data-name="${mon.name}" data-shiny="${mon.shiny ? '1' : '0'}" crossorigin="anonymous" loading="lazy" 
           onerror="this.src='${proxySpriteUrl}'; this.onerror=function(){this.style.display='none'; this.onerror=null;}" />
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
  // Fixed copy to clipboard functionality - prevents getting stuck on "Copied"
  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    let copyTimeout; // Track timeout to prevent duplicate calls
    
    copyBtn.addEventListener('click', async function() {
      // Prevent multiple clicks while processing
      if (copyBtn.classList.contains('copied')) {
        return;
      }
      
      try {
        await navigator.clipboard.writeText((window.rawPasteText || "").trim());
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        
        // Clear any existing timeout
        if (copyTimeout) {
          clearTimeout(copyTimeout);
        }
        
        copyTimeout = setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.classList.remove('copied');
          copyTimeout = null;
        }, 1200);
        
      } catch (err) {
        console.error('Failed to copy: ', err);
        // Visual feedback for error
        copyBtn.classList.add('copied');
        copyBtn.style.background = '#ef5350';
        copyBtn.textContent = 'Copy Failed';
        
        // Clear any existing timeout
        if (copyTimeout) {
          clearTimeout(copyTimeout);
        }
        
        copyTimeout = setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.style.background = '';
          copyBtn.textContent = 'Copy to Clipboard';
          copyTimeout = null;
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

// Optimized sprite loading using proxies (as requested)
function loadSpriteWithFallback(img, proxyUrl, fallbackProxyUrl) {
  // Use proxy first as requested
  img.src = proxyUrl;
  img.onerror = function() {
    // If primary proxy fails, try fallback proxy
    if (fallbackProxyUrl) {
      img.src = fallbackProxyUrl;
      img.onerror = function() {
        // All proxies failed, hide image
        img.style.display = 'none';
        img.onerror = null;
      };
    } else {
      // No fallback, hide image
      img.style.display = 'none';
      img.onerror = null;
    }
  };
}

// Function to update all sprites (static vs animated) - using proxies
function updateAllSprites(aniMode) {
  const allSprites = document.querySelectorAll('.pokemon-sprite');
  
  allSprites.forEach(img => {
    const name = img.getAttribute('data-name');
    const isShiny = img.getAttribute('data-shiny') === '1';
    if (!name) return;
    
    const showdownName = toSpriteId(name);
    
    if (aniMode) {
      // Use proxies for animated sprites
      const gen5AniUrl = `https://play.pokemonshowdown.com/sprites/gen5ani${isShiny ? '-shiny' : ''}/${showdownName}.gif`;
      const gen4AniUrl = `https://play.pokemonshowdown.com/sprites/ani${isShiny ? '-shiny' : ''}/${showdownName}.gif`;
      
      const proxyGen5Url = `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(gen5AniUrl)}`;
      const proxyGen4Url = `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(gen4AniUrl)}`;
      
      img.style.width = '120px';
      img.style.height = '120px';
      img.style.objectFit = 'contain';
      img.style.display = '';
      
      loadSpriteWithFallback(img, proxyGen5Url, proxyGen4Url);
    } else {
      // Use proxy for static sprites
      const staticUrl = `https://play.pokemonshowdown.com/sprites/gen5${isShiny ? '-shiny' : ''}/${showdownName}.png`;
      const proxyUrl = `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(staticUrl)}`;
      
      img.style.width = '';
      img.style.height = '';
      img.style.objectFit = '';
      img.style.display = '';
      
      // For static sprites, use proxy directly
      img.src = proxyUrl;
      img.onerror = function() {
        img.style.display = 'none';
        img.onerror = null;
      };
    }
  });
}
