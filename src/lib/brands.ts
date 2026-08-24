/**
 * FONTE ÚNICA DE MARCAS — Maxor Sports
 *
 * Site (vitrines, menu, LogoLoop), CRM (cadastro Fase 1) e API de ingestão
 * leem a MESMA lista daqui. Para adicionar, remover ou renomear uma marca,
 * mexa SOMENTE neste arquivo — tudo se propaga automaticamente.
 *
 * Regras:
 *  - `slug`   → identificador da URL (/marcas/<slug>). Nunca muda depois de publicado.
 *  - `name`   → nome canônico gravado no banco (coluna `brand`).
 *  - `aliases`→ grafias aceitas na canonização (importações, cadastros antigos).
 *  - `matchBy: "category"` → a "marca" é na verdade uma categoria de produto
 *    (ex.: Chuteiras — os produtos continuam com marca Nike/Adidas no cadastro,
 *    mas a vitrine filtra pela categoria).
 */

export type BrandDef = {
  slug: string;
  name: string;
  aliases: string[];
  matchBy?: "brand" | "category";
};

export const BRAND_DEFS: BrandDef[] = [
  { slug: "nike",          name: "Nike",          aliases: ["nike"] },
  { slug: "adidas",        name: "Adidas",        aliases: ["adidas"] },
  { slug: "new-balance",   name: "New Balance",   aliases: ["new balance", "newbalance", "nb"] },
  { slug: "puma",          name: "Puma",          aliases: ["puma"] },
  { slug: "asics",         name: "ASICS",         aliases: ["asics", "asic"] },
  { slug: "converse",      name: "Converse",      aliases: ["converse", "all star", "allstar"] },
  { slug: "vans",          name: "Vans",          aliases: ["vans"] },
  { slug: "jordan",        name: "Jordan",        aliases: ["jordan", "air jordan"] },
  { slug: "hoka",          name: "HOKA",          aliases: ["hoka", "hoka one one", "hokaoneone"] },
  { slug: "on",            name: "On",            aliases: ["on", "on running", "onrunning"] },
  { slug: "salomon",       name: "Salomon",       aliases: ["salomon"] },
  { slug: "mizuno",        name: "Mizuno",        aliases: ["mizuno"] },
  { slug: "fila",          name: "Fila",          aliases: ["fila"] },
  { slug: "crocs",         name: "Crocs",         aliases: ["crocs"] },
  { slug: "timberland",    name: "Timberland",    aliases: ["timberland", "timber"] },
  { slug: "gucci",         name: "Gucci",         aliases: ["gucci"] },
  { slug: "prada",         name: "Prada",         aliases: ["prada"] },
  { slug: "louis-vuitton", name: "Louis Vuitton", aliases: ["louis vuitton", "luiz vitton", "luis vitton", "louis vuiton", "lv"] },
  // Categoria especial: produtos têm marca própria (Nike, Adidas...), mas a
  // vitrine /marcas/chuteiras filtra pela CATEGORIA do produto.
  { slug: "chuteiras",     name: "Chuteiras",     aliases: ["chuteiras", "chuteira", "futebol", "campo", "society", "futsal"], matchBy: "category" },
];

/** Nomes canônicos — usado no <select> de marca do cadastro no CRM. */
export const BRAND_NAMES: string[] = BRAND_DEFS.map((b) => b.name);

/** Converte qualquer texto em slug ("New Balance" -> "new-balance"). */
export const brandSlug = (s: unknown): string =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Chave de comparação sem separadores ("new-balance" -> "newbalance"). */
const normKey = (s: unknown): string => brandSlug(s).replace(/-/g, "");

/** Índice alias -> definição (inclui o próprio nome canônico e o slug). */
const LOOKUP = new Map<string, BrandDef>();
for (const def of BRAND_DEFS) {
  LOOKUP.set(normKey(def.name), def);
  LOOKUP.set(normKey(def.slug), def);
  for (const a of def.aliases) LOOKUP.set(normKey(a), def);
}

/**
 * Canoniza um nome de marca vindo de qualquer fonte (CRM, importação, API).
 * Retorna o nome canônico da lista, ou o texto limpo quando é uma marca
 * ainda não cadastrada (nunca inventa nem descarta).
 */
export function canonicalBrandName(input: unknown): string | null {
  const clean = String(input ?? "").trim();
  if (!clean) return null;
  const def = LOOKUP.get(normKey(clean));
  return def ? def.name : clean;
}

/** Definição de marca pelo slug da URL. */
export function getBrandDef(slug: string): BrandDef | undefined {
  return BRAND_DEFS.find((b) => b.slug === slug);
}
