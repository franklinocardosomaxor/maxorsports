# Busca por imagem — galeria do celular, imagem + texto e retorno ao WhatsApp

## O que muda

1. **Liberar a galeria e os arquivos do celular**
   Hoje o botão da câmera abre direto a câmera traseira porque o campo de arquivo usa
   `capture="environment"`. Removendo esse atributo, o celular passa a mostrar o menu
   nativo com as opções Câmera, Galeria/Fotos e Arquivos — o cliente escolhe.

2. **Combinar a imagem com o que foi digitado**
   Quando o cliente digita algo na barra e envia uma foto, os dois passam a valer:
   o texto digitado entra junto dos termos que a IA extrai da imagem (marca, modelo,
   categoria, palavras-chave). Se a IA não reconhecer nada, o texto digitado sozinho
   ainda faz a busca. Hoje a imagem simplesmente apaga a pesquisa por nome.

3. **Mensagem clara quando não achar, com atalho para o WhatsApp**
   O balão de "não encontrado" continua, mas com texto específico para busca por foto:
   "Não achamos esse modelo no nosso catálogo. Manda a foto no nosso WhatsApp de
   atendimento que consultamos o modelo pra você." O botão do WhatsApp já leva a
   referência da busca (marca/modelo reconhecidos ou o texto digitado) na mensagem
   pronta, e o texto orienta o cliente a anexar a mesma foto na conversa.

## Detalhes técnicos

- `src/components/site/Shell.tsx`
  - `ImageSearch`: remover `capture="environment"` do `<input type="file">`
    (mantendo `accept="image/*"`).
  - `submitImage`: passar também o `query` digitado; usar como `term` de exibição a
    combinação `marca + modelo` ou, na falta, o texto digitado / nome do arquivo.
  - `NotFoundBalloon`: aceitar uma prop indicando origem (foto ou texto) para trocar a
    frase de orientação; manter o link `wa.me` já existente com `WHATSAPP_NUMBER`.
- `src/lib/crm.image-search.functions.ts`
  - `searchByImage` recebe um campo opcional `query` no validador e soma esses tokens
    aos termos vindos da visão antes do `rank()`, sem alterar o pool nem o gating do
    catálogo (`site_visible = true`).

Nada do layout, do gating do catálogo ou do checkout é alterado.
