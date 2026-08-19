/**
 * Endpoint público de ingestão do catálogo — usado pelo CRM Maxor (Antigravity).
 *
 * GET  /api/public/crm/products  -> lista os produtos publicados no site
 * POST /api/public/crm/products  -> insere/atualiza um produto (upsert por SKU)
 *
 * Segurança: o POST exige o header `x-maxor-key` com o valor do segredo
 * CRM_INGEST_SECRET (configurado no backend). Sem isso, retorna 401.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { normalizeSelo } from "@/lib/catalog";

/** Extrai a URL de uma foto vinda do CRM (string ou objeto {url|src|href|path}). */
const toUrl = (v: unknown): string | null => {
  if (typeof v === "string") return v.trim() || null;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const raw = o.url ?? o.src ?? o.href ?? o.path ?? o.secure_url ?? o.publicUrl;
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return null;
};

/** Aceita 199, "199.90", "R$ 1.299,90" e devolve número (ou null). */
const toMoney = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  let s = v.replace(/[^\d,.-]/g, "");
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

/**

 * Aceita "Masculino", "MASC", "unissex", "kids", "menina", "promoção"…
 * e devolve sempre uma das 4 seções válidas do site.
 * Antes, qualquer variação fora da lista derrubava o lote inteiro com 400.
 */
const toSection = (v: unknown): "masculino" | "feminino" | "infantil" | "ofertas" => {
  const s = String(v ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/fem|mulher|menina|woman|women|ela/.test(s)) return "feminino";
  if (/inf|kid|crian|baby|junior|menino/.test(s)) return "infantil";
  if (/ofer|promo|sale|outlet|desconto/.test(s)) return "ofertas";
  return "masculino";
};


/**
 * Normalizador AUTO-ADAPTÁVEL.
 *
 * Em vez de uma lista fixa de nomes de campo (que quebrava sempre que o CRM
 * renomeava algo), aqui cada campo do site é resolvido por PADRÃO de nome:
 * a chave recebida é achatada (sem acentos, sem separadores, sem sufixos como
 * _prod/_dec/_txt) e comparada com uma regex. Assim `marca`, `marca_prod`,
 * `brandName`, `MARCA-PROD` etc. caem todos em `brand` — sem mexer no código.
 */

/** "Marca_Prod" -> "marca" ; "valor_dec" -> "valor" ; "imageURLs" -> "imageurls" */
const flatKey = (k: string) =>
  k
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_\-.]/g, "")
    .toLowerCase()
    .replace(/(prod|produto|dec|txt|str|int|num|field|campo|value)$/g, "");

/** Achata objetos aninhados (ex.: { produto: {...} }, { data: {...} }) em 1 nível. */
const flattenSource = (input: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    const isPlain = v && typeof v === "object" && !Array.isArray(v);
    if (isPlain && /^(produto|product|item|data|attributes|fields|payload|record)$/.test(flatKey(k))) {
      for (const [k2, v2] of Object.entries(v as Record<string, unknown>)) out[k2] = v2;
    } else if (!(k in out)) {
      out[k] = v;
    }
  }
  return out;
};

/** Primeiro valor cuja chave casa com o padrão. */
const pick = (raw: Record<string, unknown>, re: RegExp): unknown => {
  for (const [k, v] of Object.entries(raw)) {
    if (v === null || v === undefined || v === "") continue;
    if (re.test(flatKey(k))) return v;
  }
  return undefined;
};

const PATTERNS = {
  sku: /^(sku|codigo|code|idproduto|productid|ref|referencia|id)$/,
  name: /^(name|nome|titulo|title|descricaocurta|modelo|model)$/,
  brand: /^(brand|marca|fabricante|manufacturer)$/,
  category: /^(category|categoria|tipo|type|linha|subcategoria)$/,
  description: /^(description|descricao|detalhes|details|obs|observacao|resumo)$/,
  section: /^(section|secao|genero|gender|aba|publico|departamento|sexo|tab)$/,
  price: /^(price|preco|valor|precovenda|valorvenda|pricebrl|salepri?ce)$/,
  oldPrice: /^(oldprice|precoantigo|valorantigo|precode|precooriginal|discountprice|comparepri?ce|precoriscado)$/,
  modelGroup: /^(modelgroup|grupomodelo|grupo|agrupamento|familia|family|colorwaygroup|linhamodelo)$/,
  sizes: /^(sizes|tamanhos|numeracao|numeros|grade|tamanho|size)$/,
  colors: /^(colors|cores|cor|color|colorway|paleta)$/,
  stock: /^(stock|estoque|quantidade|qtd|qty|saldo)$/,
  backorder: /^(backorder|encomenda|sobencomenda|prevenda)$/,
  launch: /^(launch|lancamento|novidade|isnew|new)$/,
  tag: /^(tag|etiqueta|selo|badge|destaque)$/,
  visible: /^(sitevisible|visivel|publicado|published|ativo|active|visible|exibirsite)$/,
  brandVisible: /^(brandvisible|exibir|exibirmarca|marcaativa|marcavislvel)$/,
  gallery: /^(images?|imagens|imgs?|gallery|galeria|galerias|photos?|fotos?|imageurls?|urlsimagens?|pictures?|midias?|media|anexos?|arquivos?)$/,
  main: /^(img|image|imagem|foto|imageurl|urlimagem|capa|cover|thumbnail|thumb|principal|fotoprincipal|imagemprincipal)$/,
} as const;

