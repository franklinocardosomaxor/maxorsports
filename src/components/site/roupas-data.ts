import academiaIcon from "@/assets/roupas/academia.png.asset.json";
import futebolIcon from "@/assets/roupas/futebol.png.asset.json";
import diversasIcon from "@/assets/roupas/diversas.png.asset.json";
import type { CatalogProduct } from "./CatalogPage";

export type RoupaCategory = {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  accent: "cyan" | "mint" | "lime";
};

export const ROUPAS: RoupaCategory[] = [
  { slug: "academia", name: "Academia", tagline: "Treino, força e mobilidade", icon: academiaIcon.url, accent: "cyan" },
  { slug: "futebol", name: "Futebol", tagline: "Camisas, shorts e uniformes", icon: futebolIcon.url, accent: "mint" },
  { slug: "diversas", name: "Diversas", tagline: "Casual, street e lifestyle", icon: diversasIcon.url, accent: "lime" },
];

export const ROUPA_PRODUCTS: Record<string, CatalogProduct[]> = {
  academia: [],
  futebol: [],
  diversas: [],
};

export const getRoupa = (slug: string) => ROUPAS.find((r) => r.slug === slug);
