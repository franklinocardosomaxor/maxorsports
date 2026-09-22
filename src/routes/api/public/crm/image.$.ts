/**
 * Proxy público de imagens do catálogo.
 *
 * GET /api/public/crm/image/<caminho-no-bucket>[?w=640&q=78]
 *
 * O bucket `product-images` é PRIVADO. Este endpoint lê o arquivo com a chave
 * de serviço e devolve os bytes com cache longo, gerando uma URL https pública
 * e estável que o CRM pode gravar no produto.
 *
 * Com `?w=` a imagem é redimensionada pelo transformador do Storage (WebP
 * quando o navegador aceita), o que reduce drasticamente o peso das vitrines.
 * Se o redimensionamento não estiver disponível, cai automaticamente para o
 * arquivo original — nenhuma foto deixa de aparecer.
 */
import { createFileRoute } from "@tanstack/react-router";

/** Larguras aceitas (evita cache infinito por parâmetro arbitrário). */
const ALLOWED_WIDTHS = [160, 320, 480, 640, 960, 1280, 1600, 1920];

const clampWidth = (raw: string | null): number | null => {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return ALLOWED_WIDTHS.find((w) => w >= n) ?? ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];
};

export const Route = createFileRoute("/api/public/crm/image/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = String((params as { _splat?: string })._splat ?? "").replace(/^\/+/, "");
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        // Leitura direta na API de Storage (o cliente gerado remove o header
        // Authorization com chaves sb_secret_, que o Storage exige).
        const baseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!baseUrl || !serviceKey) return new Response("Not found", { status: 404 });

        const auth = { apikey: serviceKey, authorization: `Bearer ${serviceKey}` };
        const url = new URL(request.url);
        const width = clampWidth(url.searchParams.get("w"));
        const quality = Math.min(Math.max(Number(url.searchParams.get("q")) || 78, 40), 95);

        let res: Response | null = null;

        if (width) {
          // Transformação no Storage: mantém a proporção (resize=contain) e
          // devolve WebP/AVIF conforme o Accept do navegador.
          const accept = request.headers.get("accept") ?? "";
          const render = `${baseUrl}/storage/v1/render/image/authenticated/product-images/${path}?width=${width}&quality=${quality}&resize=contain`;
          try {
            const r = await fetch(render, { headers: { ...auth, accept } });
            if (r.ok) res = r;
          } catch {
            res = null;
          }
        }

        if (!res) {
          res = await fetch(`${baseUrl}/storage/v1/object/product-images/${path}`, {
            headers: auth,
          });
        }
        if (!res.ok) return new Response("Not found", { status: 404 });

        return new Response(await res.arrayBuffer(), {
          headers: {
            "content-type": res.headers.get("content-type") || "image/jpeg",
            "cache-control": "public, max-age=31536000, immutable",
            vary: "Accept",
          },
        });
      },
    },
  },
});
