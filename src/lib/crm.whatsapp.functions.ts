import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const sendWhatsappTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      to: z.string().regex(/^\d{10,15}$/),
      template_name: z.string().min(1).max(80),
      language: z.string().default("pt_BR"),
      components: z.array(z.any()).optional(),
    }).parse(data))
  .handler(async ({ data }) => {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneId) {
      throw new Error("WhatsApp Cloud API não configurada — defina WHATSAPP_ACCESS_TOKEN e WHATSAPP_PHONE_NUMBER_ID.");
    }
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: data.to,
        type: "template",
        template: {
          name: data.template_name,
          language: { code: data.language },
          components: data.components ?? [],
        },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`WhatsApp ${res.status}: ${body}`);
    }
    return await res.json();
  });
