import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createDealInput = z.object({
  title: z.string().min(1).max(200),
  contact_id: z.string().uuid().optional().nullable(),
  pipeline_id: z.string().uuid().optional().nullable(),
  stage_id: z.string().uuid().optional().nullable(),
  value_brl: z.number().nonnegative().default(0),
  probability: z.number().int().min(0).max(100).default(0),
  expected_close: z.string().optional().nullable(),
});

export const createDeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createDealInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: orgRow } = await supabase
      .from("user_roles").select("org_id").eq("user_id", userId).limit(1).single();
    if (!orgRow) throw new Error("Organização não encontrada");
    const { data: row, error } = await supabase
      .from("deals").insert({ ...data, org_id: orgRow.org_id, owner_id: userId })
      .select().single();
    if (error) throw error;
    return row;
  });

export const moveDealStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ deal_id: z.string().uuid(), stage_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("deals").update({ stage_id: data.stage_id }).eq("id", data.deal_id);
    if (error) throw error;
    return { ok: true };
  });

export const listDeals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("deals").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    return data ?? [];
  });
