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

// ---------------------------------------------------------------------------
// DIRETÓRIO VIVO — lista estática + marcas vindas do CRM, com contagem viva.
// Menu Tênis, /marcas, /marcas/$slug, busca e carrossel da Home consomem
// SOMENTE este diretório (via getBrandDirectory() em src/lib/catalog.ts).
// ---------------------------------------------------------------------------

/** Produto mínimo para o matching de marca (qualquer fonte). */
export type BrandMatchProduct = { brand?: unknown; category?: unknown };

/**
 * REGRA ÚNICA de correspondência produto ↔ marca.
 * Catálogo, busca, menu e páginas de marca delegam o matching para cá —
 * qualquer ajuste de correspondência acontece SOMENTE nesta função.
 */
export function productMatchesBrand(p: BrandMatchProduct, def: BrandDef): boolean {
  if (def.matchBy === "category") {
    // Marcas-categoria (ex.: Chuteiras): o produto mantém a marca real no
    // cadastro (Nike, Adidas...) e a vitrine filtra pela CATEGORIA.
    const cat = brandSlug(p.category);
    if (!cat) return false;
    return [def.slug, def.name, ...def.aliases].some((a) => cat.includes(brandSlug(a)));
  }
  const b = normKey(p.brand);
  if (!b) return false;
  if (b === normKey(def.name) || b === normKey(def.slug)) return true;
  return def.aliases.some((a) => normKey(a) === b);
}

/** Entrada do diretório vivo: definição + contagem de produtos do CRM. */
export type BrandDirectoryEntry = BrandDef & {
  /** Produtos visíveis do CRM associados a esta marca. */
  count: number;
  /** true quando a marca existe só no CRM (fora da lista estática acima). */
  fromCrm: boolean;
};

/**
 * Monta o diretório vivo de marcas a partir dos produtos do CRM:
 *  - toda marca estática aparece SEMPRE (count 0 = "em breve" na vitrine);
 *  - marca nova cadastrada no CRM entra automaticamente no fim da lista,
 *    com slug derivado do nome canonizado — e ganha página /marcas/<slug>;
 *  - marcas-categoria (Chuteiras) contam pela categoria, não pela marca;
 *  - slugs são únicos por construção (sem logo repetida no carrossel).
 */
export function buildBrandDirectory(
  products: ReadonlyArray<BrandMatchProduct & { brand_visible?: boolean }>,
  // Função opcional que agrupa produtos em MODELOS (ex.: groupProductsByModel
  // de src/lib/catalog.ts). Quando informada, a contagem de cada marca passa
  // a refletir a quantidade de MODELOS (o mesmo número de cards que aparece
  // dentro da página da marca), não de produtos brutos por variante de cor.
  // Sem isso, uma marca com poucos modelos mas muitas cores por modelo
  // (ex.: Adidas) exibia uma contagem maior no menu/`/marcas` do que a
  // quantidade real de cards ao abrir a página.
  groupByModel?: (items: ReadonlyArray<BrandMatchProduct>) => ReadonlyArray<unknown>,
): BrandDirectoryEntry[] {
  const visible = products.filter((p) => p.brand_visible !== false);
  const counts = new Map<string, number>();
  const extras = new Map<string, BrandDirectoryEntry>();

  const countFor = (slug: string, items: BrandMatchProduct[]): number =>
    groupByModel ? groupByModel(items).length : items.length;

  const byBrandSlug = new Map<string, BrandMatchProduct[]>();

  for (const p of visible) {
    const canonical = canonicalBrandName(p.brand);
    if (!canonical) continue;
    const def = LOOKUP.get(normKey(canonical));
    if (def) {
      // Marca-categoria não conta por marca (evita dupla contagem).
      if (def.matchBy !== "category") {
        const list = byBrandSlug.get(def.slug) ?? [];
        list.push(p);
        byBrandSlug.set(def.slug, list);
      }
      continue;
    }
    // Marca que existe só no CRM: ganha entrada própria no diretório.
    const slug = brandSlug(canonical);
    if (!slug) continue;
    const list = byBrandSlug.get(slug) ?? [];
    list.push(p);
    byBrandSlug.set(slug, list);
    if (!extras.has(slug)) {
      extras.set(slug, { slug, name: canonical, aliases: [], matchBy: "brand", fromCrm: true, count: 0 } as BrandDirectoryEntry);
    }
  }

  for (const [slug, items] of byBrandSlug) {
    counts.set(slug, countFor(slug, items));
  }
  for (const entry of extras.values()) {
    entry.count = counts.get(entry.slug) ?? 0;
  }

  // Marcas-categoria: contam pela CATEGORIA do produto (modelos, se houver agrupamento).
  for (const def of BRAND_DEFS) {
    if (def.matchBy === "category") {
      const items = visible.filter((p) => productMatchesBrand(p, def));
      counts.set(def.slug, countFor(def.slug, items));
    }
  }

  const base: BrandDirectoryEntry[] = BRAND_DEFS.map((def) => ({
    ...def,
    fromCrm: false,
    count: counts.get(def.slug) ?? 0,
  }));
  const crmOnly = Array.from(extras.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  return [...base, ...crmOnly];
}
