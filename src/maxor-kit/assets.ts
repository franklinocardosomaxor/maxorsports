/**
 * MAXOR KIT — Biblioteca de imagens
 *
 * Registro único de TODA a mídia do site (logos de marca, ícones de
 * categoria, capas, monograma e vídeo do hero). O CRM importa daqui em vez
 * de referenciar caminhos soltos — assim qualquer troca de mídia acontece
 * num só lugar.
 *
 * Observação: fotos de produto NÃO são versionadas. Enquanto o CRM não
 * cadastrar mídia real, use `productPlaceholder()` (SVG data-URI, único e
 * determinístico por modelo).
 */

import logoAdidas from "@/assets/brands/adidas.svg";
import logoAsics from "@/assets/brands/asics.svg";
import logoCrocs from "@/assets/brands/crocs.svg";
import logoFila from "@/assets/brands/fila.svg";
import logoGucci from "@/assets/brands/gucci.svg";
import logoHoka from "@/assets/brands/hoka.svg";
import logoJordan from "@/assets/brands/jordan.svg";
import logoLouisVuitton from "@/assets/brands/louis-vuitton.svg";
import logoMizuno from "@/assets/brands/mizuno.svg";
import logoNewBalance from "@/assets/brands/new-balance.svg";
import logoNike from "@/assets/brands/nike.svg";
import logoOn from "@/assets/brands/on.svg";
import logoPrada from "@/assets/brands/prada.svg";
import logoPuma from "@/assets/brands/puma.svg";
import logoSalomon from "@/assets/brands/salomon.svg";
import logoTimberland from "@/assets/brands/timberland.svg";
import logoVans from "@/assets/brands/vans.svg";

import iconChuteiras from "@/assets/opt/brands/chuteiras.png";
import iconAcademia from "@/assets/opt/roupas/academia.png";
import iconFutebol from "@/assets/opt/roupas/futebol.png";
import iconDiversas from "@/assets/opt/roupas/diversas.png";

import maxorMonogram from "@/assets/opt/maxor-monogram.png";
import capaMasculino from "@/assets/cat-masculino.jpg";
import capaFeminino from "@/assets/cat-feminino.jpg";
import heroVideoAsset from "@/assets/atletas-correndo.mp4.asset.json";

export { productPlaceholder } from "@/lib/product-media";

/** Logos de marca (SVG monocromático, pensados para fundo Navy). */
export const brandLogos = {
  adidas: logoAdidas,
  asics: logoAsics,
  crocs: logoCrocs,
  fila: logoFila,
  gucci: logoGucci,
  hoka: logoHoka,
  jordan: logoJordan,
  "louis-vuitton": logoLouisVuitton,
  mizuno: logoMizuno,
  "new-balance": logoNewBalance,
  nike: logoNike,
  on: logoOn,
  prada: logoPrada,
  puma: logoPuma,
  salomon: logoSalomon,
  timberland: logoTimberland,
  vans: logoVans,
} as const;

export type BrandLogoSlug = keyof typeof brandLogos;

/** Ícones de categoria (chuteiras + linhas de roupa). */
export const categoryIcons = {
  chuteiras: iconChuteiras,
  academia: iconAcademia,
  futebol: iconFutebol,
  diversas: iconDiversas,
} as const;

export type CategoryIconSlug = keyof typeof categoryIcons;

/** Identidade e mídia editorial. */
export const brandMedia = {
  monogram: maxorMonogram,
  capaMasculino,
  capaFeminino,
  /** Vídeo do hero servido pelo CDN Lovable. */
  heroVideo: heroVideoAsset.url,
} as const;

/** Catálogo plano de toda a mídia — útil para telas de "biblioteca" no CRM. */
export type MaxorAsset = {
  key: string;
  url: string;
  kind: "brand-logo" | "category-icon" | "brand-media" | "video";
  label: string;
};

export const MAXOR_ASSET_LIBRARY: MaxorAsset[] = [
  ...Object.entries(brandLogos).map(([key, url]) => ({
    key,
    url: url as string,
    kind: "brand-logo" as const,
    label: key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  })),
  ...Object.entries(categoryIcons).map(([key, url]) => ({
    key,
    url: url as string,
    kind: "category-icon" as const,
    label: key.replace(/\b\w/g, (c) => c.toUpperCase()),
  })),
  { key: "monogram", url: brandMedia.monogram, kind: "brand-media", label: "Monograma Maxor" },
  { key: "capa-masculino", url: brandMedia.capaMasculino, kind: "brand-media", label: "Capa Masculino" },
  { key: "capa-feminino", url: brandMedia.capaFeminino, kind: "brand-media", label: "Capa Feminino" },
  { key: "hero-video", url: brandMedia.heroVideo, kind: "video", label: "Atletas correndo (hero)" },
];

export function getBrandLogo(slug: string): string | undefined {
  return brandLogos[slug as BrandLogoSlug];
}

export function getCategoryIcon(slug: string): string | undefined {
  return categoryIcons[slug as CategoryIconSlug];
}
