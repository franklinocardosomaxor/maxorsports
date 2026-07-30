/**
 * PRODUCT MEDIA — placeholders vetoriais (data-URI SVG) para o catálogo.
 *
 * Durante a construção do site usamos fotos de produto locais em
 * `src/assets/opt/*.jpg`. Para a importação no CRM o repositório deve ficar
 * limpo: nenhuma foto de produto versionada. Cada modelo passa a apontar para
 * um placeholder gerado em runtime (sem arquivo binário), preservando:
 *
 *  - a identidade visual (Navy / Cyan / Mint / Lime);
 *  - a unicidade por modelo (o agrupamento de variações de cor em
 *    `src/lib/catalog.ts` usa a URL da imagem como chave de modelo).
 *
 * No CRM, o campo `img` de cada produto passa a receber a URL pública da
 * mídia cadastrada (Storage/CDN). Basta substituir o valor — a tipagem
 * (`CatalogProduct.img: string`) não muda.
 */

const NAVY = "#0F1720";
const ACCENTS = ["#00BFC6", "#7EEBC1", "#C7F500"] as const;

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Gera um placeholder SVG único e determinístico para um modelo.
 * @param slug identificador estável do modelo (ex.: "ultraboost-5")
 * @param label texto curto exibido no placeholder
 */
export function productPlaceholder(slug: string, label = "MAXOR"): string {
  const accent = ACCENTS[hash(slug) % ACCENTS.length];
  const angle = hash(slug + "a") % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
<defs><linearGradient id="g" gradientTransform="rotate(${angle} 0.5 0.5)">
<stop offset="0%" stop-color="${NAVY}"/><stop offset="100%" stop-color="${accent}" stop-opacity="0.35"/>
</linearGradient></defs>
<rect width="640" height="640" fill="url(#g)"/>
<circle cx="320" cy="300" r="150" fill="none" stroke="${accent}" stroke-opacity="0.55" stroke-width="2"/>
<text x="320" y="312" text-anchor="middle" font-family="Rajdhani,Inter,sans-serif" font-size="46" font-weight="700" fill="${accent}" letter-spacing="4">${label
    .toUpperCase()
    .slice(0, 16)}</text>
<text x="320" y="352" text-anchor="middle" font-family="Inter,sans-serif" font-size="18" fill="#F7F8F5" fill-opacity="0.55" letter-spacing="6">MAXOR SPORTS</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Placeholders dos modelos usados nos seeds do catálogo (pré-CRM). */
export const shoeBostonPink = productPlaceholder("boston-13", "Boston 13");
export const shoeTerrexSpeed = productPlaceholder("terrex-speed", "Terrex Speed");
export const shoeUltraboost5 = productPlaceholder("ultraboost-5", "Ultraboost 5");
export const shoeUltraboost22 = productPlaceholder("ultraboost-22", "Ultraboost 22");
export const shoeUb20Osaka = productPlaceholder("ultraboost-20", "Ultraboost 20");
export const shoeGazelleRed = productPlaceholder("gazelle", "Gazelle");
export const shoeSupernova = productPlaceholder("supernova", "Supernova");
export const shoeTerrexDaroga = productPlaceholder("terrex-daroga", "Terrex Daroga");
export const shoeAf1Grey = productPlaceholder("af1-grey", "Air Force 1");
export const shoeAf1Cpfm = productPlaceholder("af1-cpfm", "AF1 CPFM");
