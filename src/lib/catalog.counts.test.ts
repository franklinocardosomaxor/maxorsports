/**
 * Trava de regressão da AUDITORIA DE EXIBIÇÃO.
 *
 * Garante que:
 *  1. a numeração exibida vem de `num_cal_min`/`num_cal_max` do CRM (e não da
 *     coluna legada `sizes`, que está com a mesma faixa em todos os cadastros);
 *  2. as contagens de marca (menu, /marcas, /catalogo, página da marca) contam
 *     MODELOS agrupados e reportam as variações separadamente, sem divergência.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;

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
  countModelsAndVariants,
  formatCatalogCount,
  getBrandDirectory,
  getBrandProducts,
  getSectionProducts,
  groupProductsByModel,
  setCrmProducts,
} from "@/lib/catalog";

const IMG = "https://cdn.maxor.test/tenis.jpg";

const row = (over: Row = {}): Row => ({
  id: "uuid",
  sku: "MXR-0001",
  name: "Adizero Evo SL",
  brand: "Adidas",
  section: "masculino",
  category: "Running",
  price: 350,
  img: IMG,
  images: [IMG],
  colors: ["#0F1720"],
  sizes: [38, 39, 40, 41, 42, 43, 44],
  num_cal_min: 37,
  num_cal_max: 44,
  stock: 0,
  backorder: true,
  launch: false,
  tag: "Normal",
  model_group: null,
  site_visible: true,
  brand_visible: true,
  genero: "Masculino",
  ...over,
});

async function syncFromCrm(rows: Row[]) {
  dbRows = rows;
  setCrmProducts(await fetchDbProducts());
}

beforeEach(() => {
  dbRows = [];
  setCrmProducts([]);
});

describe("numeração real por gênero", () => {
  it("usa num_cal_min/num_cal_max em vez da coluna legada sizes", async () => {
    await syncFromCrm([
      row({ id: "m", sku: "MXR-M", genero: "Masculino", num_cal_min: 37, num_cal_max: 44 }),
      row({
        id: "f",
        sku: "MXR-F",
        name: "Adizero Evo SL Fem",
        genero: "Feminino",
        section: "feminino",
        num_cal_min: 34,
        num_cal_max: 39,
      }),
    ]);

    const masc = ALL_PRODUCTS.find((p) => p.id === "MXR-M")!;
    const fem = ALL_PRODUCTS.find((p) => p.id === "MXR-F")!;
    expect(masc.sizes).toEqual([37, 38, 39, 40, 41, 42, 43, 44]);
    expect(fem.sizes).toEqual([34, 35, 36, 37, 38, 39]);
    // A faixa feminina nunca aparecia porque `sizes` era fixa em 38–44.
    expect(fem.sizes).not.toContain(44);
  });

  it("vitrine feminina só oferece numerações femininas/unissex", async () => {
    await syncFromCrm([
      row({ id: "m", sku: "MXR-M", genero: "Masculino", num_cal_min: 37, num_cal_max: 44 }),
      row({
        id: "f",
        sku: "MXR-F",
        name: "Adizero Fem",
        genero: "Feminino",
        section: "feminino",
        num_cal_min: 34,
        num_cal_max: 39,
      }),
    ]);
    const sizes = new Set(getSectionProducts("feminino").flatMap((p) => p.sizes));
    expect(sizes.has(34)).toBe(true);
    expect(sizes.has(44)).toBe(false);
  });

  it("card de modelo agrupado usa a união das numerações das variações", async () => {
    await syncFromCrm([
      row({ id: "a", sku: "MXR-A", model_group: "Evo SL", color_variant: "Preto", num_cal_min: 37, num_cal_max: 40 }),
      row({ id: "b", sku: "MXR-B", model_group: "Evo SL", color_variant: "Branco", num_cal_min: 41, num_cal_max: 44 }),
    ]);
    const [card] = groupProductsByModel(ALL_PRODUCTS);
    expect(card.sizes).toEqual([37, 38, 39, 40, 41, 42, 43, 44]);
  });

  it("sem numeração cadastrada, mantém a lista antiga como fallback", async () => {
    await syncFromCrm([row({ num_cal_min: 0, num_cal_max: 0, sizes: [40, 41] })]);
    expect(ALL_PRODUCTS[0].sizes).toEqual([40, 41]);
  });
});

describe("contagens em harmonia", () => {
  it("diretório, página da marca e catálogo contam os mesmos modelos", async () => {
    await syncFromCrm([
      row({ id: "1", sku: "A1", model_group: "Evo SL", color_variant: "Preto" }),
      row({ id: "2", sku: "A2", model_group: "Evo SL", color_variant: "Branco" }),
      row({ id: "3", sku: "A3", name: "Adizero Adios Pro", model_group: "Adios Pro", color_variant: "Azul" }),
      row({ id: "4", sku: "N1", name: "Nike Pegasus 41", brand: "Nike", model_group: "Pegasus 41" }),
    ]);

    const adidas = getBrandDirectory().find((e) => e.slug === "adidas")!;
    expect(adidas.count).toBe(2);
    expect(adidas.variantCount).toBe(3);
    expect(getBrandProducts("adidas")).toHaveLength(adidas.count);

    const nike = getBrandDirectory().find((e) => e.slug === "nike")!;
    expect(nike.count).toBe(1);
    expect(nike.variantCount).toBe(1);
  });

  it("modelos nunca superam as variações e o total bate com o catálogo", async () => {
    await syncFromCrm([
      row({ id: "1", sku: "A1", model_group: "Evo SL", color_variant: "Preto" }),
      row({ id: "2", sku: "A2", model_group: "Evo SL", color_variant: "Branco" }),
      row({ id: "3", sku: "N1", name: "Nike Pegasus 41", brand: "Nike", model_group: "Pegasus 41" }),
    ]);

    const dir = getBrandDirectory().filter((e) => e.matchBy !== "category");
    const totalVariants = dir.reduce((n, e) => n + e.variantCount, 0);
    const totalModels = dir.reduce((n, e) => n + e.count, 0);
    expect(totalVariants).toBe(ALL_PRODUCTS.length);
    expect(totalModels).toBeLessThanOrEqual(totalVariants);
    expect(countModelsAndVariants(ALL_PRODUCTS)).toEqual({ models: totalModels, variants: totalVariants });
  });

  it("rótulo único de contagem", () => {
    expect(formatCatalogCount(1)).toBe("1 modelo");
    expect(formatCatalogCount(6, 16)).toBe("6 modelos · 16 variações");
    expect(formatCatalogCount(2, 2)).toBe("2 modelos");
  });
});
