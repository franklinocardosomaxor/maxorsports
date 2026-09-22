/**
 * Entrega de fotos do catálogo no tamanho certo para cada lugar.
 *
 * As fotos ficam no bucket privado `product-images` e são servidas pelo proxy
 * /api/public/crm/image/<caminho>. O proxy aceita `?w=` (largura) e devolve a
 * versão redimensionada (WebP quando o navegador aceita). Nada é recortado:
 * a proporção original é preservada.
 *
 * Só URLs do próprio proxy são transformadas — links https externos ficam
 * exatamente como o CRM cadastrou.
 */

/** Larguras padrão usadas nos `srcset` do site. */
export const IMG_WIDTHS = [160, 320, 480, 640, 960, 1280, 1600] as const;

const isProxied = (url: unknown): url is string =>
  typeof url === "string" && url.startsWith("/api/public/crm/image/");

/** URL da foto numa largura específica (fallback: a URL original). */
export function imgSrc(url: string | undefined | null, width: number): string {
  if (!isProxied(url)) return String(url ?? "");
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}w=${Math.round(width)}`;
}

/**
 * `srcset` com as larguras úteis para o tamanho de exibição informado.
 * Gera até 2x o tamanho renderizado (telas retina) e nada além disso.
 */
export function imgSrcSet(url: string | undefined | null, displayWidth: number): string | undefined {
  if (!isProxied(url)) return undefined;
  const max = displayWidth * 2;
  const widths = IMG_WIDTHS.filter((w) => w <= max);
  if (widths.length === 0) widths.push(IMG_WIDTHS[0]);
  else if (widths[widths.length - 1] < max) {
    const next = IMG_WIDTHS.find((w) => w > max);
    if (next) widths.push(next);
  }
  return widths.map((w) => `${imgSrc(url, w)} ${w}w`).join(", ");
}

/**
 * Props prontas para um `<img>` de catálogo.
 * `displayWidth` é a largura aproximada em que a foto aparece na tela.
 */
export function imgProps(
  url: string | undefined | null,
  displayWidth: number,
  opts: { priority?: boolean; sizes?: string } = {},
) {
  const { priority = false, sizes } = opts;
  return {
    src: imgSrc(url, Math.round(displayWidth * 2)),
    srcSet: imgSrcSet(url, displayWidth),
    sizes: sizes ?? `${Math.round(displayWidth)}px`,
    loading: (priority ? "eager" : "lazy") as "eager" | "lazy",
    decoding: "async" as const,
    fetchPriority: (priority ? "high" : "auto") as "high" | "auto",
  };
}
