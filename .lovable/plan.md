# Auditoria de exibição: quantidades, gêneros e numerações

## O que a auditoria encontrou (dados reais do banco, hoje)

Total cadastrado e publicado: **109 produtos, todos com site_visible = true**.

Por marca (variações cadastradas x modelos agrupados):

```text
Marca         Variações   Modelos
Nike             47         23
On               33         12
Adidas           16          6
New Balance       9          4
Mizuno            2          2
Timberland        1          1
Caterpillar       1          1
Total           109         49
```

Por gênero:

```text
Masculino   52 variações / 33 modelos
Unissex     30 variações / 21 modelos
Feminino    27 variações / 18 modelos
```

### Problema 1 — o número exibido não diz o que está contando
A página da Adidas mostra "6 produtos" (6 modelos agrupados), enquanto no CRM existem 16 cadastros Adidas. Os dois números estão corretos, mas o site chama os dois de "produtos", e o texto do Explorar Catálogo ainda promete "cada cor cadastrada aparece como um item" — o que não é mais verdade desde o agrupamento por modelo. Daí a sensação de divergência.

### Problema 2 — a numeração exibida é fixa e ignora o gênero
Confirmado no banco: a coluna antiga `sizes` está com o mesmo conteúdo `{38,39,40,41,42,43,44}` em **todos** os 109 produtos. As numerações reais estão em `num_cal_min`/`num_cal_max`, que o site **nunca lê**:

- Feminino: 34–39
- Masculino: 37–44
- Unissex: 34–44

Por isso o filtro Tamanho só mostra 38–44 (faixa masculina) e a numeração feminina desaparece — exatamente o que você apontou.

### Problema 3 — nenhuma conferência automática
Não existe hoje nada que garanta que menu, /marcas, /catalogo e página da marca contem a mesma coisa. A harmonização anterior foi manual.

## O que vou corrigir

1. **Numeração real por produto e por gênero**
   - Passar a ler `num_cal_min`/`num_cal_max` do CRM no carregamento do catálogo.
   - Cada produto passa a ter sua grade real; quando as colunas faltarem, cai no `sizes` antigo.
   - O card de modelo agrupado usa a união das numerações das suas variações.
   - O filtro Tamanho de cada página passa a listar apenas as numerações que realmente existem naquela vitrine — em Feminino aparecem 34–39, em Masculino 37–44, em Unissex 34–44.

2. **Contagem transparente e consistente em todo o site**
   - Um único rótulo padrão: "N modelos · M variações" (ou "N modelos" quando não houver variação).
   - Aplicado em /marcas (cards), /marcas/{marca}, /catalogo, vitrines de gênero e categoria.
   - Ajustar o texto do Explorar Catálogo, que hoje descreve o comportamento antigo.

3. **Trava contra regressão**
   - Teste que percorre marcas, gêneros e categorias e garante que a soma das vitrines bate com o catálogo carregado, e que modelos ≤ variações em toda parte.

4. **Validação visual depois da correção**
   - Conferir /marcas/adidas, /feminino, /masculino, /unissex e /catalogo no preview e comparar com os números do banco listados acima.

## Detalhes técnicos

- `src/lib/crm-db-catalog.ts`: incluir `num_cal_min`, `num_cal_max` no select.
- `src/lib/catalog.ts`: derivar `sizes` a partir da faixa min–max; união de numerações em `groupProductsByModel`; expor helper único de contagem (modelos/variações).
- `src/components/site/CatalogPage.tsx`: montar as opções de tamanho a partir dos produtos da própria vitrine em vez da constante `SIZE_OPTIONS`.
- `src/routes/marcas.index.tsx`, `marcas.$brand.tsx`, `catalogo.tsx`: usar o rótulo único de contagem.
- Novo teste ao lado de `src/lib/catalog.brand-visibility.test.ts`.

## Fora do escopo

- Não alterar cadastro, preços, frete, parcelamento, checkout, PIX/WhatsApp, acessos ou painel do CRM.
- Não criar, apagar ou editar produtos no banco.
- Não mexer em layout, tema ou efeitos visuais.
