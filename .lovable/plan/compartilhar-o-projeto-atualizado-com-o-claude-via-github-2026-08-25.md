# Compartilhar o projeto atualizado com o Claude via GitHub

Objetivo: deixar o código completo (site + MaxorCRM + banco) acessível ao Claude num repositório GitHub, com documentação atualizada para ele entender o projeto sem adivinhar nada.

## Etapa 1 — Conexão GitHub (feita por você, na interface)

A conexão do repositório é uma ação de interface do Lovable e não pode ser executada por mim. Passos:

1. No editor, menu **+** (canto inferior esquerdo do chat) → **GitHub** → **Connect project**
2. Autorizar o app do Lovable no GitHub
3. Escolher a conta/organização
4. **Create Repository**

A partir daí a sincronização é bidirecional e automática: tudo que fizermos aqui vai para o repositório.

Depois disso, para o Claude ler: repositório público, ou convidar a conta dele como colaborador (Settings → Collaborators), ou enviar o ZIP (Code → Download ZIP).

## Etapa 2 — Documentação atualizada no repositório

Consolidar a documentação que hoje está espalhada e desatualizada em relação ao estado atual (MaxorCRM interno, marcas com fonte única, gating do catálogo, cálculo de importação, banners, view modes).

Reescrever/atualizar:

- `README.md` — visão geral, stack, como rodar, mapa de diretórios
- `docs/ARQUITETURA.md` (novo) — rotas do site, design system Navy/Cyan, efeitos globais, fluxo de dados do catálogo (CRM soberano, `site_visible`), fonte única de marcas, checkout WhatsApp/PIX
- `docs/MAXORCRM.md` (novo) — Fase 1 Estoque (4 blocos de cadastro, cálculo de importação), Fase 2 Vendas (kanban, contatos), banners de campanha, acessos super-admin
- `docs/BANCO-DE-DADOS.md` (novo) — tabelas, papéis/roles, políticas RLS atuais, endpoints públicos de ingestão, segredos usados (apenas os nomes, nunca valores)
- Remover ou marcar como histórico `HANDOFF-ANTIGRAVITY.md` e `DIAGNOSTICO-SINCRONIZACAO.md` (Antigravity não existe mais)
- `AGENTS.md` — atualizar com as regras rígidas atuais (dark theme obrigatório, CRM como fonte única do catálogo, maxor-kit, marcas em `src/lib/brands.ts`)

## Regras respeitadas

- Nenhuma alteração de layout, catálogo, permissões ou painel do CRM — a trava que você pediu continua valendo; este trabalho é só documentação
- Nenhum segredo, chave de serviço ou senha escrito em arquivo do repositório

## Detalhes técnicos

A documentação será gerada a partir da leitura do código real (`src/routes`, `src/lib/catalog.ts`, `src/lib/brands.ts`, `src/maxor-kit`, rotas de API) e do schema atual do banco, para não conter afirmações não verificadas.
