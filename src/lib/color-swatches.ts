/**
 * Conversão de nomes de cor (pt-BR) em amostras visuais reais.
 *
 * O CRM guarda a variação como texto ("Verde Claro / Limão / Cinza Escuro").
 * Aqui traduzimos esse texto em cores CSS para as bolinhas da vitrine.
 * Se um termo não for reconhecido, ele simplesmente não vira bolinha —
 * nunca inventamos cor.
 */

const PLACEHOLDER = new Set(["#0f1720", "#000", "#000000", "#111"]);

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
};

function strip(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
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
