import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const row = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().nullable(),
  phone_e164: z.string().max(32).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  tags: z.array(z.string()).max(20).optional().default([]),
});

export const importLeadsCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ rows: z.array(row).min(1).max(5000) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: orgRow } = await supabase
      .from("user_roles").select("org_id").eq("user_id", userId).limit(1).single();
    if (!orgRow) throw new Error("Organização não encontrada");

    const payload = data.rows.map((r) => ({
      ...r, org_id: orgRow.org_id, owner_id: userId, source: "csv_import",
    }));
    const { error, count } = await supabase
      .from("contacts").insert(payload, { count: "exact" });
    if (error) throw error;
    return { inserted: count ?? payload.length };
  });
