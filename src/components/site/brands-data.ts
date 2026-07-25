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

// Brand logos supplied by Franklin (first batch). Rendered on tiles.
import logoNike from "@/assets/brands/nike.svg";
import logoAdidas from "@/assets/brands/adidas.svg";
import logoNewBalance from "@/assets/brands/new-balance.svg";
import logoPuma from "@/assets/brands/puma.svg";
import logoAsics from "@/assets/brands/asics.svg";
import logoJordan from "@/assets/brands/jordan.svg";
import logoHoka from "@/assets/brands/on.svg"; // reserved
import logoOn from "@/assets/brands/on.svg";
import logoMizuno from "@/assets/brands/mizuno.svg";
import logoFila from "@/assets/brands/fila.svg";
import logoCrocs from "@/assets/brands/crocs.svg";

export type BrandAccent = "cyan" | "mint" | "lime";

export type Brand = {
  slug: string;
  name: string;
  mark: string; // fallback wordmark when no logo is available
  logo?: string; // optional logo SVG url
  tagline: string;
  bg: string; // css background for the tile
  accent: BrandAccent;
};

export const BRANDS: Brand[] = [
  { slug: "nike",        name: "Nike",        mark: "NK", logo: logoNike,        tagline: "Just performance",        bg: "linear-gradient(135deg,#0a0a0a,#1a1a1a)",  accent: "cyan" },
  { slug: "adidas",      name: "Adidas",      mark: "AD", logo: logoAdidas,      tagline: "Impossible is nothing",   bg: "linear-gradient(135deg,#0F1720,#103642)", accent: "cyan" },
  { slug: "new-balance", name: "New Balance", mark: "NB", logo: logoNewBalance,  tagline: "Fearlessly independent",  bg: "linear-gradient(135deg,#1a2540,#3a4bff)", accent: "cyan" },
  { slug: "puma",        name: "Puma",        mark: "PM", logo: logoPuma,        tagline: "Forever faster",          bg: "linear-gradient(135deg,#0a0a0a,#c8102e)", accent: "lime" },
  { slug: "asics",       name: "ASICS",       mark: "AS", logo: logoAsics,       tagline: "Sound mind, sound body",  bg: "linear-gradient(135deg,#0033a0,#00BFC6)", accent: "cyan" },
  { slug: "jordan",      name: "Jordan",      mark: "23", logo: logoJordan,      tagline: "Flight",                  bg: "linear-gradient(135deg,#111,#3b0a0a)",    accent: "lime" },
  { slug: "on",          name: "On",          mark: "◯",  logo: logoOn,          tagline: "Swiss engineering",       bg: "linear-gradient(135deg,#0F1720,#00BFC6)", accent: "cyan" },
  { slug: "mizuno",      name: "Mizuno",      mark: "MZ", logo: logoMizuno,      tagline: "Reach beyond",            bg: "linear-gradient(135deg,#0033a0,#111)",    accent: "cyan" },
  { slug: "fila",        name: "Fila",        mark: "FL", logo: logoFila,        tagline: "Since 1911",              bg: "linear-gradient(135deg,#0a2a5c,#c8102e)", accent: "cyan" },
  { slug: "crocs",       name: "Crocs",       mark: "◇",  logo: logoCrocs,       tagline: "Come as you are",         bg: "linear-gradient(135deg,#124638,#C7F500)", accent: "lime" },
];
void logoHoka;

