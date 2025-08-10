import React, { useEffect, useState } from "react";
import "../view.css";
import { useSearchParams } from "react-router-dom";
import { supabaseClient } from "../config";

const statNameMap: Record<string, string> = {
  hp: "HP", attack: "Atk", defense: "Def",
  "special-attack": "SpA", "special-defense": "SpD", speed: "Spe"
};
const validTypes = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy"
];
const pokeapiNameMap: Record<string, string> = {
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
  "indeedee": "indeedee-male",
  "meowstic": "meowstic-male",
  "basculegion": "basculegion-male",
  "oinkologne": "oinkologne-male",
  "frillish": "frillish-male",
  "jellicent": "jellicent-male",
  "pyroar": "pyroar-male",
  "unfezant": "unfezant-male",
  "rotom-wash": "rotom-wash",
  "rotom-heat": "rotom-heat",
  "rotom-frost": "rotom-frost",
  "rotom-fan": "rotom-fan",
  "rotom-mow": "rotom-mow",
  "rotom": "rotom",
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
  "basculin-red-striped": "basculin-red-striped",
  "basculin": "basculin-red-striped",
  "lycanroc-midnight": "lycanroc-midnight",
  "lycanroc-dusk": "lycanroc-dusk",
  "lycanroc": "lycanroc",
  "darmanitan-galar": "darmanitan-galar",
  "darmanitan-galar-zen": "darmanitan-galar-zen",
  "darmanitan": "darmanitan",
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
  "zygarde": "zygarde",
  "polteageist-antique": "polteageist",
  "polteageist": "polteageist",
  "sinistea-antique": "sinistea",
  "sinistea": "sinistea",
  "minior-red": "minior-red-meteor",
  "minior": "minior-red-meteor",
  "mimikyu-busted": "mimikyu-busted",
  "mimikyu": "mimikyu-disguised",
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
const natureMods: Record<string, { up: string; down: string }> = {
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

function toShowdownId(name: string) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}
function toSpriteId(name: string) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]/g, "");
}
function sanitizeType(type: string) {
  const clean = toShowdownId(type.trim());
  return validTypes.includes(clean) ? clean : null;
}
function getIVColor(percent: number) {
  const r = percent < 0.5 ? 255 : Math.round(510 * (1 - percent));
  const g = percent < 0.5 ? Math.round(510 * percent) : 255;
  return `rgb(${r}, ${g}, 100)`;
}
function formatEVs(evs: Record<string, number> = {}) {
  return Object.entries(evs)
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => {
      const shortKey = k.toLowerCase();
      const short = statNameMap[k] || shortKey;
      const cssKey = short.toLowerCase();
      return <span className={`info-pill stat-${cssKey}`} key={k}>{v} {short}</span>;
    });
}
function formatIVs(ivs: Record<string, number> = {}) {
  const output = Object.entries(ivs)
    .filter(([_, v]) => v < 31)
    .map(([k, v]) => <span className="info-pill" style={{ backgroundColor: getIVColor(v / 31) }} key={k}>{v} {k.toUpperCase()}</span>);
  return output.length ? output : <span className="info-pill" style={{ backgroundColor: getIVColor(1) }}>Default (31)</span>;
}

