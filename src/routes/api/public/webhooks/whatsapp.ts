import { createFileRoute } from "@tanstack/react-router";

async function verifyMetaSignature(payload: string, header: string | null, secret: string): Promise<boolean> {
  if (!header || !header.startsWith("sha256=")) return false;
  const provided = header.slice(7);
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (expected.length !== provided.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  return mismatch === 0;
}

export const Route = createFileRoute("/api/public/webhooks/whatsapp")({
  server: {
    handlers: {
      // Verificação inicial do Meta: retorna hub.challenge se hub.verify_token bater.
      GET: async ({ request }) => {
        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
        if (!verifyToken) return new Response("verify token não configurado", { status: 503 });
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");
        if (mode === "subscribe" && token === verifyToken && challenge) {
          return new Response(challenge, { status: 200 });
        }
        return new Response("forbidden", { status: 403 });
      },
      POST: async ({ request }) => {
        const appSecret = process.env.WHATSAPP_APP_SECRET;
        if (!appSecret) return new Response("app secret não configurado", { status: 503 });
        const body = await request.text();
        const ok = await verifyMetaSignature(body, request.headers.get("x-hub-signature-256"), appSecret);
        if (!ok) return new Response("assinatura inválida", { status: 401 });

        const payload = JSON.parse(body) as {
          entry?: Array<{ changes?: Array<{ value?: {
            messages?: Array<{ from: string; text?: { body?: string }; type: string }>;
            contacts?: Array<{ profile?: { name?: string } }>;
          } }> }>;
        };

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: org } = await supabaseAdmin
          .from("organizations").select("id").order("created_at", { ascending: true }).limit(1).single();
        if (!org) return new Response("ok");

        for (const entry of payload.entry ?? []) {
          for (const change of entry.changes ?? []) {
            const value = change.value ?? {};
            const profileName = value.contacts?.[0]?.profile?.name;
            for (const msg of value.messages ?? []) {
              const phone = msg.from;
              const text = msg.text?.body ?? `[${msg.type}]`;

              const { data: contact } = await supabaseAdmin.from("contacts").upsert({
                org_id: org.id, name: profileName ?? phone, phone_e164: phone,
                tags: ["whatsapp"], source: "whatsapp",
              }, { onConflict: "phone_e164" }).select("id").single();

              if (contact) {
                await supabaseAdmin.from("activities").insert({
                  org_id: org.id, entity_type: "contact", entity_id: contact.id,
                  kind: "whatsapp", body: text,
                });
              }
            }
          }
        }
        return new Response("ok");
      },
    },
  },
});
