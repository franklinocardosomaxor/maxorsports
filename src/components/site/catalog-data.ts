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

export const MASCULINO: CatalogProduct[] = [
  { id: "m-boston-13", name: "Adizero Boston 13", brand: "Adidas", category: "Corrida", price: 899.9, old: 1199.9, tag: "Novo", img: shoeBostonPink, colors: ["#f5e6d8", "#ff4d8a"], sizes: [39, 40, 41, 42, 43] },
  { id: "m-terrex-speed", name: "Terrex Agravic Speed 2", brand: "Adidas", category: "Trail", price: 949.9, old: 1249.9, tag: "-24%", img: shoeTerrexSpeed, colors: ["#f7f2e6", "#111", "#ff5a2b"], sizes: [40, 41, 42, 43, 44] },
  { id: "m-ub5-gtx", name: "Ultraboost 5 GTX", brand: "Adidas", category: "Corrida", price: 1099.9, old: 1399.9, tag: "Top", img: shoeUltraboost5, colors: ["#0a0a0a", "#3a4bff"], sizes: [39, 40, 41, 42, 43, 44] },
  { id: "m-af1-cpfm", name: "Air Force 1 x CPFM", brand: "Nike", category: "Casual", price: 1299.9, old: 1599.9, tag: "Drop", img: shoeAf1Cpfm, colors: ["#0a0a0a", "#fff"], sizes: [40, 41, 42, 43] },
  { id: "m-ub22", name: "Ultraboost 22 Grey", brand: "Adidas", category: "Corrida", price: 699.9, old: 999.9, tag: "-30%", img: shoeUltraboost22, colors: ["#c0c0c0", "#0a0a0a"], sizes: [39, 40, 41, 42, 43] },
  { id: "m-ub20-osaka", name: "Ultraboost 20 Osaka", brand: "Adidas", category: "Corrida", price: 649.9, old: 949.9, tag: "-31%", img: shoeUb20Osaka, colors: ["#0a0a0a", "#ff2b2b", "#f4c400"], sizes: [40, 41, 42, 43] },
  { id: "m-supernova", name: "Supernova Rise 3M", brand: "Adidas", category: "Corrida", price: 579.9, old: 819.9, tag: "-29%", img: shoeSupernova, colors: ["#7ec8f7"], sizes: [39, 40, 41, 42, 43, 44] },
  { id: "m-gazelle", name: "Gazelle Indoor Red", brand: "Adidas", category: "Casual", price: 549.9, old: 799.9, tag: "-31%", img: shoeGazelleRed, colors: ["#c8102e"], sizes: [39, 40, 41, 42, 43] },
  { id: "m-af1-grey", name: "Air Force 1 x Off-White", brand: "Nike", category: "Casual", price: 1199.9, old: 1499.9, tag: "Drop", img: shoeAf1Grey, colors: ["#b8b8b8", "#0a0a0a"], sizes: [40, 41, 42, 43] },
  { id: "m-daroga", name: "Terrex Daroga", brand: "Adidas", category: "Trail", price: 749.9, old: 999.9, tag: "-25%", img: shoeTerrexDaroga, colors: ["#0a0a0a", "#fff"], sizes: [40, 41, 42, 43, 44] },
];

export const FEMININO: CatalogProduct[] = [
  { id: "f-boston-13", name: "Adizero Boston 13 W", brand: "Adidas", category: "Corrida", price: 899.9, old: 1199.9, tag: "Novo", img: shoeBostonPink, colors: ["#ff4d8a", "#f5e6d8"], sizes: [34, 35, 36, 37, 38, 39] },
  { id: "f-supernova", name: "Supernova Rise Ice", brand: "Adidas", category: "Corrida", price: 579.9, old: 819.9, tag: "-29%", img: shoeSupernova, colors: ["#7ec8f7", "#7EEBC1"], sizes: [34, 35, 36, 37, 38] },
  { id: "f-gazelle", name: "Gazelle Ruby", brand: "Adidas", category: "Casual", price: 549.9, old: 799.9, tag: "-31%", img: shoeGazelleRed, colors: ["#c8102e", "#ff9ec6"], sizes: [34, 35, 36, 37, 38, 39] },
  { id: "f-af1-grey", name: "Air Force 1 Mist", brand: "Nike", category: "Casual", price: 1199.9, old: 1499.9, tag: "Drop", img: shoeAf1Grey, colors: ["#b8b8b8", "#fff"], sizes: [35, 36, 37, 38] },
  { id: "f-ub22", name: "Ultraboost 22 Rose", brand: "Adidas", category: "Corrida", price: 699.9, old: 999.9, tag: "-30%", img: shoeUltraboost22, colors: ["#c0c0c0", "#ff9ec6"], sizes: [34, 35, 36, 37, 38, 39] },
  { id: "f-terrex", name: "Terrex Daroga W", brand: "Adidas", category: "Trail", price: 749.9, old: 999.9, tag: "-25%", img: shoeTerrexDaroga, colors: ["#7EEBC1", "#0a0a0a"], sizes: [35, 36, 37, 38, 39] },
  { id: "f-ub20", name: "Ultraboost 20 Petal", brand: "Adidas", category: "Corrida", price: 649.9, old: 949.9, tag: "-31%", img: shoeUb20Osaka, colors: ["#ff2b2b", "#ff9ec6"], sizes: [34, 35, 36, 37, 38] },
  { id: "f-af1-cpfm", name: "Air Force 1 x CPFM W", brand: "Nike", category: "Casual", price: 1299.9, old: 1599.9, tag: "Drop", img: shoeAf1Cpfm, colors: ["#0a0a0a", "#fff", "#ff9ec6"], sizes: [35, 36, 37, 38] },
];

export const INFANTIL: CatalogProduct[] = [
  { id: "k-boston", name: "Adizero Kids", brand: "Adidas", category: "Corrida", price: 499.9, old: 699.9, tag: "Novo", img: shoeBostonPink, colors: ["#ff4d8a", "#7EEBC1"], sizes: [28, 29, 30, 31, 32, 33] },
  { id: "k-supernova", name: "Supernova Rise Jr", brand: "Adidas", category: "Corrida", price: 379.9, old: 519.9, tag: "-27%", img: shoeSupernova, colors: ["#7ec8f7", "#C7F500"], sizes: [28, 29, 30, 31, 32] },
  { id: "k-gazelle", name: "Gazelle Kids", brand: "Adidas", category: "Casual", price: 349.9, old: 499.9, tag: "-30%", img: shoeGazelleRed, colors: ["#c8102e", "#00BFC6"], sizes: [26, 27, 28, 29, 30, 31, 32] },
  { id: "k-ub22", name: "Ultraboost Jr", brand: "Adidas", category: "Corrida", price: 499.9, old: 699.9, tag: "-28%", img: shoeUltraboost22, colors: ["#c0c0c0", "#C7F500"], sizes: [30, 31, 32, 33, 34] },
  { id: "k-af1", name: "Air Force 1 Kids", brand: "Nike", category: "Casual", price: 599.9, old: 799.9, tag: "Top", img: shoeAf1Grey, colors: ["#fff", "#00BFC6"], sizes: [28, 29, 30, 31, 32, 33] },
  { id: "k-terrex", name: "Terrex Kids Trail", brand: "Adidas", category: "Trail", price: 429.9, old: 599.9, tag: "-28%", img: shoeTerrexDaroga, colors: ["#0a0a0a", "#C7F500"], sizes: [28, 29, 30, 31, 32] },
];
