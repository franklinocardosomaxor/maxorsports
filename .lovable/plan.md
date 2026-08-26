# Auditoria do Explorar Catálogo + reorganização por marca

## O que a auditoria mostrou (dados reais do CRM agora)

- **32 produtos cadastrados**, **32 com "visível no site" ligado** e **32 com imagem** — ou seja, nenhum produto está sendo barrado pelo gating.
- Na página **Explorar Catálogo** aparecem hoje **24 cartões**, não 32. A diferença (8) não é produto sumido: a página agrupa as variações de cor do mesmo modelo em um cartão só.
- A página está organizada **por selo**, não por marca:

```text
Selo         variações   cartões exibidos
Normal            18            11
Destaque           6             6
Oferta             5             4
Lançamento         3             3
TOTAL             32            24
```

- Distribuição por marca (o que deveria orientar a página):

```text
Nike     25 variações   16 modelos
Adidas    7 variações    6 modelos
```

Conclusão: o catálogo completo está subrepresentado (24 de 32) e agrupado pelo critério errado.

## O que vou mudar

1. **Trocar a organização da página de selo para marca.** As seções passam a ser Nike, Adidas e as demais marcas que tiverem produto visível, na ordem do diretório oficial de marcas, com contagem por marca.
2. **Mostrar o catálogo completo de verdade.** Sem agrupar variações de cor: cada cor cadastrada vira um item, então o total exibido bate com o total do CRM (32 hoje).
3. **Contador honesto no topo**: "32 produtos" refletindo exatamente o que está visível no CRM.
4. **Selo vira só etiqueta visual** no cartão (Oferta, Lançamento etc.), deixando de definir seções.
5. Índice de marcas no topo (atalhos para cada seção) e mensagem clara caso alguma marca fique sem produto visível.

Nada muda na estrutura do site, no CRM, no gating (`visível no site` continua mandando) nem nas outras vitrines (Masculino, Feminino, Infantil, Unissex seguem como estão).

## Detalhes técnicos

- Arquivo alvo: `src/routes/catalogo.tsx`.
- Substituir o agrupamento `SELOS_ORDER` + `groupProductsByModel` por agrupamento via `canonicalBrand`/diretório de `src/lib/brands.ts` sobre `ALL_PRODUCTS`.
- Manter `useCatalogVersion()`, `ViewModeToggle`, `ProductMiniCard` e `ProductListRow` sem alteração.
- Nenhuma migração de banco; nenhuma mudança em `src/lib/catalog.ts` além de reutilizar helpers já exportados.
