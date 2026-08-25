/**
 * Testes ponta a ponta (CRM → banco → catálogo → carrossel de marcas).
 *
 * Simulam a leitura do banco compartilhado (`public.products`) usada pelo
 * hook de sincronização em tempo real e verificam que qualquer alteração de
 * `brand_visible` no CRM Maxor reflete imediatamente nas marcas exibidas.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;

/** Linhas que o "banco" devolve na próxima consulta. */
let dbRows: Row[] = [];

vi.mock("@/integrations/supabase/client", () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => Promise.resolve({ data: dbRows, error: null }),
  };
  return { supabase: { from: () => builder } };
});

import { fetchDbProducts } from "@/lib/crm-db-catalog";
import {
  ALL_PRODUCTS,
  getBrandProducts,
  getVariants,
  getVisibleBrandSlugs,
  groupProductsByModel,
  setCrmProducts,
  subscribeCatalog,
  getCatalogVersion,
  deriveModelGroup,
} from "@/lib/catalog";

const IMG = "https://cdn.maxor.test/nike-pegasus.jpg";

const row = (over: Row = {}): Row => ({
  id: "uuid-1",
  sku: "MXR-3779",
  name: "Nike Cosmic Unity 3",
  brand: "Nike",
  section: "masculino",
  category: "Running",
  description: null,
  price: 350,
  old_price: null,
  img: IMG,
  images: [IMG],
  colors: ["#0F1720"],
  sizes: [40, 41],
  stock: 0,
  backorder: true,
  launch: false,
  tag: "Normal",
  model_group: null,
  site_visible: true,
  brand_visible: true,
  ...over,
});

/** Executa o mesmo caminho do hook de sync: banco → normalização → catálogo. */
async function syncFromCrm(rows: Row[]) {
  dbRows = rows;
  setCrmProducts(await fetchDbProducts());
}

beforeEach(() => {
  dbRows = [];
  setCrmProducts([]);
});

describe("brand_visible: CRM → carrossel de marcas", () => {
  it("propaga brand_visible do banco até o catálogo", async () => {
    await syncFromCrm([row()]);
    expect(ALL_PRODUCTS).toHaveLength(1);
    expect(ALL_PRODUCTS[0].brand_visible).toBe(true);
    expect(getVisibleBrandSlugs()).toContain("nike");
    expect(getBrandProducts("nike")).toHaveLength(1);
  });

  it("oculta a marca imediatamente quando o CRM marca brand_visible = false", async () => {
    await syncFromCrm([row()]);
    expect(getVisibleBrandSlugs()).toContain("nike");

    await syncFromCrm([row({ brand_visible: false })]);
    expect(getVisibleBrandSlugs()).not.toContain("nike");
    expect(getBrandProducts("nike")).toHaveLength(0);
  });

  it("reexibe a marca quando o CRM volta brand_visible para true", async () => {
    await syncFromCrm([row({ brand_visible: false })]);
    expect(getVisibleBrandSlugs()).not.toContain("nike");

    await syncFromCrm([row({ brand_visible: true })]);
    expect(getVisibleBrandSlugs()).toEqual(["nike"]);
  });

  it("mantém o produto na vitrine geral mesmo com brand_visible = false", async () => {
    await syncFromCrm([row({ brand_visible: false })]);
    expect(ALL_PRODUCTS).toHaveLength(1);
    expect(getBrandProducts("nike")).toHaveLength(0);
  });

  it("site_visible = false remove o produto de qualquer vitrine", async () => {
    await syncFromCrm([row({ site_visible: false })]);
    expect(ALL_PRODUCTS).toHaveLength(0);
    expect(getVisibleBrandSlugs()).toEqual([]);
  });

  it("brand_visible ausente (legado) é tratado como visível", async () => {
    await syncFromCrm([row({ brand_visible: null })]);
    expect(getVisibleBrandSlugs()).toContain("nike");
  });

  it("mostra apenas as marcas visíveis quando há várias no CRM", async () => {
    await syncFromCrm([
      row(),
      row({ id: "uuid-2", sku: "MXR-1001", brand: "Adidas", brand_visible: false }),
      row({ id: "uuid-3", sku: "MXR-1002", brand: "New Balance" }),
    ]);
    expect(getVisibleBrandSlugs().sort()).toEqual(["new-balance", "nike"]);
  });

  it("notifica assinantes (re-render do carrossel) a cada sync", async () => {
    const spy = vi.fn();
    const unsub = subscribeCatalog(spy);
    const before = getCatalogVersion();

    await syncFromCrm([row()]);
    await syncFromCrm([row({ brand_visible: false })]);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(getCatalogVersion()).toBe(before + 2);
    unsub();
  });

  it("exclusão lógica no CRM (produto some do payload) esvazia a marca", async () => {
    await syncFromCrm([row()]);
    await syncFromCrm([]);
    expect(ALL_PRODUCTS).toHaveLength(0);
    expect(getVisibleBrandSlugs()).toEqual([]);
  });
});

