# Catálogo: mostrar todas as cores, 100 por página

## O que muda

A página **Catálogo** passa a mostrar **um card para cada cor cadastrada**, em vez de um card por modelo. Hoje o banco tem 120 produtos visíveis em 7 marcas; todos vão aparecer.

- A organização por marca continua igual, com o índice de atalhos no topo.
- A contagem no topo e ao lado de cada marca passa a mostrar o número real de itens exibidos.
- Quando passar de 100 cards, a lista quebra em páginas (`/catalogo`, `/catalogo?p=2`, ...), com a mesma barra de paginação que já existe.
- A separação por página respeita a ordem por marca, sem repetir nem perder nenhum item.

## Detalhes técnicos

- `src/routes/catalogo.tsx`: trocar `getBrandProducts(slug)` (que agrupa por modelo via `groupProductsByModel`) por uma listagem sem agrupamento, filtrando os produtos visíveis por marca com a mesma regra do diretório vivo de `src/lib/brands.ts` (marcas com `matchBy !== "category"` seguem fora, para não duplicar).
- Adicionar em `src/lib/catalog.ts` uma função irmã de `getBrandProducts` (ex.: `getBrandVariants(slug)`) que aplica o mesmo filtro/gating e ordenação, porém retorna os produtos individuais. `getBrandProducts` permanece intacta — menu, `/marcas` e páginas de marca continuam como estão.
- Paginação: `PAGE_SIZE = 100` aplicado à lista plana de cards; reagrupamento por marca dentro da fatia da página, como já é feito hoje.
- Contagens: usar a contagem simples de itens no lugar de `formatCatalogCount(models, variants)` nesta página.
- Nenhuma mudança em dados, RLS ou no CRM; só leitura e apresentação.
