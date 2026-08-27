import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const entryInput = z.object({
  id: z.string().uuid().optional().nullable(),
  kind: z.enum(["payable", "receivable"]),
  description: z.string().min(1).max(300),
  category: z.string().max(120).optional().nullable(),
  counterparty: z.string().max(200).optional().nullable(),
  amount_brl: z.number().nonnegative().default(0),
  due_date: z.string().min(8),
  paid_at: z.string().optional().nullable(),
  status: z.enum(["open", "paid", "canceled"]).default("open"),
  method: z.string().max(40).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  deal_id: z.string().uuid().optional().nullable(),
});

export const listFinanceEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("finance_entries")
      .select("*")
      .order("due_date", { ascending: true })
      .limit(1000);
    if (error) throw error;
    return data ?? [];
  });

export const upsertFinanceEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => entryInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...fields } = data;

    if (id) {
      const { data: row, error } = await supabase
        .from("finance_entries")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return row;
    }

    const { data: orgRow, error: orgErr } = await supabase
      .from("user_roles")
      .select("org_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (orgErr) throw orgErr;
    if (!orgRow) throw new Error("Organização não encontrada");

    const { data: row, error } = await supabase
      .from("finance_entries")
      .insert({ ...fields, org_id: orgRow.org_id, owner_id: userId })
      .select()
      .single();
    if (error) throw error;
    return row;
  });

export const markFinancePaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), paid_at: z.string().optional().nullable() }).parse(data))
  .handler(async ({ data, context }) => {
    const paid = data.paid_at ?? new Date().toISOString().slice(0, 10);
    const { error } = await context.supabase
      .from("finance_entries")
      .update({ status: "paid", paid_at: paid })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteFinanceEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("finance_entries").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
