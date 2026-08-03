
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


export function getBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}
