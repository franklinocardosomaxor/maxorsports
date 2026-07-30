import {
  shoeBostonPink,
  shoeTerrexSpeed,
  shoeUltraboost5,
  shoeUltraboost22,
  shoeUb20Osaka,
  shoeGazelleRed,
  shoeSupernova,
  shoeTerrexDaroga,
  shoeAf1Grey,
  shoeAf1Cpfm,
} from "@/lib/product-media";
import type { CatalogProduct } from "./CatalogPage";

// Brand logos supplied by Franklin. Rendered on tiles.
import logoNike from "@/assets/brands/nike.svg";
import logoAdidas from "@/assets/brands/adidas.svg";
import logoNewBalance from "@/assets/brands/new-balance.svg";
import logoPuma from "@/assets/brands/puma.svg";
import logoAsics from "@/assets/brands/asics.svg";
import logoJordan from "@/assets/brands/jordan.svg";
import logoHoka from "@/assets/brands/hoka.svg";
import logoOn from "@/assets/brands/on.svg";
import logoSalomon from "@/assets/brands/salomon.svg";
import logoMizuno from "@/assets/brands/mizuno.svg";
import logoFila from "@/assets/brands/fila.svg";
import logoCrocs from "@/assets/brands/crocs.svg";
import logoVans from "@/assets/brands/vans.svg";
import logoTimberland from "@/assets/brands/timberland.svg";
import logoGucci from "@/assets/brands/gucci.svg";
import logoPrada from "@/assets/brands/prada.svg";
import logoLouisVuitton from "@/assets/brands/louis-vuitton.svg";
import logoChuteiras from "@/assets/opt/brands/chuteiras.png";

export type BrandAccent = "cyan" | "mint" | "lime";

export type Brand = {
  slug: string;
  name: string;
  mark: string;
  logo?: string;
  tagline: string;
  bg: string;
  accent: BrandAccent;
};

export const BRANDS: Brand[] = [
  { slug: "nike",          name: "Nike",          mark: "NK", logo: logoNike,          tagline: "Just performance",       bg: "#ffffff", accent: "cyan" },
  { slug: "adidas",        name: "Adidas",        mark: "AD", logo: logoAdidas,        tagline: "Impossible is nothing",  bg: "#ffffff", accent: "cyan" },
  { slug: "new-balance",   name: "New Balance",   mark: "NB", logo: logoNewBalance,    tagline: "Fearlessly independent", bg: "#ffffff", accent: "cyan" },
  { slug: "puma",          name: "Puma",          mark: "PM", logo: logoPuma,          tagline: "Forever faster",         bg: "#ffffff", accent: "lime" },
  { slug: "asics",         name: "ASICS",         mark: "AS", logo: logoAsics,         tagline: "Sound mind, sound body", bg: "#ffffff", accent: "cyan" },
  { slug: "jordan",        name: "Jordan",        mark: "23", logo: logoJordan,        tagline: "Flight",                 bg: "#ffffff", accent: "lime" },
  { slug: "hoka",          name: "HOKA",          mark: "HK", logo: logoHoka,          tagline: "Time to fly",            bg: "#ffffff", accent: "cyan" },
  { slug: "on",            name: "On",            mark: "◯",  logo: logoOn,            tagline: "Swiss engineering",      bg: "#ffffff", accent: "cyan" },
  { slug: "salomon",       name: "Salomon",       mark: "SL", logo: logoSalomon,       tagline: "Time to play",           bg: "#ffffff", accent: "cyan" },
  { slug: "mizuno",        name: "Mizuno",        mark: "MZ", logo: logoMizuno,        tagline: "Reach beyond",           bg: "#ffffff", accent: "cyan" },
  { slug: "fila",          name: "Fila",          mark: "FL", logo: logoFila,          tagline: "Since 1911",             bg: "#ffffff", accent: "cyan" },
  { slug: "crocs",         name: "Crocs",         mark: "◇",  logo: logoCrocs,         tagline: "Come as you are",        bg: "#ffffff", accent: "lime" },
  { slug: "vans",          name: "Vans",          mark: "VN", logo: logoVans,          tagline: "Off the wall",           bg: "#ffffff", accent: "cyan" },
  { slug: "timberland",    name: "Timberland",    mark: "TB", logo: logoTimberland,    tagline: "Best then. Better now.", bg: "#ffffff", accent: "cyan" },
  { slug: "gucci",         name: "Gucci",         mark: "GG", logo: logoGucci,         tagline: "Milano since 1921",      bg: "#ffffff", accent: "lime" },
  { slug: "prada",         name: "Prada",         mark: "PR", logo: logoPrada,         tagline: "Milano",                 bg: "#ffffff", accent: "cyan" },
  { slug: "louis-vuitton", name: "Louis Vuitton", mark: "LV", logo: logoLouisVuitton,  tagline: "Paris maison",           bg: "#ffffff", accent: "cyan" },
  { slug: "chuteiras",     name: "Chuteiras",     mark: "CH", logo: logoChuteiras, tagline: "A melhor seleção para o seu jogo", bg: "#ffffff", accent: "lime" },
];

