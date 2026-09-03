/**
 * Conversão de nomes de cor (pt-BR) em amostras visuais reais.
 *
 * O CRM guarda a variação como texto ("Verde Claro / Limão / Cinza Escuro").
 * Aqui traduzimos esse texto em cores CSS para as bolinhas da vitrine.
 * Se um termo não for reconhecido, ele simplesmente não vira bolinha —
 * nunca inventamos cor.
 */

const PLACEHOLDER = new Set(["#0f1720", "#000", "#000000", "#111"]);

/** Palavras que aparecem nas descrições mas não são cor. */
const STOPWORDS = new Set([
  "com","de","da","do","e","detalhe","detalhes","ponto","pontos","sola","solado",
  "tons","tom","acentos","accents","accent","metallic","metalico","metalica",
  "hiper","hyper","bright","light","dark","deep","soft","core","cloud","summit",
  "w","edition","edicao","nike","adidas","on","puma","asics","air","zoom","cut","ep",
  "shock","glow","foam","shimmer","varsity","university","racer","medium","one",
  "wonder","fluorescente","claro","clara","escuro","escura","medio","media",
]);

const BASE: Record<string, string> = {
  preto: "#111111",
  branco: "#F7F8F5",
  offwhite: "#EFEAE0",
  "off white": "#EFEAE0",
  creme: "#EFE6D2",
  gelo: "#EDF2F4",
  cinza: "#9AA3AB",
  chumbo: "#4A5259",
  grafite: "#3A4046",
  prata: "#C6CBD1",
  prateado: "#C6CBD1",
  dourado: "#D4AF37",
  ouro: "#D4AF37",
  bronze: "#A9722F",
  bege: "#D9C7A7",
  areia: "#DCCBA7",
  caramelo: "#B5722C",
  marrom: "#6B4326",
  gum: "#B07B4F",
  vermelho: "#D32F2F",
  bordo: "#6E1B22",
  vinho: "#6E1B22",
  coral: "#F06A5A",
  laranja: "#EF7A1A",
  amarelo: "#F2C21B",
  mostarda: "#D4A215",
  limao: "#C7F500",
  volt: "#C7F500",
  neon: "#C7F500",
  verde: "#2E9E56",
  militar: "#4A5533",
  oliva: "#6B7238",
  sequoia: "#3A4A3A",
  menta: "#7EEBC1",
  turquesa: "#00BFC6",
  ciano: "#00BFC6",
  azul: "#2563EB",
  marinho: "#16264A",
  "azul marinho": "#16264A",
  celeste: "#7FB6EE",
  roxo: "#7A4BD1",
  lilas: "#C3A7EE",
  lavanda: "#C9BCEB",
  violeta: "#8B5CF6",
  rosa: "#EE7DA8",
  pink: "#EC4899",
  magenta: "#C6248A",
  salmao: "#F3907A",
  nude: "#E3C4B0",
  transparente: "#D8DEE3",
  multicolor: "#8B5CF6",
  // termos em inglês usados pelas marcas
  black: "#111111",
  white: "#F7F8F5",
  sail: "#EFEAE0",
  bone: "#E4DACA",
  ivory: "#F1E8D8",
  cream: "#EFE6D2",
  grey: "#9AA3AB",
  gray: "#9AA3AB",
  silver: "#C6CBD1",
  gold: "#D4AF37",
  beige: "#D9C7A7",
  brown: "#6B4326",
  red: "#D32F2F",
  crimson: "#B0202A",
  orange: "#EF7A1A",
  yellow: "#F2C21B",
  lime: "#C7F500",
  green: "#2E9E56",
  teal: "#00A79D",
  mint: "#7EEBC1",
  blue: "#2563EB",
  navy: "#16264A",
  royal: "#1D4ED8",
  purple: "#7A4BD1",
  lavender: "#C9BCEB",
  violet: "#8B5CF6",
  ceramic: "#E7DCC8",
  sand: "#DCCBA7",
  khaki: "#B7A272",
  olive: "#6B7238",
  // termos reais do catálogo Maxor
  ruby: "#9B111E",
  burgundy: "#6E1B22",
  sage: "#9CAF88",
  cinder: "#5A554F",
  glacier: "#CFE3EC",
  ice: "#E4F1F6",
  flax: "#D9C08B",
  phantom: "#DCD6CB",
  alloy: "#8C8F92",
  obsidian: "#2B2F36",
  anthracite: "#3B3D40",
  antracite: "#3B3D40",
  gunmetal: "#4C5157",
  ash: "#B2B2AC",
  stucco: "#A79286",
  mauve: "#9C7C8C",
  indigo: "#3A3F8F",
  rose: "#E3A0A9",
  carmesim: "#B0202A",
  fuchsia: "#D2379B",
  fucsia: "#D2379B",
  maize: "#F4D35E",
  flame: "#E2542C",
  jade: "#2FA37A",
  lima: "#C7F500",
  earth: "#6B5B4B",
  fir: "#2F4A3A",
  fauna: "#6B4B37",
  drift: "#CFC6B8",
  silt: "#8C6A5D",
  smoke: "#8E9298",
  smoky: "#8E9298",
  concord: "#33256B",
  cactus: "#7C8A5B",
  electric: "#1E6BFF",
  tech: "#2A4E9B",
  halo: "#D6DBE0",
  glint: "#5E8FB5",
  lapis: "#2A4B9B",
  "azul lapis": "#2A4B9B",
  chocolate: "#4E342E",
  terracota: "#B4553A",
  petroleo: "#0F4C5C",
  aqua: "#7FD8DE",
  vinho2: "#5E1A25",
};

