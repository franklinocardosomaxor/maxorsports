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

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("product-images").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "image/jpeg",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
