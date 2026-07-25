# Project Memory

## Core
Identidade Maxor Sports: Navy #0F1720, Cyan #00BFC6, Mint #7EEBC1, Lime #C7F500, Cream #F7F8F5. Fontes Rajdhani + Inter.
Nunca criar Edge Functions novas — usar createServerFn / rotas TanStack. Lovable Cloud (Supabase) para dados.
Segurança: HIBP ligado, cabeçalhos anti-clonagem no server.ts (CSP frame-ancestors, X-Frame-Options DENY em prod, HSTS, Referrer-Policy, Permissions-Policy). Preview lovable.app/dev liberado para iframe.
Papéis em user_roles com políticas admin-only (has_role + is_org_member). Helpers RLS revogados de anon.

## Memories
