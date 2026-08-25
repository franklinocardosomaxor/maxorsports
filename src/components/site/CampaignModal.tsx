/**
 * CampaignModal — banner de campanha exibido ao abrir o site.
 *
 * - Lê a campanha ativa (public.site_campaign) direto pelo cliente Supabase
 *   (leitura pública liberada por RLS somente quando active = true).
 * - Aparece 1x por sessão por campanha (sessionStorage); o cliente fecha e
 *   navega normalmente.
 * - Suporta até 3 imagens em rotação automática.
 */
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { SiteCampaign } from "@/lib/campaign.functions";

const seenKey = (id: string, updated: string) => `maxor_campaign_seen:${id}:${updated}`;

export function CampaignModal() {
  const [campaign, setCampaign] = useState<SiteCampaign | null>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("site_campaign")
        .select("id, active, title, subtitle, cta_label, cta_url, images, updated_at")
        .eq("active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!alive || !data || !Array.isArray(data.images) || data.images.length === 0) return;
      const c = data as unknown as SiteCampaign;
      try {
        if (sessionStorage.getItem(seenKey(c.id, c.updated_at))) return;
      } catch {
        /* sessão sem storage disponível */
      }
      setCampaign(c);
      setOpen(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Rotação automática das imagens (até 3).
  useEffect(() => {
    if (!open || !campaign || campaign.images.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % campaign.images.length), 4500);
    return () => clearInterval(t);
  }, [open, campaign]);

  if (!open || !campaign) return null;

  const close = () => {
    try {
      sessionStorage.setItem(seenKey(campaign.id, campaign.updated_at), "1");
    } catch {
      /* noop */
    }
    setOpen(false);
  };

  const imgs = campaign.images.slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-navy/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={campaign.title}
      onClick={close}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[color:var(--cyan-brand)]/30 bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Fechar campanha"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-navy/70 text-offwhite transition hover:bg-navy hover:text-[color:var(--cyan-brand)]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative aspect-[4/3] w-full bg-navy">
          {imgs.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${campaign.title} — imagem ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {imgs.length > 1 && (
            <>
              <button
                onClick={() => setIndex((index - 1 + imgs.length) % imgs.length)}
                aria-label="Imagem anterior"
                className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-navy/60 text-offwhite hover:bg-navy"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIndex((index + 1) % imgs.length)}
                aria-label="Próxima imagem"
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-navy/60 text-offwhite hover:bg-navy"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {imgs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Ir para imagem ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index
                        ? "w-5 bg-[color:var(--lime-brand)]"
                        : "w-1.5 bg-offwhite/40 hover:bg-offwhite/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="space-y-3 p-5 text-center">
          <h2 className="font-display text-xl font-black uppercase tracking-wide text-offwhite">
            {campaign.title}
          </h2>
          {campaign.subtitle && <p className="text-sm text-foreground/70">{campaign.subtitle}</p>}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {campaign.cta_label && campaign.cta_url && (
              <a
                href={campaign.cta_url}
                onClick={close}
                className="rounded-full bg-[color:var(--lime-brand)] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-navy transition hover:brightness-110"
              >
                {campaign.cta_label}
              </a>
            )}
            <button
              onClick={close}
              className="rounded-full border border-border px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-foreground/70 transition hover:text-offwhite"
            >
              Ver o site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
