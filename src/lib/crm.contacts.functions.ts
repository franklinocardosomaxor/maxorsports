import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createLeadInput = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable(),
  phone_e164: z.string().max(32).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  tags: z.array(z.string().max(40)).max(20).default([]),
  source: z.string().max(60).optional().nullable(),
});

export const createLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createLeadInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: orgRow, error: orgErr } = await supabase
      .from("user_roles").select("org_id").eq("user_id", userId).limit(1).single();
    if (orgErr || !orgRow) throw new Error("Organização não encontrada");

    const { data: row, error } = await supabase
      .from("contacts")
      .insert({ ...data, org_id: orgRow.org_id, owner_id: userId })
      .select().single();
    if (error) throw error;
    return row;
  });

export const listContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("contacts").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    return data ?? [];
  });

export const recordNewsletterSignup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ email: z.string().email() }).parse(data))
  .handler(async ({ data }) => {
    // Público — captura via formulário do site. Usa admin client (dentro do handler).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Escolhe a primeira org como destino (para site single-tenant do agente Maxor).
    const { data: org } = await supabaseAdmin
      .from("organizations").select("id").order("created_at", { ascending: true }).limit(1).single();
    if (!org) return { ok: false, reason: "no_org" as const };

    const { error } = await supabaseAdmin.from("contacts").upsert({
      org_id: org.id,
      name: data.email.split("@")[0],
      email: data.email,
      tags: ["newsletter"],
      source: "site_newsletter",
    }, { onConflict: "email" });
    if (error) throw error;
    return { ok: true };
  });
