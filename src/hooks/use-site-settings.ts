import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Valor padrão até a configuração do CRM ser carregada. */
export const DEFAULT_INSTALLMENTS = 3;

let cached: number | null = null;
const listeners = new Set<(n: number) => void>();
let inFlight: Promise<void> | null = null;

async function load() {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("installments_max")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const n = Number(data?.installments_max);
    cached = Number.isFinite(n) && n > 0 ? n : DEFAULT_INSTALLMENTS;
    listeners.forEach((fn) => fn(cached as number));
  })();
  return inFlight;
}

/** Invalida o cache (usado pelo painel do CRM ao salvar). */
export function refreshSiteSettings() {
  cached = null;
  inFlight = null;
  void load();
}

/** Número máximo de parcelas exibido no site (configurável no MaxorCRM). */
export function useInstallments(): number {
  const [value, setValue] = useState<number>(cached ?? DEFAULT_INSTALLMENTS);

  useEffect(() => {
    listeners.add(setValue);
    if (cached !== null) setValue(cached);
    else void load();
    return () => {
      listeners.delete(setValue);
    };
  }, []);

  return value;
}
