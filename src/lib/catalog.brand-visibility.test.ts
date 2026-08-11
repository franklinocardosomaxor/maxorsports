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
  getVisibleBrandSlugs,
  setCrmProducts,
  subscribeCatalog,
  getCatalogVersion,
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
