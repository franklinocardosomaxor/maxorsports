# Busca por modelo (e não por marca)

Hoje a busca soma pontos para qualquer termo que apareça em nome, marca ou categoria. Como "Adidas" é um termo, qualquer tênis Adidas entra no resultado — mesmo quando o modelo da foto não existe no catálogo. Foi o que aconteceu com o Adizero Adios Pro Evo 1.

## O que muda

1. **O modelo manda.** A marca (e a categoria) deixam de qualificar um produto sozinhas: passam a ser apenas desempate. Um produto só entra no resultado se casar com o modelo pesquisado (ex: "Adizero Adios Pro Evo", "Air Force 1") ou com o texto digitado pelo cliente.
2. **Sem modelo no catálogo = sem resultado.** Se nenhum produto casar com o modelo, a busca retorna vazio em vez de listar "primos" da mesma marca.
3. **Mensagem de contato.** No estado vazio o site mostra o aviso já existente ("Mande uma imagem ou nome...") com o botão de WhatsApp, citando o que foi identificado na foto (ex: "Adidas Adizero Adios Pro Evo 1") para o cliente já mandar o pedido pronto ao atendimento.

## Detalhes técnicos

- `src/lib/crm.image-search.functions.ts`:
  - separar os termos em `modelTerms` (modelo detectado pela IA + texto digitado) e `contextTerms` (marca, categoria, keywords de cor/visual);
  - `rank()` passa a exigir pelo menos um acerto forte em `modelTerms` contra o nome do produto (match de palavra inteira, com tolerância a plural/variação); `contextTerms` só somam pontos a quem já passou nesse filtro;
  - marca com match reforça a pontuação, mas nunca cria um hit sozinha;
  - `searchByName` usa a mesma regra: o texto digitado é tratado como modelo, salvo quando é só o nome de uma marca — nesse caso continua listando a marca (comportamento esperado ao buscar "Nike").
- `src/components/site/Shell.tsx`: o estado `empty` passa a exibir marca + modelo identificados na frase e no texto pré-preenchido do link do WhatsApp.

Nada de layout, rotas ou catálogo muda fora desses dois arquivos.