describe("agrupamento canônico de modelos", () => {
  it("agrupa as 3 variações do Nike Air Zoom Vomero 17", async () => {
    await syncFromCrm([
      row({ id: "uuid-v17-1", sku: "MXR-5346", name: "Nike Air Zoom Vomero 17", model_group: "Nike Air Zoom Vomero 17", color_variant: "Creme / Amarelo fluorescente" }),
      row({ id: "uuid-v17-2", sku: "MXR-5748", name: "Nike Air Zoom Vomero 17 Preto", model_group: "Nike Air Zoom Vomero 17", color_variant: "Preto" }),
      row({ id: "uuid-v17-3", sku: "MXR-7155", name: "Nike Air Zoom Vomero 17", model_group: "Nike Air Zoom Vomero 17", color_variant: "Branco / Preto / Laranja" }),
    ]);

    const grouped = groupProductsByModel(ALL_PRODUCTS);
    expect(grouped).toHaveLength(1);
    expect(getVariants(ALL_PRODUCTS[0])).toHaveLength(3);
  });

  it("preserva o modelo escolhido no CRM mesmo quando o nome tem complemento", () => {
    expect(deriveModelGroup("Nike Air Force 1 Low Preto", "Preto", "Nike", "Air Force 1")).toBe("Air Force 1");
  });

  it("agrupa Air Zoom G.T. Cut quando as variações estão vinculadas ao mesmo model_group", async () => {
    await syncFromCrm([
      row({ id: "uuid-gt-1", sku: "MXR-2123", name: "Nike Air Zoom G.T. Cut Cinza / Rosa / Amarelo / Azul", model_group: "Nike Air Zoom G.T. Cut", color_variant: "Cinza / Rosa / Amarelo / Azul" }),
      row({ id: "uuid-gt-2", sku: "MXR-4949", name: "Nike Air Zoom G.T. Cut EP Branco / Preto / Laranja / Rosa", model_group: "Nike Air Zoom G.T. Cut", color_variant: "Branco / Preto / Laranja / Rosa" }),
      row({ id: "uuid-gt-3", sku: "MXR-2722", name: "Nike Air Zoom G.T. Cut EP", model_group: "Nike Air Zoom G.T. Cut", color_variant: "Nike Air Zoom G.T. Cut EP" }),
    ]);

    const grouped = groupProductsByModel(ALL_PRODUCTS);
    expect(grouped).toHaveLength(1);
    expect(getVariants(ALL_PRODUCTS[2])).toHaveLength(3);
  });

  it("não mistura Vomero 17 com Vomero 19", async () => {
    await syncFromCrm([
      row({ id: "uuid-v17", sku: "MXR-5346", name: "Nike Air Zoom Vomero 17", model_group: "Nike Air Zoom Vomero 17", color_variant: "Creme / Amarelo fluorescente" }),
      row({ id: "uuid-v19", sku: "MXR-8778", name: "Nike Vomero 19 Moonlight Verde Claro / Limão / Cinza Escuro", model_group: "Nike Vomero 19 Moonlight", color_variant: "Verde Claro / Limão / Cinza Escuro" }),
    ]);

    expect(groupProductsByModel(ALL_PRODUCTS)).toHaveLength(2);
  });

  it("ignora model_group genérico de marca e não colapsa modelos diferentes", async () => {
    await syncFromCrm([
      row({ id: "uuid-pegasus", sku: "MXR-1001", name: "Nike Pegasus 41 Preto", model_group: "nike", color_variant: "Preto" }),
      row({ id: "uuid-vomero", sku: "MXR-1002", name: "Nike Air Zoom Vomero 17 Preto", model_group: "nike", color_variant: "Preto" }),
    ]);

    expect(groupProductsByModel(ALL_PRODUCTS)).toHaveLength(2);
  });
});
