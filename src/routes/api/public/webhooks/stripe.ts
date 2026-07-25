import { createFileRoute } from "@tanstack/react-router";

// Stripe webhook — valida assinatura t=…,v1=… antes de qualquer escrita.
async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const signed = `${t}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
  const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (expected.length !== v1.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return mismatch === 0;
}

export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook secret não configurado", { status: 503 });

        const sigHeader = request.headers.get("stripe-signature");
        const body = await request.text();
        if (!sigHeader || !(await verifyStripeSignature(body, sigHeader, secret))) {
          return new Response("Assinatura inválida", { status: 401 });
        }

        const event = JSON.parse(body) as { type: string; data: { object: Record<string, unknown> } };
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
          const obj = event.data.object as {
            id?: string; customer_email?: string; customer_details?: { email?: string; name?: string };
            amount_total?: number; currency?: string;
          };
          const email = obj.customer_email ?? obj.customer_details?.email ?? null;
          const name = obj.customer_details?.name ?? email ?? "Cliente Stripe";
          const amount = obj.amount_total ? obj.amount_total / 100 : 0;

          const { data: org } = await supabaseAdmin
            .from("organizations").select("id").order("created_at", { ascending: true }).limit(1).single();
          if (!org) return new Response("no_org", { status: 200 });

          let contactId: string | null = null;
          if (email) {
            const { data: c } = await supabaseAdmin.from("contacts")
              .upsert({ org_id: org.id, name, email, tags: ["cliente"], source: "stripe" },
                { onConflict: "email" }).select("id").single();
            contactId = c?.id ?? null;
          }
          await supabaseAdmin.from("deals").insert({
            org_id: org.id, contact_id: contactId,
            title: `Pedido Stripe ${obj.id ?? ""}`.trim(),
            value_brl: amount, probability: 100, status: "won",
            external_ref: obj.id ?? null,
          });
        }

        return new Response("ok");
      },
    },
  },
});
