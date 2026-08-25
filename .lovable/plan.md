# Separar o MaxorCRM do site (mesmo projeto, peso zero na vitrine)

## Minha opinião como engenheiro

Sim, faz sentido — e o ganho não vem de "tirar o CRM do projeto", vem de **tirar o CRM do caminho do visitante**. Hoje o CRM já mora em rotas próprias (`/maxorcrm`, `/maxorcrm/fase-1..3`), mas ele continua colado ao site em três pontos que pesam:

1. **Link no menu público.** O item "Maxor CRM" está no array `NAV` do `Shell.tsx`, ou seja, aparece para qualquer cliente. É ruído comercial e um convite a bater na porta do painel.
2. **Peso de código.** `Fase1Catalog.tsx` (973 linhas) + `Fase2Sales.tsx` (756 linhas) são os maiores arquivos de UI do projeto. Enquanto forem alcançáveis pelo grafo de imports da vitrine, entram no bundle ou pelo menos no preload.
3. **Trabalho em segundo plano.** O carrossel/sincronização de catálogo (`useCrmSync` no `__root`) roda no site inteiro. Ele deve continuar **ativo na vitrine** (é o que mantém o catálogo fresco) e ficar **pausado dentro do CRM** — que é justamente como já está hoje.

Ou seja: manter um único projeto está certo (mesmo banco, mesmo Maxor Kit, uma só publicação). O que muda é a **fronteira**.

## O desenho proposto (teoria)

```text
                 mesmo projeto / mesmo backend
  ┌───────────────────────────┐   ┌───────────────────────────┐
  │  VITRINE (público)        │   │  MAXORCRM (interno)       │
  │  Shell + Aurora + Splash  │   │  layout próprio, sem      │
  │  useCrmSync ATIVO         │   │  efeitos, sem Shell       │
  │  bundle enxuto            │   │  useCrmSync PAUSADO       │
  └───────────┬───────────────┘   └───────────┬───────────────┘
              │                               │
              └────── catálogo em products ───┘
                  (realtime, uma direção)
```

Três separações, em ordem de impacto:

**1. Separação de navegação.** Remover apenas o item "Maxor CRM" da barra do topo (verificado: o rodapé não tem link do CRM, então nada muda lá). A barra passa de:

```text
antes:  MASCULINO · FEMININO · INFANTIL · TÊNIS ⌄ · LANÇAMENTOS · MAIS VENDIDOS · OFERTAS · DIVERSOS ⌄ · MAXOR CRM
depois: MASCULINO · FEMININO · INFANTIL · TÊNIS ⌄ · LANÇAMENTOS · MAIS VENDIDOS · OFERTAS · DIVERSOS ⌄
```

Acesso passa a ser por URL direta (`/maxorcrm`) ou por um ponto discreto na área de conta, visível só para os dois super-admins. A rota já valida o e-mail; a mudança é de exposição, não de segurança.

**2. Separação de carregamento.** Garantir que nada do CRM esteja no grafo de imports da vitrine: as telas do CRM entram por import dinâmico/lazy dentro das próprias rotas `/maxorcrm/*`, e nenhum componente de site importa `src/components/maxorcrm/*`. Resultado: o visitante nunca baixa as ~1.7k linhas de painel. As rotas do CRM já são `ssr: false`, então também não custam nada no servidor da vitrine.

**3. Separação de trabalho em runtime.** Manter o carrossel de atualização (realtime + revalidação por foco/intervalo) rodando **só na vitrine**, como hoje, e confirmar que dentro do CRM ele fica desligado para não competir com salvamentos de produto. A direção do dado continua uma só: CRM grava em `products`, site lê.

## O que NÃO muda

- Continua um projeto, um deploy, um backend, um `src/maxor-kit/`.
- Nenhuma alteração no painel do CRM, nas permissões ou nos dois acessos super-admin (área travada por seu pedido).
- Nenhuma mudança de layout, tema Navy, RLS ou regra de catálogo.
- O CRM continua acessível em `/maxorcrm` — só deixa de ser anunciado no menu público.

## Ganho esperado

- Bundle inicial da vitrine menor (sai o maior par de arquivos de UI do projeto).
- Menos JavaScript avaliado no primeiro carregamento → home e páginas de produto abrem mais rápido.
- Painel interno deixa de ser descoberto por navegação casual.
- Catálogo continua atualizando em segundos via realtime.

## Detalhes técnicos

- `src/components/site/Shell.tsx`: retirar a entrada `Maxor CRM` de `NAV` (e do rodapé, se estiver lá).
- `src/routes/maxorcrm/fase-*.tsx`: passar a montar `Fase1Catalog`/`Fase2Sales` via `React.lazy` + `Suspense`, mantendo `ssr: false`.
- Auditar com busca que nenhum arquivo fora de `src/routes/maxorcrm/*` importa `src/components/maxorcrm/*` (hoje só `admin.crm.tsx` é candidato a checagem).
- `src/routes/__root.tsx`: manter `useCrmSync(!isCrmArea)` como está — é exatamente a política desejada.
- Verificação: build + comparação de tamanho dos chunks da vitrine, e um passo pelo Playwright confirmando que `/maxorcrm` continua funcional e o menu público não mostra mais o item.

Se preferir uma variante mais radical (subdomínio próprio para o CRM, ex. `crm.maxorsports.com.br`, apontando para o mesmo projeto), isso é possível depois — mas a separação acima já entrega o ganho de peso sem tocar em DNS.
