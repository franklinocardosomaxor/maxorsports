<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Guia para agentes — Maxor Sports

Leia primeiro: [`README.md`](README.md), [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md),
[`docs/MAXORCRM.md`](docs/MAXORCRM.md), [`docs/BANCO-DE-DADOS.md`](docs/BANCO-DE-DADOS.md).

## Contexto

Dois sistemas no mesmo projeto e no mesmo backend: o **site** (vitrine + checkout via
WhatsApp/PIX) e o **MaxorCRM** em `/maxorcrm`. O sistema externo "Antigravity" foi
descontinuado — documentos dele estão em `docs/historico/` e não valem como especificação.

## Regras rígidas

1. **Dark theme obrigatório.** Fundo Navy `#0F1720` em todo o site; nenhuma área branca.
   Sem `bg-white`, `text-white` ou cor em hex direto — só tokens semânticos.
2. **CRM soberano no catálogo.** O site exibe exclusivamente produtos de `public.products`
   com `site_visible = true`. Mocks, seeds, demos, produtos de exemplo e imagens
   substitutas são proibidos. Sem foto do CRM, o produto não aparece.
3. **Marcas só em `src/lib/brands.ts`.** Nunca hardcodar lista de marcas em componente.
4. **`src/maxor-kit/` é contrato compartilhado.** Não alterar sua estrutura ou exports sem
   autorização — o CRM depende dele. Componentes reutilizáveis, tokens e funções de banco
   compartilhadas vivem lá.
5. **RLS sempre.** Nenhuma query que contorne políticas. Toda tabela nova em `public`:
   `CREATE TABLE` → `GRANT` → `ENABLE ROW LEVEL SECURITY` → `CREATE POLICY`.
   Papéis apenas em `user_roles`, jamais em tabela de perfil.
6. **Checkout é WhatsApp + PIX.** Não introduzir Stripe como fluxo principal.
   Chave PIX: `0010ef3f-7011-41f4-ae7d-43616eb08627`.
7. **Painel do CRM e acessos estão travados** por pedido do cliente: mexer só quando
   solicitado explicitamente.
8. **Efeitos globais.** `SplashCursor` fora de `/admin` e `/maxorcrm`; `Aurora` só no
   cabeçalho e client-only; `LogoLoop` na faixa de marcas.
9. **Sem bibliotecas de UI concorrentes** ao shadcn/ui sem necessidade técnica absoluta.
10. **Nunca commitar segredos.** Service role key e senha do banco não são acessíveis e
    não devem ser logados nem reproduzidos.

## Convenções técnicas

- TanStack Start v1: rotas em `src/routes` (não editar `routeTree.gen.ts`); nunca
  introduzir React Router.
- Server functions com `createServerFn` em `*.functions.ts`; helpers server-only em
  `*.server.ts`; HTTP externo em `src/routes/api/public/*` com verificação no handler.
- Tailwind v4 por `src/styles.css`; fontes via `<link>` no `__root`.
- Cada rota de conteúdo tem `head()` próprio com título, descrição e OG únicos.
- Idioma do produto e da documentação: **português (pt-BR)**.