// Sample products per brand — reusing existing shoe imagery as placeholders
// until the full per-brand catalog is imported.
export const BRAND_PRODUCTS: Record<string, CatalogProduct[]> = {
  nike: [
    { id: "nk-af1-cpfm", name: "Air Force 1 x CPFM", brand: "Nike", category: "Casual", price: 1299.9, old: 1599.9, tag: "Drop", img: shoeAf1Cpfm.url, colors: ["#0a0a0a", "#fff"], sizes: [40, 41, 42, 43] },
    { id: "nk-af1-ow", name: "Air Force 1 x Off-White", brand: "Nike", category: "Casual", price: 1199.9, old: 1499.9, tag: "Drop", img: shoeAf1Grey.url, colors: ["#b8b8b8", "#0a0a0a"], sizes: [40, 41, 42, 43] },
  ],
  adidas: [
    { id: "ad-boston-13", name: "Adizero Boston 13", brand: "Adidas", category: "Corrida", price: 899.9, old: 1199.9, tag: "Novo", img: shoeBostonPink.url, colors: ["#f5e6d8", "#ff4d8a"], sizes: [39, 40, 41, 42, 43] },
    { id: "ad-terrex-speed", name: "Terrex Agravic Speed 2", brand: "Adidas", category: "Trail", price: 949.9, old: 1249.9, tag: "-24%", img: shoeTerrexSpeed.url, colors: ["#f7f2e6", "#111"], sizes: [40, 41, 42, 43, 44] },
    { id: "ad-ub5-gtx", name: "Ultraboost 5 GTX", brand: "Adidas", category: "Corrida", price: 1099.9, old: 1399.9, tag: "Top", img: shoeUltraboost5.url, colors: ["#0a0a0a", "#3a4bff"], sizes: [39, 40, 41, 42, 43, 44] },
    { id: "ad-ub22", name: "Ultraboost 22", brand: "Adidas", category: "Corrida", price: 699.9, old: 999.9, tag: "-30%", img: shoeUltraboost22.url, colors: ["#c0c0c0", "#0a0a0a"], sizes: [39, 40, 41, 42, 43] },
    { id: "ad-ub20-osaka", name: "Ultraboost 20 Osaka", brand: "Adidas", category: "Corrida", price: 649.9, old: 949.9, tag: "-31%", img: shoeUb20Osaka.url, colors: ["#0a0a0a", "#ff2b2b"], sizes: [40, 41, 42, 43] },
    { id: "ad-supernova", name: "Supernova Rise", brand: "Adidas", category: "Corrida", price: 579.9, old: 819.9, tag: "-29%", img: shoeSupernova.url, colors: ["#7ec8f7"], sizes: [39, 40, 41, 42, 43, 44] },
    { id: "ad-gazelle", name: "Gazelle Indoor Red", brand: "Adidas", category: "Casual", price: 549.9, old: 799.9, tag: "-31%", img: shoeGazelleRed.url, colors: ["#c8102e"], sizes: [39, 40, 41, 42, 43] },
    { id: "ad-daroga", name: "Terrex Daroga", brand: "Adidas", category: "Trail", price: 749.9, old: 999.9, tag: "-25%", img: shoeTerrexDaroga.url, colors: ["#0a0a0a", "#fff"], sizes: [40, 41, 42, 43, 44] },
  ],
  "new-balance": [
    { id: "nb-990-grey", name: "990v6 Made in USA", brand: "New Balance", category: "Casual", price: 1499.9, tag: "Top", img: shoeUltraboost22.url, colors: ["#c0c0c0"], sizes: [40, 41, 42, 43] },
    { id: "nb-fuelcell", name: "FuelCell Rebel v4", brand: "New Balance", category: "Corrida", price: 999.9, img: shoeSupernova.url, colors: ["#7ec8f7", "#111"], sizes: [40, 41, 42, 43] },
  ],
  puma: [
    { id: "pm-deviate", name: "Deviate Nitro Elite 3", brand: "Puma", category: "Corrida", price: 1499.9, tag: "Novo", img: shoeUb20Osaka.url, colors: ["#c8102e", "#f4c400"], sizes: [40, 41, 42, 43] },
    { id: "pm-suede", name: "Suede Classic XXI", brand: "Puma", category: "Casual", price: 499.9, img: shoeGazelleRed.url, colors: ["#c8102e"], sizes: [39, 40, 41, 42] },
  ],
  asics: [
    { id: "as-nimbus", name: "Gel-Nimbus 27", brand: "ASICS", category: "Corrida", price: 1299.9, tag: "Top", img: shoeUltraboost5.url, colors: ["#3a4bff", "#0a0a0a"], sizes: [40, 41, 42, 43, 44] },
    { id: "as-kayano", name: "Gel-Kayano 31", brand: "ASICS", category: "Corrida", price: 1399.9, img: shoeSupernova.url, colors: ["#7ec8f7"], sizes: [40, 41, 42, 43] },
  ],
  converse: [
    { id: "cv-ct-hi", name: "Chuck Taylor All Star Hi", brand: "Converse", category: "Casual", price: 399.9, img: shoeGazelleRed.url, colors: ["#c8102e", "#111"], sizes: [37, 38, 39, 40, 41, 42] },
  ],
  vans: [
    { id: "vn-oldskool", name: "Old Skool Classic", brand: "Vans", category: "Casual", price: 449.9, img: shoeAf1Grey.url, colors: ["#111", "#fff"], sizes: [38, 39, 40, 41, 42, 43] },
  ],
  jordan: [
    { id: "jd-1-high", name: "Air Jordan 1 High OG", brand: "Jordan", category: "Casual", price: 1699.9, tag: "Drop", img: shoeAf1Cpfm.url, colors: ["#111", "#c8102e"], sizes: [40, 41, 42, 43] },
    { id: "jd-4-retro", name: "Air Jordan 4 Retro", brand: "Jordan", category: "Casual", price: 1899.9, tag: "Novo", img: shoeAf1Grey.url, colors: ["#b8b8b8"], sizes: [40, 41, 42, 43] },
  ],
  hoka: [
    { id: "hk-clifton", name: "Clifton 9", brand: "HOKA", category: "Corrida", price: 1099.9, tag: "Top", img: shoeSupernova.url, colors: ["#7EEBC1"], sizes: [40, 41, 42, 43] },
    { id: "hk-speedgoat", name: "Speedgoat 6", brand: "HOKA", category: "Trail", price: 1199.9, img: shoeTerrexSpeed.url, colors: ["#ff5a2b", "#111"], sizes: [40, 41, 42, 43, 44] },
  ],
  on: [
    { id: "on-cloudmonster", name: "Cloudmonster 2", brand: "On", category: "Corrida", price: 1399.9, tag: "Novo", img: shoeUltraboost22.url, colors: ["#c0c0c0", "#00BFC6"], sizes: [40, 41, 42, 43] },
  ],
  salomon: [
    { id: "sl-xt6", name: "XT-6 Trail", brand: "Salomon", category: "Trail", price: 1599.9, tag: "Drop", img: shoeTerrexDaroga.url, colors: ["#111", "#ff5a2b"], sizes: [40, 41, 42, 43, 44] },
  ],
  mizuno: [
    { id: "mz-wave", name: "Wave Rider 28", brand: "Mizuno", category: "Corrida", price: 899.9, img: shoeSupernova.url, colors: ["#0033a0", "#7ec8f7"], sizes: [40, 41, 42, 43] },
  ],
  fila: [
    { id: "fl-disruptor", name: "Disruptor II", brand: "Fila", category: "Casual", price: 499.9, img: shoeAf1Grey.url, colors: ["#fff", "#0a2a5c"], sizes: [38, 39, 40, 41, 42] },
  ],
  crocs: [
    { id: "cr-classic", name: "Classic Clog", brand: "Crocs", category: "Casual", price: 349.9, img: shoeGazelleRed.url, colors: ["#C7F500", "#111"], sizes: [38, 39, 40, 41, 42, 43] },
  ],
  timberland: [
    { id: "tb-6inch", name: "6-Inch Premium Boot", brand: "Timberland", category: "Casual", price: 1499.9, tag: "Top", img: shoeTerrexDaroga.url, colors: ["#a06a2b"], sizes: [40, 41, 42, 43] },
  ],
  gucci: [
    { id: "gc-rhyton", name: "Rhyton Leather", brand: "Gucci", category: "Casual", price: 5999.9, tag: "Luxo", img: shoeAf1Grey.url, colors: ["#f5e6d8", "#7a5230"], sizes: [40, 41, 42, 43] },
  ],
  prada: [
    { id: "pd-americas", name: "America's Cup", brand: "Prada", category: "Casual", price: 6499.9, tag: "Luxo", img: shoeAf1Cpfm.url, colors: ["#111", "#fff"], sizes: [40, 41, 42, 43] },
  ],
  "louis-vuitton": [
    { id: "lv-trainer", name: "LV Trainer Monogram", brand: "Louis Vuitton", category: "Casual", price: 8999.9, tag: "Luxo", img: shoeAf1Grey.url, colors: ["#8a5a2b", "#f5e6d8"], sizes: [40, 41, 42, 43] },
  ],
};

export function getBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}
