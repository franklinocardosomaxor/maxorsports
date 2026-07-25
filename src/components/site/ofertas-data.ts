import shoeBostonPink from "@/assets/shoe-boston-pink.jpg.asset.json";
import shoeTerrexSpeed from "@/assets/shoe-terrex-speed.jpg.asset.json";
import shoeUltraboost5 from "@/assets/shoe-ultraboost5.jpg.asset.json";
import shoeUltraboost22 from "@/assets/shoe-ultraboost22.jpg.asset.json";
import shoeUb20Osaka from "@/assets/shoe-ub20-osaka.jpg.asset.json";
import shoeGazelleRed from "@/assets/shoe-gazelle-red.jpg.asset.json";
import shoeSupernova from "@/assets/shoe-supernova.jpg.asset.json";
import shoeTerrexDaroga from "@/assets/shoe-terrex-daroga.jpg.asset.json";
import shoeAf1Grey from "@/assets/shoe-af1-grey.jpg.asset.json";
import shoeAf1Cpfm from "@/assets/shoe-af1-cpfm.jpg.asset.json";
import type { CatalogProduct } from "./CatalogPage";

/**
 * OFERTAS — produtos em promoção com desconto real (old > price).
 * A lista aqui é o mock inicial; futuramente esses itens virão do CRM
 * (tabela `deals` com `status = 'promo'` ou tabela dedicada `offers`).
 */
export const OFERTAS: CatalogProduct[] = [
  { id: "o-ub22", name: "Ultraboost 22 Grey", brand: "Adidas", category: "Corrida", price: 599.9, old: 999.9, tag: "-40%", img: shoeUltraboost22.url, colors: ["#c0c0c0", "#0a0a0a"], sizes: [39, 40, 41, 42, 43] },
  { id: "o-ub20-osaka", name: "Ultraboost 20 Osaka", brand: "Adidas", category: "Corrida", price: 549.9, old: 949.9, tag: "-42%", img: shoeUb20Osaka.url, colors: ["#0a0a0a", "#ff2b2b", "#f4c400"], sizes: [40, 41, 42, 43] },
  { id: "o-supernova", name: "Supernova Rise 3M", brand: "Adidas", category: "Corrida", price: 449.9, old: 819.9, tag: "-45%", img: shoeSupernova.url, colors: ["#7ec8f7"], sizes: [39, 40, 41, 42, 43, 44] },
  { id: "o-gazelle", name: "Gazelle Indoor Red", brand: "Adidas", category: "Casual", price: 449.9, old: 799.9, tag: "-44%", img: shoeGazelleRed.url, colors: ["#c8102e"], sizes: [39, 40, 41, 42, 43] },
  { id: "o-daroga", name: "Terrex Daroga", brand: "Adidas", category: "Trail", price: 599.9, old: 999.9, tag: "-40%", img: shoeTerrexDaroga.url, colors: ["#0a0a0a", "#fff"], sizes: [40, 41, 42, 43, 44] },
  { id: "o-boston-13", name: "Adizero Boston 13", brand: "Adidas", category: "Corrida", price: 749.9, old: 1199.9, tag: "-38%", img: shoeBostonPink.url, colors: ["#f5e6d8", "#ff4d8a"], sizes: [39, 40, 41, 42, 43] },
  { id: "o-terrex-speed", name: "Terrex Agravic Speed 2", brand: "Adidas", category: "Trail", price: 749.9, old: 1249.9, tag: "-40%", img: shoeTerrexSpeed.url, colors: ["#f7f2e6", "#111", "#ff5a2b"], sizes: [40, 41, 42, 43, 44] },
  { id: "o-ub5-gtx", name: "Ultraboost 5 GTX", brand: "Adidas", category: "Corrida", price: 899.9, old: 1399.9, tag: "-36%", img: shoeUltraboost5.url, colors: ["#0a0a0a", "#3a4bff"], sizes: [39, 40, 41, 42, 43, 44] },
  { id: "o-af1-grey", name: "Air Force 1 x Off-White", brand: "Nike", category: "Casual", price: 899.9, old: 1499.9, tag: "-40%", img: shoeAf1Grey.url, colors: ["#b8b8b8", "#0a0a0a"], sizes: [40, 41, 42, 43] },
  { id: "o-af1-cpfm", name: "Air Force 1 x CPFM", brand: "Nike", category: "Casual", price: 999.9, old: 1599.9, tag: "-38%", img: shoeAf1Cpfm.url, colors: ["#0a0a0a", "#fff"], sizes: [40, 41, 42, 43] },
];

/**
 * COMBO / PROMOÇÃO MONTADA
 * Estrutura pronta pra virar tabela no CRM (ex.: `promo_combos`) com:
 *   id, title, subtitle, icon_url, product_ids[], override_total?, active
 * O front lê `PROMO_COMBOS` como fallback / seed. A UI em /ofertas permite
 * montar um combo (adicionar produtos, ver soma) e no futuro salvar via
 * server function (createServerFn) → tabela `promo_combos`.
 */
export type PromoCombo = {
  id: string;
  title: string;
  subtitle?: string;
  /** URL do ícone/selo da promoção (Franklin envia depois). Pode ser vazio. */
  iconUrl?: string;
  productIds: string[];
  /** Se definido, sobrescreve a soma automática (ex.: "leve 2 pague 1"). */
  overrideTotal?: number;
};

export const PROMO_COMBOS: PromoCombo[] = [
  {
    id: "combo-trio-corrida",
    title: "Trio Corrida Maxor",
    subtitle: "3 tênis top de corrida com desconto acumulado",
    iconUrl: "",
    productIds: ["o-ub22", "o-supernova", "o-boston-13"],
  },
];
