# Financeiro do MaxorCRM (Fase 3) — Contas a pagar e a receber

## Situação atual (verificada)

- `/maxorcrm/fase-3` é apenas um cartão com o texto "Aguardando comandos de migração do Antigravity" — nenhuma funcionalidade.
- No banco não existe nenhuma tabela financeira: só `products`, `contacts`, `deals`, `pipelines`, `stages`, `activities`, `organizations`, `user_roles`, `buyer_*`, `site_campaign`, `site_settings`.
- Ou seja: hoje **não há** entrada de contas a pagar nem a receber. Precisa ser criado.

## O que será implementado

Um módulo Financeiro completo dentro do MaxorCRM, sem tocar em nada do site público.

### 1. Banco de dados
Nova tabela `public.finance_entries`, escopada por `org_id`:
- tipo: a pagar ou a receber
- descrição, categoria, fornecedor/cliente (texto livre)
- valor, data de vencimento, data de pagamento
- situação: em aberto, pago, atrasado (atrasado calculado pela data)
- forma de pagamento (PIX, cartão, boleto, dinheiro, transferência)
- observações e vínculo opcional a um negócio (`deals`) ou produto
- acesso: só membros da organização leem e escrevem; nenhum acesso público/anônimo.

### 2. Tela `/maxorcrm/fase-3` → "Financeiro"
- Cartões de resumo: total a receber, total a pagar, saldo previsto, vencidos.
- Duas abas: **Contas a receber** e **Contas a pagar**.
- Lista com filtros (situação, mês, busca), ordenada por vencimento, com destaque para atrasados.
- Botão "Nova conta" abre modal com os campos acima; editar e excluir na própria linha.
- Ação rápida "Marcar como pago" (grava a data de pagamento).
- Visual e responsividade idênticos às Fases 1 e 2 (dark Navy, cards, tabela que colapsa no celular).

### 3. Painel financeiro no início do MaxorCRM
- No painel inicial (`/maxorcrm`), um bloco "Resumo financeiro" com: a receber no mês, a pagar no mês, saldo previsto, total vencido e os próximos vencimentos.
- Mini gráfico de barras entradas x saídas dos últimos 6 meses.
- Atalho direto para o módulo Financeiro.

### 4. Integração leve com Vendas
- Ao lançar uma conta a receber, é possível vincular a um negócio existente (opcional).
- Nada do fluxo de vendas atual é alterado.

## Fora de escopo
- Nenhuma alteração no site público, no checkout, no catálogo ou na estrutura de menus.
- Sem integração bancária, sem conciliação automática, sem emissão de boleto.

## Detalhes técnicos
- Migração criando a tabela com `GRANT` → `ENABLE ROW LEVEL SECURITY` → políticas por `private.is_org_member(org_id)`, mais trigger de `updated_at`.
- Server functions em `src/lib/crm.finance.functions.ts` (`listFinanceEntries`, `upsertFinanceEntry`, `deleteFinanceEntry`, `markFinancePaid`) com `requireSupabaseAuth`.
- Componente `src/components/maxorcrm/Fase3Finance.tsx`, renderizado por `src/routes/maxorcrm/fase-3.tsx` (mantendo `ssr: false` e `noindex`).
- Card do painel inicial (`src/routes/maxorcrm/index.tsx`) passa a descrever o módulo ativo em vez de "Fase 3 / Antigravity".
