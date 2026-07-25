import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const kind = z.enum(["call", "email", "meeting", "note", "whatsapp"]);

export const addActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      entity_type: z.enum(["contact", "deal"]),
      entity_id: z.string().uuid(),
      kind,
      body: z.string().max(4000).optional().nullable(),
    }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: orgRow } = await supabase
      .from("user_roles").select("org_id").eq("user_id", userId).limit(1).single();
    if (!orgRow) throw new Error("Organização não encontrada");
    const { data: row, error } = await supabase
      .from("activities").insert({ ...data, org_id: orgRow.org_id, owner_id: userId })
      .select().single();
    if (error) throw error;
    return row;
  });

export const listTimeline = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ entity_type: z.enum(["contact", "deal"]), entity_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("activities").select("*")
      .eq("entity_type", data.entity_type).eq("entity_id", data.entity_id)
      .order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    return rows ?? [];
  });
