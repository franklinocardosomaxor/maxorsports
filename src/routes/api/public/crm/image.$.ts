/**
 * Proxy público de imagens do catálogo.
 *
 * GET /api/public/crm/image/<caminho-no-bucket>
 *
 * O bucket `product-images` é PRIVADO. Este endpoint lê o arquivo com a chave
 * de serviço e devolve os bytes com cache longo, gerando uma URL https pública
 * e estável que o CRM pode gravar no produto.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/crm/image/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = String((params as { _splat?: string })._splat ?? "").replace(/^\/+/, "");
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        // Leitura direta na API de Storage (o cliente gerado remove o header
        // Authorization com chaves sb_secret_, que o Storage exige).
        const baseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!baseUrl || !serviceKey) return new Response("Not found", { status: 404 });

        const res = await fetch(`${baseUrl}/storage/v1/object/product-images/${path}`, {
          headers: { apikey: serviceKey, authorization: `Bearer ${serviceKey}` },
        });
        if (!res.ok) return new Response("Not found", { status: 404 });

        return new Response(await res.arrayBuffer(), {
          headers: {
            "content-type": res.headers.get("content-type") || "image/jpeg",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });

      },
    },
  },
});