// Sample products per brand — reusing existing shoe imagery as placeholders
// until the full per-brand catalog is imported.
export const BRAND_PRODUCTS: Record<string, CatalogProduct[]> = {
  nike: [
    { id: "nk-af1-cpfm", name: "Air Force 1 x CPFM", brand: "Nike", category: "Casual", price: 1299.9, old: 1599.9, tag: "Drop", img: shoeAf1Cpfm, colors: ["#0a0a0a", "#fff"], sizes: [40, 41, 42, 43] },
    { id: "nk-af1-ow", name: "Air Force 1 x Off-White", brand: "Nike", category: "Casual", price: 1199.9, old: 1499.9, tag: "Drop", img: shoeAf1Grey, colors: ["#b8b8b8", "#0a0a0a"], sizes: [40, 41, 42, 43] },
  ],
  adidas: [
    { id: "ad-boston-13", name: "Adizero Boston 13", brand: "Adidas", category: "Corrida", price: 899.9, old: 1199.9, tag: "Novo", img: shoeBostonPink, colors: ["#f5e6d8", "#ff4d8a"], sizes: [39, 40, 41, 42, 43] },
    { id: "ad-terrex-speed", name: "Terrex Agravic Speed 2", brand: "Adidas", category: "Trail", price: 949.9, old: 1249.9, tag: "-24%", img: shoeTerrexSpeed, colors: ["#f7f2e6", "#111"], sizes: [40, 41, 42, 43, 44] },
    { id: "ad-ub5-gtx", name: "Ultraboost 5 GTX", brand: "Adidas", category: "Corrida", price: 1099.9, old: 1399.9, tag: "Top", img: shoeUltraboost5, colors: ["#0a0a0a", "#3a4bff"], sizes: [39, 40, 41, 42, 43, 44] },
    { id: "ad-ub22", name: "Ultraboost 22", brand: "Adidas", category: "Corrida", price: 699.9, old: 999.9, tag: "-30%", img: shoeUltraboost22, colors: ["#c0c0c0", "#0a0a0a"], sizes: [39, 40, 41, 42, 43] },
    { id: "ad-ub20-osaka", name: "Ultraboost 20 Osaka", brand: "Adidas", category: "Corrida", price: 649.9, old: 949.9, tag: "-31%", img: shoeUb20Osaka, colors: ["#0a0a0a", "#ff2b2b"], sizes: [40, 41, 42, 43] },
    { id: "ad-supernova", name: "Supernova Rise", brand: "Adidas", category: "Corrida", price: 579.9, old: 819.9, tag: "-29%", img: shoeSupernova, colors: ["#7ec8f7"], sizes: [39, 40, 41, 42, 43, 44] },
    { id: "ad-gazelle", name: "Gazelle Indoor Red", brand: "Adidas", category: "Casual", price: 549.9, old: 799.9, tag: "-31%", img: shoeGazelleRed, colors: ["#c8102e"], sizes: [39, 40, 41, 42, 43] },
    { id: "ad-daroga", name: "Terrex Daroga", brand: "Adidas", category: "Trail", price: 749.9, old: 999.9, tag: "-25%", img: shoeTerrexDaroga, colors: ["#0a0a0a", "#fff"], sizes: [40, 41, 42, 43, 44] },
  ],
  "new-balance": [
    { id: "nb-990-grey", name: "990v6 Made in USA", brand: "New Balance", category: "Casual", price: 1499.9, tag: "Top", img: shoeUltraboost22, colors: ["#c0c0c0"], sizes: [40, 41, 42, 43] },
    { id: "nb-fuelcell", name: "FuelCell Rebel v4", brand: "New Balance", category: "Corrida", price: 999.9, img: shoeSupernova, colors: ["#7ec8f7", "#111"], sizes: [40, 41, 42, 43] },
  ],
  puma: [
    { id: "pm-deviate", name: "Deviate Nitro Elite 3", brand: "Puma", category: "Corrida", price: 1499.9, tag: "Novo", img: shoeUb20Osaka, colors: ["#c8102e", "#f4c400"], sizes: [40, 41, 42, 43] },
    { id: "pm-suede", name: "Suede Classic XXI", brand: "Puma", category: "Casual", price: 499.9, img: shoeGazelleRed, colors: ["#c8102e"], sizes: [39, 40, 41, 42] },
  ],
  asics: [
    { id: "as-nimbus", name: "Gel-Nimbus 27", brand: "ASICS", category: "Corrida", price: 1299.9, tag: "Top", img: shoeUltraboost5, colors: ["#3a4bff", "#0a0a0a"], sizes: [40, 41, 42, 43, 44] },
    { id: "as-kayano", name: "Gel-Kayano 31", brand: "ASICS", category: "Corrida", price: 1399.9, img: shoeSupernova, colors: ["#7ec8f7"], sizes: [40, 41, 42, 43] },
  ],
  converse: [
    { id: "cv-ct-hi", name: "Chuck Taylor All Star Hi", brand: "Converse", category: "Casual", price: 399.9, img: shoeGazelleRed, colors: ["#c8102e", "#111"], sizes: [37, 38, 39, 40, 41, 42] },
  ],
  vans: [
    { id: "vn-oldskool", name: "Old Skool Classic", brand: "Vans", category: "Casual", price: 449.9, img: shoeAf1Grey, colors: ["#111", "#fff"], sizes: [38, 39, 40, 41, 42, 43] },
  ],
  jordan: [
    { id: "jd-1-high", name: "Air Jordan 1 High OG", brand: "Jordan", category: "Casual", price: 1699.9, tag: "Drop", img: shoeAf1Cpfm, colors: ["#111", "#c8102e"], sizes: [40, 41, 42, 43] },
    { id: "jd-4-retro", name: "Air Jordan 4 Retro", brand: "Jordan", category: "Casual", price: 1899.9, tag: "Novo", img: shoeAf1Grey, colors: ["#b8b8b8"], sizes: [40, 41, 42, 43] },
  ],
  hoka: [
    { id: "hk-clifton", name: "Clifton 9", brand: "HOKA", category: "Corrida", price: 1099.9, tag: "Top", img: shoeSupernova, colors: ["#7EEBC1"], sizes: [40, 41, 42, 43] },
    { id: "hk-speedgoat", name: "Speedgoat 6", brand: "HOKA", category: "Trail", price: 1199.9, img: shoeTerrexSpeed, colors: ["#ff5a2b", "#111"], sizes: [40, 41, 42, 43, 44] },
  ],
  on: [
    { id: "on-cloudmonster", name: "Cloudmonster 2", brand: "On", category: "Corrida", price: 1399.9, tag: "Novo", img: shoeUltraboost22, colors: ["#c0c0c0", "#00BFC6"], sizes: [40, 41, 42, 43] },
  ],
  salomon: [
    { id: "sl-xt6", name: "XT-6 Trail", brand: "Salomon", category: "Trail", price: 1599.9, tag: "Drop", img: shoeTerrexDaroga, colors: ["#111", "#ff5a2b"], sizes: [40, 41, 42, 43, 44] },
  ],
  mizuno: [
    { id: "mz-wave", name: "Wave Rider 28", brand: "Mizuno", category: "Corrida", price: 899.9, img: shoeSupernova, colors: ["#0033a0", "#7ec8f7"], sizes: [40, 41, 42, 43] },
  ],
  fila: [
    { id: "fl-disruptor", name: "Disruptor II", brand: "Fila", category: "Casual", price: 499.9, img: shoeAf1Grey, colors: ["#fff", "#0a2a5c"], sizes: [38, 39, 40, 41, 42] },
  ],
  crocs: [
    { id: "cr-classic", name: "Classic Clog", brand: "Crocs", category: "Casual", price: 349.9, img: shoeGazelleRed, colors: ["#C7F500", "#111"], sizes: [38, 39, 40, 41, 42, 43] },
  ],
  timberland: [
    { id: "tb-6inch", name: "6-Inch Premium Boot", brand: "Timberland", category: "Casual", price: 1499.9, tag: "Top", img: shoeTerrexDaroga, colors: ["#a06a2b"], sizes: [40, 41, 42, 43] },
  ],
  gucci: [
    { id: "gc-rhyton", name: "Rhyton Leather", brand: "Gucci", category: "Casual", price: 5999.9, tag: "Luxo", img: shoeAf1Grey, colors: ["#f5e6d8", "#7a5230"], sizes: [40, 41, 42, 43] },
  ],
  prada: [
    { id: "pd-americas", name: "America's Cup", brand: "Prada", category: "Casual", price: 6499.9, tag: "Luxo", img: shoeAf1Cpfm, colors: ["#111", "#fff"], sizes: [40, 41, 42, 43] },
  ],
  "louis-vuitton": [
    { id: "lv-trainer", name: "LV Trainer Monogram", brand: "Louis Vuitton", category: "Casual", price: 8999.9, tag: "Luxo", img: shoeAf1Grey, colors: ["#8a5a2b", "#f5e6d8"], sizes: [40, 41, 42, 43] },
  ],
  chuteiras: [],
};

export function getBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}