function strip(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shade(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const adj = (c: number) =>
    Math.max(0, Math.min(255, Math.round(amount > 0 ? c + (255 - c) * amount : c * (1 + amount))));
  const r = adj((n >> 16) & 255);
  const g = adj((n >> 8) & 255);
  const b = adj(n & 255);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Traduz um termo isolado ("Verde Claro") em cor CSS, ou null. */
export function colorNameToHex(term: string): string | null {
  const t = strip(term);
  if (!t) return null;
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(t)) {
    return PLACEHOLDER.has(t) ? null : t;
  }

  let modifier = 0;
  let base = t;
  if (/\bclar[oa]\b/.test(base)) modifier = 0.35;
  if (/\bescur[oa]\b/.test(base)) modifier = -0.35;
  base = base.replace(/\b(clar[oa]|escur[oa]|medi[oa])\b/g, " ").replace(/\s+/g, " ").trim();

  if (BASE[base]) return modifier ? shade(BASE[base], modifier) : BASE[base];

  // procura qualquer palavra-chave conhecida dentro do termo
  const words = base.split(/[^a-z]+/).filter(Boolean);
  for (const key of Object.keys(BASE)) {
    if (key.includes(" ")) {
      if (base.includes(key)) return modifier ? shade(BASE[key], modifier) : BASE[key];
    } else if (words.includes(key)) {
      return modifier ? shade(BASE[key], modifier) : BASE[key];
    }
  }
  return null;
}

/**
 * Extrai as cores visíveis de uma variação.
 * Aceita o texto do CRM ("Rosa Claro / Rosa Escuro") ou um array já cadastrado.
 */
export function parseColorSwatches(
  input: string | string[] | null | undefined,
  max = 4,
): string[] {
  const parts = (Array.isArray(input) ? input : [input ?? ""])
    .flatMap((v) => String(v).split(/[\/,+|·•]|\se\s|\/{1}/g))
    .map((s) => s.trim())
    .filter(Boolean);

  const out: string[] = [];
  for (const p of parts) {
    const hex = colorNameToHex(p);
    if (hex && !out.includes(hex)) out.push(hex);
    if (out.length >= max) break;
  }
  return out;
}

/** Background CSS com faixas quando há mais de uma cor na variação. */
export function swatchBackground(colors: string[]): string | undefined {
  if (colors.length === 0) return undefined;
  if (colors.length === 1) return colors[0];
  const step = 100 / colors.length;
  const stops = colors
    .map((c, i) => `${c} ${i * step}%, ${c} ${(i + 1) * step}%`)
    .join(", ");
  return `linear-gradient(135deg, ${stops})`;
}