const toBool = (v: unknown, fallback: boolean): boolean => {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "sim", "s", "yes", "y", "ativo", "publicado"].includes(s)) return true;
    if (["false", "0", "nao", "não", "n", "no", "inativo", "oculto"].includes(s)) return false;
  }
  return fallback;
};

/** Aceita array, string separada por vírgula/;/| ou lista de objetos. */
const toList = (v: unknown): string[] => {
  if (v === null || v === undefined) return [];
  const arr = Array.isArray(v) ? v : typeof v === "string" ? v.split(/[,;|]/) : [v];
  return arr
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") return String(item).trim();
      const u = toUrl(item);
      if (u) return u;
      const o = item as Record<string, unknown> | null;
      const label = o?.name ?? o?.nome ?? o?.label ?? o?.hex ?? o?.value ?? o?.tamanho ?? o?.size;
      return typeof label === "string" || typeof label === "number" ? String(label).trim() : "";
    })
    .filter(Boolean);
};

const normalizeIncoming = (input: unknown) => {
  if (!input || typeof input !== "object") return input;
  const raw = flattenSource(input as Record<string, unknown>);

  // Galeria: junta TODAS as chaves que pareçam imagem (galeria + principal).
  const gallery: string[] = [];
  for (const [k, v] of Object.entries(raw)) {
    const fk = flatKey(k);
    if (!PATTERNS.gallery.test(fk) && !PATTERNS.main.test(fk)) continue;
    if (Array.isArray(v)) for (const it of v) { const u = toUrl(it); if (u) gallery.push(u); }
    else { const u = toUrl(v); if (u) gallery.push(u); }
  }
  const mainRaw = pick(raw, PATTERNS.main);
  let main = toUrl(Array.isArray(mainRaw) ? mainRaw[0] : mainRaw);
  if (!main && gallery.length) main = gallery[0];
  if (main && !gallery.includes(main)) gallery.unshift(main);

  const sizes = toList(pick(raw, PATTERNS.sizes))
    .map((s) => Number(String(s).replace(",", ".")))
    .filter((n) => Number.isFinite(n));
  const colors = toList(pick(raw, PATTERNS.colors));

  const str = (v: unknown) => (v === undefined || v === null ? undefined : String(v).trim() || undefined);

  return {
    sku: str(pick(raw, PATTERNS.sku)),
    name: str(pick(raw, PATTERNS.name)),
    brand: str(pick(raw, PATTERNS.brand)) ?? "Maxor",
    category: str(pick(raw, PATTERNS.category)) ?? "Casual",
    description: str(pick(raw, PATTERNS.description)) ?? null,
    section: toSection(pick(raw, PATTERNS.section)),
    price: toMoney(pick(raw, PATTERNS.price)),
    old_price: toMoney(pick(raw, PATTERNS.oldPrice)),
    model_group: str(pick(raw, PATTERNS.modelGroup)) ?? null,
    sizes: sizes.length ? sizes : undefined,
    colors: colors.length ? colors : undefined,
    stock: pick(raw, PATTERNS.stock),
    backorder: toBool(pick(raw, PATTERNS.backorder), true),
    launch: toBool(pick(raw, PATTERNS.launch), false),
    tag: str(pick(raw, PATTERNS.tag)) ?? null,
    // site_visible deve ser rigorosamente respeitado do CRM.
    // Se o nome ou SKU contiver "TESTE", forçamos a invisibilidade por segurança.
    site_visible: toBool(pick(raw, PATTERNS.visible), false) && 
                 !str(pick(raw, PATTERNS.name))?.toUpperCase().includes("TESTE") &&
                 !str(pick(raw, PATTERNS.sku))?.toUpperCase().includes("TESTE"),
    brand_visible: toBool(pick(raw, PATTERNS.brandVisible), true),

    img: main,
    images: Array.from(new Set(gallery)).slice(0, 20),
  };
};



const productSchema = z.preprocess(
  normalizeIncoming,
  z.object({
    sku: z.string().min(1).max(64),
    name: z.string().min(1).max(200),
    brand: z.string().min(1).max(80).default("Maxor"),
    section: z.enum(["masculino", "feminino", "infantil", "ofertas"]).default("masculino"),
    category: z.string().min(1).max(80).default("Casual"),
    description: z.string().max(2000).nullish().default(null),
    price: z.coerce.number().min(0).max(1_000_000),
    old_price: z.coerce.number().min(0).max(1_000_000).nullish().default(null),
    img: z.string().max(5000000).nullish().default(null),
    images: z.array(z.string().max(5_000_000)).max(20).default([]),
    // Defaults obrigatórios: no envio em lote o PostgREST une as chaves de
    // todas as linhas e preenche as ausentes com NULL (não com o DEFAULT da
    // coluna) — sem isso um produto sem cor derruba o lote inteiro.
    colors: z.array(z.string().max(32)).max(30).default(["#0F1720"]),
    // min 15 para aceitar numeração infantil/baby.
    sizes: z.array(z.coerce.number().int().min(15).max(60)).max(40).default([38, 39, 40, 41, 42, 43, 44]),
    stock: z.coerce.number().int().min(0).max(1_000_000).default(0),
    backorder: z.boolean().default(true),
    launch: z.boolean().default(false),
    tag: z.string().max(40).nullish().default(null),
    model_group: z.string().max(120).nullish().default(null),

    site_visible: z.boolean().default(false),
    brand_visible: z.boolean().default(true),
  }),
);

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "cache-control": "no-store" } });

