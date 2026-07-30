import * as React from "react";
import { CRM_CATALOG_URL, loadCatalogTabs, type CatalogTabs } from "@/lib/crm-catalog";

/**
 * Painel visível do status da conexão com o catálogo público do CRM.
 * Mostra a URL usada, se respondeu, e a contagem de produtos por aba.
 */
export function CrmCatalogStatus() {
  const [state, setState] = React.useState<{
    source: "crm" | "local";
    tabs: CatalogTabs | null;
    error?: string;
    loading: boolean;
  }>({ source: "local", tabs: null, loading: true });

  React.useEffect(() => {
    const ctrl = new AbortController();
    loadCatalogTabs(ctrl.signal).then((res) => {
      console.log("Produtos por Abas:", res.tabs, "| fonte:", res.source, "| url:", CRM_CATALOG_URL);
      setState({ source: res.source, tabs: res.tabs, error: res.error, loading: false });
    });
    return () => ctrl.abort();
  }, []);

  const online = state.source === "crm";

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Catálogo do CRM</h2>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
            state.loading
              ? "bg-secondary/50 text-foreground/70"
              : online
                ? "bg-[color:var(--mint-brand)]/20 text-[color:var(--mint-brand)]"
                : "bg-[color:var(--lime-brand)]/15 text-[color:var(--lime-brand)]"
          }`}
        >
          {state.loading ? "conectando..." : online ? "CRM online" : "fallback local"}
        </span>
      </div>

      <p className="mt-3 break-all text-xs text-foreground/70">
        GET <code className="text-[color:var(--cyan-brand)]">{CRM_CATALOG_URL}</code>
      </p>

      {state.error && (
        <p className="mt-2 text-xs text-foreground/60">
          CRM ainda não respondeu ({state.error}) — exibindo dados locais do kit.
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {state.tabs &&
          Object.entries(state.tabs).map(([key, list]) => (
            <div key={key} className="rounded-md border border-border bg-secondary/20 p-3">
              <p className="text-[10px] uppercase tracking-wider text-foreground/60">{key}</p>
              <p className="font-display text-2xl font-black text-offwhite">{list.length}</p>
            </div>
          ))}
      </div>
    </section>
  );
}
