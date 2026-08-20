import { supabase } from "@/integrations/supabase/client";

let cached: string | null = null;

/**
 * Resolve o org_id do usuário logado a partir de user_roles.
 * Todo insert do MaxorCRM precisa disso — as políticas de RLS exigem que
 * org_id pertença a uma organização do usuário.
 */
export async function getMyOrgId(): Promise<string | null> {
  if (cached) return cached;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data } = await supabase
    .from("user_roles")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  cached = data?.org_id ?? null;
  return cached;
}

export function resetOrgCache() {
  cached = null;
}
