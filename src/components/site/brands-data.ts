// Identidade VISUAL das marcas (logos, selos, taglines).
// A lista oficial de marcas (slug/nome/aliases) vive em src/lib/brands.ts —
// este arquivo apenas adiciona a camada visual por cima dela. Nunca cadastre
// uma marca aqui sem cadastrá-la antes em src/lib/brands.ts.
import { BRAND_DEFS, type BrandDirectoryEntry } from "@/lib/brands";

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
import logoConverse from "@/assets/brands/converse.svg";
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

type BrandVisual = { mark: string; logo?: string; tagline: string; accent: BrandAccent };

const VISUALS: Record<string, BrandVisual> = {
  "nike":          { mark: "NK", logo: logoNike,          tagline: "Just performance",       accent: "cyan" },
  "adidas":        { mark: "AD", logo: logoAdidas,        tagline: "Impossible is nothing",  accent: "cyan" },
  "new-balance":   { mark: "NB", logo: logoNewBalance,    tagline: "Fearlessly independent", accent: "cyan" },
  "puma":          { mark: "PM", logo: logoPuma,          tagline: "Forever faster",         accent: "lime" },
  "asics":         { mark: "AS", logo: logoAsics,         tagline: "Sound mind, sound body", accent: "cyan" },
  "converse":      { mark: "CV", logo: logoConverse,      tagline: "Chuck Taylor legacy",    accent: "cyan" },
  "vans":          { mark: "VN", logo: logoVans,          tagline: "Off the wall",           accent: "cyan" },
  "jordan":        { mark: "23", logo: logoJordan,        tagline: "Flight",                 accent: "lime" },
  "hoka":          { mark: "HK", logo: logoHoka,          tagline: "Time to fly",            accent: "cyan" },
  "on":            { mark: "◯",  logo: logoOn,            tagline: "Swiss engineering",      accent: "cyan" },
  "salomon":       { mark: "SL", logo: logoSalomon,       tagline: "Time to play",           accent: "cyan" },
  "mizuno":        { mark: "MZ", logo: logoMizuno,        tagline: "Reach beyond",           accent: "cyan" },
  "fila":          { mark: "FL", logo: logoFila,          tagline: "Since 1911",             accent: "cyan" },
  "crocs":         { mark: "◇",  logo: logoCrocs,         tagline: "Come as you are",        accent: "lime" },
  "timberland":    { mark: "TB", logo: logoTimberland,    tagline: "Best then. Better now.", accent: "cyan" },
  "gucci":         { mark: "GG", logo: logoGucci,         tagline: "Milano since 1921",      accent: "lime" },
  "prada":         { mark: "PR", logo: logoPrada,         tagline: "Milano",                 accent: "cyan" },
  "louis-vuitton": { mark: "LV", logo: logoLouisVuitton,  tagline: "Paris maison",           accent: "cyan" },
  "chuteiras":     { mark: "CH", logo: logoChuteiras,     tagline: "A melhor seleção para o seu jogo", accent: "lime" },
};

export const BRANDS: Brand[] = BRAND_DEFS.map((def) => ({
  slug: def.slug,
  name: def.name,
  bg: "#ffffff",
  ...(VISUALS[def.slug] ?? { mark: def.name.slice(0, 2).toUpperCase(), tagline: def.name, accent: "cyan" as BrandAccent }),
}));

export function getBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}
