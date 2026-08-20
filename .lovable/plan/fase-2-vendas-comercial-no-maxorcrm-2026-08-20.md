# Fase 2 — Vendas (Comercial) no MaxorCRM

Construir o painel comercial em `/maxorcrm/fase-2`, hoje apenas um placeholder, usando as tabelas de CRM que já existem no banco (`contacts`, `deals`, `pipelines`, `stages`, `activities`). Nenhuma migração nova é necessária: a organização já tem 1 pipeline com 6 estágios (Novo, Contato, Proposta, Negociação, Ganho, Perdido) prontos e vazios.

## O que a tela vai ter

**1. Kanban de negócios**
Uma coluna por estágio do pipeline, cada card mostrando título do negócio, contato vinculado, valor em R$ e probabilidade. Arrastar o card entre colunas move o negócio de estágio e registra a mudança no histórico de atividades. Topo com totais: valor em aberto, valor ganho e número de negócios por coluna.

**2. Cadastro/edição de negócio (modal)**
- Título, contato (busca ou criação rápida), valor em R$ com máscara de 2 casas, probabilidade %, previsão de fechamento, estágio e responsável.
- Vincular produtos do catálogo (Fase 1) ao negócio, somando o valor automaticamente — assim o pedido fechado no WhatsApp vira um negócio rastreável.
- Status: aberto, ganho ou perdido.

**3. Aba de contatos**
Lista com busca por nome/telefone/e-mail, criação e edição de contato (nome, telefone, e-mail, empresa, tags, origem) e atalho para abrir o WhatsApp do contato com o número já preenchido.

**4. Linha do tempo de atividades**
Painel lateral no negócio aberto mostrando o histórico (`activities`) e um campo para registrar uma nota manual.

## Regras respeitadas

- Acesso só pelos super-admins já travados no layout do MaxorCRM.
- Todas as leituras e escritas passam pelas políticas de RLS existentes (`private.is_org_member` + papel `sales`/`admin`/`super_admin`); nada de contornar segurança.
- Identidade visual Navy/Cyan/Mint/Lime, sem fundos claros, seguindo o padrão já usado na Fase 1.
- Nenhum dado fictício: a tela abre vazia e só mostra o que for cadastrado.

## Detalhes técnicos

- Novo componente `src/components/maxorcrm/Fase2Sales.tsx` (Kanban + modais), montado por `src/routes/maxorcrm/fase-2.tsx`, mantendo `ssr: false`.
- Componentes auxiliares reaproveitados da Fase 1 (`CurrencyInput`) e cliente `@/integrations/supabase/client` com sessão do usuário, para que o RLS avalie o papel real.
- `org_id` resolvido a partir de `user_roles` do usuário logado e injetado em todo insert.
- Drag-and-drop leve com HTML5 (`draggable` + `onDrop`), sem instalar biblioteca nova.
- Realtime opcional no canal de `deals` para refletir mudanças feitas por outro operador.
- Metadados de head próprios com `noindex, nofollow`, como nas demais rotas do CRM.

## Fora deste escopo

Financeiro/fluxo de caixa (Fase 3) e qualquer tabela nova de pedidos/pagamentos — isso entra depois, quando você definir o modelo vindo do Antigravity.
