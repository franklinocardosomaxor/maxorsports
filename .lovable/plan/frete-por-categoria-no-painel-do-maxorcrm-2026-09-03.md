# Frete por categoria no painel do MaxorCRM

Adicionar, ao lado do bloco "Parcelamento do Site" no painel inicial do MaxorCRM, um bloco para definir o valor do frete de todos os produtos de uma categoria de uma só vez — recalculando o preço final de cada produto e mantendo a margem cadastrada.

## Estado atual (verificado)

- O painel `/maxorcrm` já tem o bloco "Parcelamento do Site" (parcelas máximas + simulação).
- Cada produto já tem `shipping_cost`, `cost_supplier`, `margin_percent`, `import_cost` e `price`.
- O cadastro de produto calcula o preço como `(custo + frete + imposto de importação) × (1 + margem/100)`.
- Categorias reais hoje: Corrida (65), Trilha (14), Caminhada (7), Casual (5), Basquete (3), Calçados Esportivos (1). O frete atual varia entre R$ 0 e R$ 75.

## O que será feito

### Bloco "Frete por Categoria"
Novo card no painel inicial, logo ao lado/abaixo do parcelamento, com a mesma identidade Navy:

- Menu de categorias montado dinamicamente a partir das categorias já usadas nos produtos e das categorias cadastradas na taxonomia — categorias novas aparecem sozinhas, sem alteração de código.
- Opção "Todos os produtos" para aplicar em tudo.
- Campo para digitar o novo valor do frete em reais.
- Prévia antes de salvar: quantos produtos serão afetados, frete atual (mínimo/máximo) e exemplo de preço antes/depois.
- Botão "Aplicar frete", com confirmação, e mensagem de resultado ("42 produtos atualizados").

### Regra de recálculo
Para cada produto da categoria escolhida:

- `shipping_cost` = novo valor
- `price` / `valor_dec` = (custo do fornecedor + novo frete + imposto de importação, quando incluído) × (1 + margem/100), arredondado em 2 casas — exatamente a fórmula do cadastro, preservando a margem de cada produto.
- Produtos sem custo ou sem margem cadastrados apenas recebem o novo frete somado ao preço atual, para não zerar o valor de venda.

O site continua exibindo o preço final do CRM, então a mudança aparece na vitrine assim que salva.

## Detalhes técnicos

- Server function nova em `src/lib/crm.shipping.functions.ts` (`applyShippingByCategory`), protegida por `requireSupabaseAuth`, fazendo leitura + update em lote no servidor (evita timeout no navegador).
- Componente `ShippingManager` em `src/routes/maxorcrm/index.tsx`, ao lado de `InstallmentsManager`.
- Sem alteração na estrutura do site público, no `maxor-kit` ou no fluxo atual de cadastro.
