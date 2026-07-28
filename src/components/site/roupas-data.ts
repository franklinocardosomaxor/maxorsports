import academiaIcon from "@/assets/opt/roupas/academia.png";
import futebolIcon from "@/assets/opt/roupas/futebol.png";
import diversasIcon from "@/assets/opt/roupas/diversas.png";
import type { CatalogProduct } from "./CatalogPage";

export type RoupaCategory = {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  accent: "cyan" | "mint" | "lime";
};

export const ROUPAS: RoupaCategory[] = [
  { slug: "academia", name: "Academia", tagline: "Treino, força e mobilidade", icon: academiaIcon, accent: "cyan" },
  { slug: "futebol", name: "Futebol", tagline: "Camisas, shorts e uniformes", icon: futebolIcon, accent: "mint" },
  { slug: "diversas", name: "Diversas", tagline: "Casual, street e lifestyle", icon: diversasIcon, accent: "lime" },
];

export const ROUPA_PRODUCTS: Record<string, CatalogProduct[]> = {
  academia: [],
  futebol: [],
  diversas: [],
};

export const getRoupa = (slug: string) => ROUPAS.find((r) => r.slug === slug);
