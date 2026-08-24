/**
 * ROTA TEMPORÁRIA (uso único) — cria/confirma conta super-admin autorizada.
 * Protegida por BOOTSTRAP_ADMIN_TOKEN. APAGAR após o uso.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const AUTHORIZED = new Set(["maxortecnologia@gmail.com", "franklinocardoso@gmail.com"]);

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "cache-control": "no-store" } });

export const Route = createFileRoute("/api/public/bootstrap-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env["BOOTSTRAP_ADMIN_TOKEN"] ?? "";
        const provided = request.headers.get("x-bootstrap-token") ?? "";
        if (!token || provided !== token) return json({ ok: false, error: "Unauthorized" }, 401);

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "JSON inválido" }, 400);
        }
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(8).max(128) })
          .safeParse(body);
        if (!parsed.success) return json({ ok: false, error: "Payload inválido" }, 400);

        const email = parsed.data.email.toLowerCase();
        if (!AUTHORIZED.has(email)) return json({ ok: false, error: "E-mail não autorizado" }, 403);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // 1) Cria SEM confirmar e-mail -> trigger handle_new_user cria org + papel admin.
        let userId: string | null = null;
        let existed = false;
        const created = await supabaseAdmin.auth.admin.createUser({
          email,
          password: parsed.data.password,
          email_confirm: false,
        });
        if (created.error) {
          if (!/already|registered|exists/i.test(created.error.message)) {
            return json({ ok: false, error: created.error.message }, 400);
          }
          existed = true;
        } else {
          userId = created.data.user?.id ?? null;
        }

        if (!userId) {
          const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 1000,
          });
          if (listErr) return json({ ok: false, error: listErr.message }, 500);
          userId = list.users.find((u) => (u.email ?? "").toLowerCase() === email)?.id ?? null;
          if (!userId) return json({ ok: false, error: "Usuário não localizado" }, 500);
        }

        // 2) Confirma o e-mail -> trigger grant_super_admin_for_authorized_email
        //    encontra a org já criada e concede super_admin.
        const confirmed = await supabaseAdmin.auth.admin.updateUserById(userId, {
          email_confirm: true,
        });
        if (confirmed.error) return json({ ok: false, error: confirmed.error.message }, 500);

        return json({ ok: true, userId, existed, emailConfirmed: true });
      },
    },
  },
});
