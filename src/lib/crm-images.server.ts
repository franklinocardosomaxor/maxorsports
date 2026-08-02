/**
 * Recepção de imagens do CRM.
 *
 * Regra definitiva: o site só exibe imagens que ele mesmo consegue servir.
 * - URL pública https  -> mantida como está.
 * - base64 / data URL  -> enviada para o bucket privado `product-images`
 *                          e devolvida como URL de proxy (/api/public/crm/image/...).
 * - URL local (127.0.0.1, localhost, IP de rede interna, file://) -> BAIXADA
 *   pelo servidor não é possível (a nuvem não alcança a máquina do CRM), então
 *   a imagem é DESCARTADA para não gravar link quebrado no catálogo.
 */

const LOCAL_HOST_RE =
  /^(https?:)?\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:|\/|$)/i;

/** URL que o navegador do cliente jamais conseguiria abrir. */
export const isUnreachableUrl = (u: string) =>
  LOCAL_HOST_RE.test(u.trim()) || /^file:\/\//i.test(u.trim());

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const decodeBase64 = (b64: string): Uint8Array => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

/**
 * Resolve UMA imagem recebida do CRM em uma URL utilizável pelo site.
 * Retorna `null` quando a imagem é inalcançável (link local) ou inválida.
 */
export async function resolveCrmImage(
  value: string,
  sku: string,
  index: number,
): Promise<string | null> {
  const raw = value.trim();
  if (!raw) return null;

  // 1) data URL / base64 puro -> sobe pro Storage
  const dataMatch = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(raw);
  const looksBase64 = !dataMatch && raw.length > 256 && /^[A-Za-z0-9+/=\s]+$/.test(raw);

  if (dataMatch || looksBase64) {
    try {
      const mime = dataMatch?.[1]?.toLowerCase() ?? "image/jpeg";
      const b64 = (dataMatch?.[2] ?? raw).replace(/\s/g, "");
      const bytes = decodeBase64(b64);
      const ext = EXT_BY_MIME[mime] ?? "jpg";
      const path = `${sku}/${index}-${Date.now()}.${ext}`;

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.storage
        .from("product-images")
        .upload(path, bytes, { contentType: mime, upsert: true });
      if (error) return null;

      return `/api/public/crm/image/${path}`;
    } catch {
      return null;
    }
  }

  // 2) caminho relativo já servido pelo proxy do site
  if (raw.startsWith("/api/public/crm/image/")) return raw;

  // 3) URL local do CRM -> inalcançável a partir da nuvem
  if (isUnreachableUrl(raw)) return null;

  // 4) URL pública
  if (/^https?:\/\//i.test(raw)) return raw;

  return null;
}

/** Resolve a galeria inteira, preservando a ordem e removendo duplicatas/nulos. */
export async function resolveCrmImages(list: string[], sku: string): Promise<string[]> {
  const out: string[] = [];
  for (let i = 0; i < list.length && out.length < 20; i++) {
    const resolved = await resolveCrmImage(list[i], sku, i);
    if (resolved && !out.includes(resolved)) out.push(resolved);
  }
  return out;
}