export const Route = createFileRoute("/api/public/crm/products")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const url = new URL(request.url);
        const diag = url.searchParams.has("diagnostico") || url.searchParams.has("debug");

        const query = supabaseAdmin
          .from("products")
          .select(
            "id, sku, name, brand, section, category, description, price, old_price, img, images, colors, sizes, stock, backorder, launch, tag, model_group, site_visible, brand_visible",
          )
          .order("created_at", { ascending: false });

        const { data, error } = diag ? await query : await query.eq("site_visible", true);
        if (error) return json({ ok: false, error: error.message }, 500);

        if (diag) {
          const { isUnreachableUrl } = await import("@/lib/crm-images.server");
          const rows = (data ?? []) as Record<string, unknown>[];
          const report = rows.map((r) => {
            const img = String(r.img ?? "");
            const motivos: string[] = [];
            if (r.site_visible !== true) motivos.push("site_visible não é true");
            if (!img) motivos.push("sem imagem");
            else if (isUnreachableUrl(img))
              motivos.push(`imagem inalcançável pela nuvem (${img}) — envie base64 ou URL https pública`);
            
            const seloNorm = normalizeSelo(r.tag);
            if (seloNorm === null) motivos.push(`selo inválido ou inexistente ("${r.tag ?? ''}") — use Destaque, Lancamento ou Oferta`);
            
            return {
              sku: r.sku,
              name: r.name,
              site_visible: r.site_visible,
              brand_visible: r.brand_visible,
              img,
              exibido_no_site: motivos.length === 0,
              selo_normalizado: seloNorm,
              motivos,
            };
          });
          return json({
            ok: true,
            total_no_banco: report.length,
            exibidos_no_site: report.filter((r) => r.exibido_no_site).length,
            produtos: report,
          });
        }

        return json({ ok: true, total: data?.length ?? 0, products: data ?? [] });
      },


      POST: async ({ request }) => {
        const provided = request.headers.get("x-maxor-key") ?? "";
        const accepted = [process.env.MAXOR_CRM_INGEST_KEY, process.env.CRM_INGEST_SECRET].filter(
          (v): v is string => typeof v === "string" && v.length > 0,
        );
        if (accepted.length === 0 || !accepted.includes(provided)) {
          return json({ ok: false, error: "Unauthorized" }, 401);
        }


        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ ok: false, error: "JSON inválido" }, 400);
        }

        // Aceita: [ {...} ], { ...um produto }, ou envelopes tipo
        // { products: [...] } / { produtos: [...] } / { data: { items: [...] } }.
        const unwrap = (p: unknown): unknown[] => {
          if (Array.isArray(p)) return p;
          if (p && typeof p === "object") {
            for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
              if (!/^(products?|produtos?|items?|itens|data|rows|records?|lista|list|catalog|catalogo)$/i.test(k)) continue;
              if (Array.isArray(v) && v.some((i) => i && typeof i === "object")) return v;
            }
          }

          return [p];
        };
        const items = unwrap(payload);

        const parsed = z.array(productSchema).max(200).safeParse(items);
        if (!parsed.success) {
          return json({ ok: false, error: "Payload inválido", issues: parsed.error.issues }, 400);
        }

        // Todas as linhas saem do schema com EXATAMENTE as mesmas chaves
        // (colunas nullable ficam null). Isso é obrigatório no upsert em lote:
        // o PostgREST une as chaves do lote e preenche as faltantes com NULL.
        const { resolveCrmImages } = await import("@/lib/crm-images.server");
        const rows = await Promise.all(
          parsed.data.map(async (item) => {
            // Imagens: base64 -> Storage; URL pública -> mantida;
            // URL local do CRM (127.0.0.1/localhost) -> descartada.
            const source = Array.from(
              new Set(
                [item.img, ...item.images].filter(
                  (v): v is string => typeof v === "string" && v.length > 0,
                ),
              ),
            );

            const images = await resolveCrmImages(source, item.sku);
            const row = { ...item, images, img: images[0] ?? null };
            return Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));
          }),
        );



        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("products")
          .upsert(rows as never, { onConflict: "sku" })
          .select("id, sku, name, section, site_visible");

        if (error) return json({ ok: false, error: error.message }, 500);
        return json({ ok: true, upserted: data?.length ?? 0, products: data ?? [] }, 201);
      },
    },
  },
});
