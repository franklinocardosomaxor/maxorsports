# Nova vitrine Unissex

Criar uma aba/menu próprio para os tênis cadastrados como **unissex** no CRM, mantendo a regra atual (unissex continua aparecendo em Masculino e Feminino).

## Regra atual (mantida)

- Gênero do CRM contendo "unissex"/"unisex" → produto entra em Masculino e Feminino.
- Cada variação de cor listada individualmente nas páginas de gênero.
- Gating de sempre: `site_visible = true`, selo válido e imagem do CRM.

## O que muda

1. Nova página `/unissex` no mesmo formato das páginas de gênero (mesmo cabeçalho, filtros de marca/categoria/tamanho e modos de exibição lista/ícones).
2. Item **UNISSEX** no menu principal, logo após Infantil, e também no menu mobile e no rodapé.
3. A página lista todos os produtos com gênero unissex, cada cor como card separado.
4. Estado vazio no padrão Navy quando o CRM ainda não tiver produtos unissex publicados.
5. Entrada da nova URL no sitemap.

## Detalhes técnicos

- `src/lib/catalog.ts`: nova função `getUnisexProducts()` reutilizando `isUnisexProduct` — sem alterar `getSectionProducts`.
- `src/routes/unissex.tsx`: novo arquivo espelhando `masculino.tsx`, com `head()` próprio (título, descrição, OG e canonical exclusivos).
- `src/components/site/Shell.tsx`: acrescentar `{ label: "Unissex", href: "/unissex" }` ao array `NAV` e à lista do rodapé.
- `src/routes/sitemap[.]xml.ts`: incluir `/unissex`.

Nenhuma alteração no CRM, no agrupamento por modelo, no checkout ou no layout existente.