type Mon = {
  name: string;
  nickname: string;
  gender: string | null;
  item: string;
  ability: string;
  shiny: boolean;
  teraType: string;
  evs: Record<string, number>;
  ivs: Record<string, number>;
  nature: string;
  moves: string[];
};
type PasteData = {
  title: string;
  author: string;
  content: string;
};
function parsePaste(text: string): Mon[] {
  const blocks = text.trim().split(/\n\s*\n/);
  return blocks.map(block => {
    const lines = block.trim().split("\n").map(line => line.trim());
    const mon: Mon = {
      name: "", nickname: "", gender: null, item: "", ability: "", shiny: false,
      teraType: "", evs: {}, ivs: {}, nature: "", moves: []
    };
    const [nameLine, ...rest] = lines;
    const [namePart, item] = nameLine.split(" @ ");
    mon.item = item?.trim() || "";
    const parens = [...namePart.matchAll(/\(([^)]+)\)/g)].map(m => m[1].trim());
    const baseName = namePart.replace(/\s*\([^)]*\)/g, '').trim();
    let gender = null;
    if (parens.length > 0 && ["M", "F"].includes(parens[parens.length - 1])) {
      gender = parens.pop();
    }
  mon.gender = gender ?? null;
    let species = parens.length ? parens.pop()! : baseName;
    mon.name = species;
    mon.nickname = parens.length ? `${baseName} (${parens.join(") (")})` : baseName;
    if (mon.nickname === mon.name) mon.nickname = "";
    mon.nickname = parens.length > 0
      ? `${baseName} (${parens.join(") (")})`
      : (mon.name !== baseName ? baseName : "");
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

const ViewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const pasteId = searchParams.get("id");
  const [paste, setPaste] = useState<PasteData | null>(null);
  const [team, setTeam] = useState<Mon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statBlocks, setStatBlocks] = useState<Record<number, React.ReactNode>>({});
  const [movePills, setMovePills] = useState<Record<number, React.ReactNode[]>>({});

  useEffect(() => {
    if (!pasteId) {
      setError("Invalid Paste Link");
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabaseClient.from('pastes').select().eq('id', pasteId).single();
      if (error || !data) {
        setError("Paste Not Found");
        setLoading(false);
        return;
      }
      setPaste({ title: data.title, author: data.author, content: data.content });
      const parsed = parsePaste(data.content);
      setTeam(parsed);
      setLoading(false);
      parsed.forEach(async (mon, i) => {
        // Stat block
        try {
          const mods = natureMods[(mon.nature || "").toLowerCase()] || {};
          const mappedKey = toSpriteId(mon.name);
          const mappedName = pokeapiNameMap[mappedKey] || mappedKey;
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${mappedName}`);
          const data = await res.json();
          setStatBlocks(prev => ({ ...prev, [i]: (
            <div className="stat-block">
              {data.stats.map((s: any) => {
                const raw = s.stat.name;
                const short = statNameMap[raw] || raw.toUpperCase();
                const base = s.base_stat;
                const k = short.toLowerCase();
                const mod = k === mods.up ? "+" : k === mods.down ? "−" : "";
                return (
                  <div className="stat-line" key={k}>
                    <span className={`stat-label ${k}`}>{short}</span>
                    <div className="stat-bar"><div className="stat-bar-fill" data-base={base}></div></div>
                    {mod ? <span className={`stat-modifier ${mod === "+" ? "plus" : "minus"}`}>{mod}</span> : null}
                    <span className="stat-value"
                      data-base={base}
                      data-stat={k}
                      data-ev={mon.evs[k] ?? 0}
                      data-iv={mon.ivs[k] ?? 31}
                    >{base}</span>
                  </div>
                );
              })}
            </div>
          ) }));
        } catch {
          setStatBlocks(prev => ({ ...prev, [i]: <p>Failed to load stats for {mon.name}</p> }));
        }
        // Move pills
        const moves = await Promise.all(mon.moves.map(async move => {
          const id = move.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          try {
            const res = await fetch(`https://pokeapi.co/api/v2/move/${id}`);
            const { type } = await res.json();
            return <span className={`move-pill type-${type.name.toLowerCase()}`} key={move}>{move.replace(/-/g, ' ')}</span>;
          } catch {
            return <span className="move-pill type-normal" key={move}>{move}</span>;
          }
        }));
        setMovePills(prev => ({ ...prev, [i]: moves }));
      });
    })();
  }, [pasteId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container">
      <h1 id="paste-title">{paste?.title || "Untitled Paste"}</h1>
      <div id="paste-author">{paste?.author ? `By ${paste.author}` : ""}</div>
      <div id="pasteDisplay" style={{ margin: '1rem 0', fontFamily: 'monospace', whiteSpace: 'pre-wrap', opacity: 0.7 }}>{paste?.content}</div>
      <div id="team-container">
        {team.map((mon, i) => {
          const showdownName = toSpriteId(mon.name);
          const originalSpriteUrl = mon.shiny
            ? `https://play.pokemonshowdown.com/sprites/gen5-shiny/${showdownName}.png`
            : `https://play.pokemonshowdown.com/sprites/gen5/${showdownName}.png`;
          const finalSpriteUrl = `https://neopasteexportpngproxy.agastyawastaken.workers.dev/?url=${encodeURIComponent(originalSpriteUrl)}`;
          const teraType = sanitizeType(mon.teraType || "");
          const teraTypeClass = teraType ? `type-${teraType}` : "";
          let itemIconHtml = null;
          if (mon.item) {
            const itemId = mon.item.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
            const itemUrl = `items/${itemId}.png`;
            itemIconHtml = <img className="item-icon" src={itemUrl} alt={mon.item} title={mon.item} loading="lazy" />;
          }
          const nature = mon.nature?.toLowerCase();
          const upStat = natureMods[nature]?.up;
          const statAbbrMap: Record<string, string> = { hp: "HP", atk: "ATK", def: "DEF", spa: "SPA", spd: "SPD", spe: "SPE" };
          const colorClass = upStat ? `stat-${upStat}` : '';
          const boostAbbr = upStat && statAbbrMap[upStat as keyof typeof statAbbrMap] ? statAbbrMap[upStat as keyof typeof statAbbrMap] : '';
          return (
            <div className="pokemon-card" key={i}>
              <div className="card-header">
                <h2>{mon.nickname ? `${mon.nickname} (${mon.name})` : mon.name}</h2>
                <p className="item-line">@ <span>{mon.item || "None"}{itemIconHtml}</span></p>
              </div>
              <img src={finalSpriteUrl} alt={mon.name} data-pokemon-name={mon.name} data-shiny={mon.shiny ? '1' : '0'} crossOrigin="anonymous" />
              <p><strong>Ability:</strong> <span className="info-pill ability-pill">{mon.ability || "—"}</span></p>
              <p><strong>Tera Type:</strong> <span className={`info-pill ${teraTypeClass}`}>{mon.teraType || "—"}</span></p>
              <p><strong>Nature:</strong> <span className={`info-pill nature-pill ${colorClass}`} data-boost={boostAbbr}>{mon.nature || "—"}</span></p>
              <p><strong>EVs:</strong> {formatEVs(mon.evs)}</p>
              <p><strong>IVs:</strong> {formatIVs(mon.ivs)}</p>
              {statBlocks[i]}
              <div className="moves">
                <strong>Moves:</strong>
                <div className="move-pill-container">{movePills[i]}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ViewPage;
