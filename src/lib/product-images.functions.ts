import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const uploadProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        imageDataUrl: z.string().startsWith("data:image/").max(8_000_000),
        sku: z.string().trim().min(1).max(120),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const [superAdmin, admin] = await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    ]);

    if ((!superAdmin.data && !admin.data) || (superAdmin.error && admin.error)) {
      throw new Error("Apenas administradores podem enviar imagens de produto.");
    }

    const safeSku = data.sku.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80) || "produto";
    const { resolveCrmImage } = await import("@/lib/crm-images.server");
    const url = await resolveCrmImage(data.imageDataUrl, safeSku, Date.now());
    if (!url) throw new Error("Não foi possível processar a imagem enviada.");

    return { url };
  });