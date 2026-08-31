# Cadastro rápido de Marca, Categoria e Tipo no MaxorCRM

Hoje, no cadastro de produto (Fase 1), **Marca** é uma lista fechada vinda do código e **Categoria** e **Tipo de Produto** são campos de texto livre — cada produto pode ser digitado diferente, o que suja o catálogo. A proposta adiciona um cadastro próprio dessas listas, alimentado durante o próprio cadastro do produto, sem mexer no fluxo atual.

## O que muda na tela

- **Marca**, **Categoria** e **Tipo de Produto** passam a ser listas de seleção alimentadas pelo novo cadastro.
- Ao lado do nome de cada um desses campos aparece um botão **+** (substituindo o asterisco, como você pediu), que abre uma caixinha para digitar o novo valor e salvar na hora.
- Ao salvar, o novo item entra na lista e já fica selecionado no produto que você está cadastrando — sem sair da tela nem perder o que já foi preenchido.
- O mesmo tratamento é aplicado a **Gênero** (lista fixa hoje) — opcional, digo se você quiser incluir.

## De onde vêm as opções

A lista de cada campo é a soma de:
1. os valores já usados nos produtos cadastrados (nada some do que existe hoje);
2. as marcas oficiais do diretório de marcas do site;
3. os itens novos que você cadastrar pelo botão +.

Nomes repetidos com acento/caixa diferente são unificados, para não duplicar "tenis de corrida" e "Tênis de Corrida".

## Marcas novas

Uma marca criada pelo + entra no cadastro e passa a filtrar normalmente no site. Como ela não tem logotipo no pacote de marcas, aparece com o selo padrão (inicial + cores Maxor) até você enviar um logo — o menu e a página de marcas continuam funcionando pela fonte única de marcas.

## Detalhes técnicos

- Nova tabela `public.catalog_taxonomy` (`org_id`, `kind` = `brand|category|type`, `name`, `slug` único por org), com GRANT, RLS ativa: leitura para membros da organização, escrita apenas para `admin`/`super_admin` via as funções de papel já existentes.
- Server functions em `src/lib/crm.taxonomy.functions.ts` (`listTaxonomy`, `createTaxonomyItem`) com `requireSupabaseAuth`, seguindo o padrão das demais funções do CRM.
- `src/components/maxorcrm/Fase1Catalog.tsx`: novo componente interno `TaxonomySelect` (select + botão `+` com input inline) usado nos três campos; a lista de opções combina taxonomia, valores distintos dos produtos e `BRAND_DEFS`.
- `src/lib/brands.ts` continua sendo a fonte única de marcas; o diretório passa a considerar também as marcas da taxonomia, sem hardcode em componentes.
- Sem alteração no site público, no fluxo de salvamento do produto ou na estrutura de `products`.
