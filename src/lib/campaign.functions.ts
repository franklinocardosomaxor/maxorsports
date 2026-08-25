/**
 * Server functions do banner de campanha do site (MaxorCRM → Home).
 *
 * - uploadCampaignImage: recebe base64 do painel, sobe no bucket privado
 *   `product-images` (pasta campaign/) e devolve a URL pública via proxy.
 * - Somente super-administradores podem enviar imagens.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SiteCampaign = {
  id: string;
  active: boolean;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_url: string | null;
  images: string[];
  updated_at: string;
};

export const uploadCampaignImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        imageDataUrl: z.string().startsWith("data:image/").max(8_000_000),
        index: z.number().int().min(0).max(2),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Só super-admin pode subir arte de campanha.
    const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "super_admin",
    });
    if (roleErr || !isAdmin) {
      throw new Error("Apenas super-administradores podem alterar a campanha.");
    }

    const { resolveCrmImage } = await import("@/lib/crm-images.server");
    const url = await resolveCrmImage(data.imageDataUrl, "campaign", data.index + 1);
    if (!url) throw new Error("Não foi possível processar a imagem enviada.");

    return { url };
  });
