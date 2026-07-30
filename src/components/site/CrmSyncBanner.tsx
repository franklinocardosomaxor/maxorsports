import * as React from "react";
import type { CrmSyncStatus } from "@/hooks/use-crm-sync";

/**
 * Faixa fixa no topo que mostra o estado da sincronização com o CRM Maxor:
 * carregando (spinner) ou erro visível com fallback local.
 */
export function CrmSyncBanner({ status }: { status: CrmSyncStatus }) {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;
  if (!status.loading && !status.error) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-3 border-b border-border/60 bg-[color:var(--navy-brand,#0F1720)]/95 px-4 py-2 text-xs text-foreground/85 backdrop-blur"
    >
      {status.loading ? (
        <>
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[color:var(--cyan-brand)] border-t-transparent"
          />
          <span>Sincronizando catálogo com o CRM Maxor...</span>
        </>
      ) : (
        <>
          <span
            aria-hidden
            className="h-2 w-2 rounded-full bg-[color:var(--lime-brand)]"
          />
          <span className="text-[color:var(--lime-brand)]">{status.error}</span>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="ml-2 rounded border border-border/70 px-2 py-0.5 text-[10px] uppercase tracking-wider text-foreground/70 transition hover:text-offwhite"
          >
            Fechar
          </button>
        </>
      )}
    </div>
  );
}
