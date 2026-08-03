# Contrato de Integração — CRM Maxor → Site (v1.3)

## Endpoint
```
POST https://maxorsports.lovable.app/api/public/crm/products
Headers:
  Content-Type: application/json
  x-maxor-key: <MAXOR_CRM_INGEST_KEY>
Body: { "products": [ {...}, {...} ] }   // ou um único objeto
```

Diagnóstico (GET, sem chave):
```
GET https://maxorsports.lovable.app/api/public/crm/products?diagnostico=1
```
Retorna todos os produtos do banco e o motivo exato de cada um estar oculto.

## Payload padrão (canônico)
```json
{
  "sku": "MXR-5981",
  "name": "AIR ZOOM ALPHAFLY - Infrared / White / Black",
  "brand": "Nike",
  "category": "Corrida",
  "section": "masculino",
  "description": "Texto comercial do produto.",
  "price": 330.14,
  "old_price": 429.90,
  "model_group": "AIR ZOOM ALPHAFLY",
  "colors": ["Infrared", "White", "Black"],
  "sizes": ["38", "39", "40", "41", "42", "43"],
  "stock": 0,
  "backorder": true,
  "launch": false,
  "tag": "Novidade",
  "site_visible": true,
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
    "https://cdn.exemplo.com/foto2.jpg"
  ]
}
```

## Campos obrigatórios (sem eles o produto NÃO aparece)
| Campo | Regra |
|---|---|
| `sku` | único, string. É a chave de upsert. |
| `name` | string não vazia |
| `price` | número > 0 (aceita `"R$ 1.299,90"`, `1299.9`, `"1299,90"`) |
| `site_visible` | precisa ser `true` |
| `images` | ao menos 1 imagem **base64** (`data:image/...;base64,...`) ou **URL https:// pública**. `http://127.0.0.1`, `localhost`, caminho de disco → descartado. |

## Aliases aceitos (PT-BR ou EN, maiúsc./acentos ignorados)
- sku: `sku`, `codigo`, `ref`, `referencia`
- name: `name`, `nome`, `titulo`, `produto`
- brand: `brand`, `marca`
- category: `category`, `categoria`, `tipo`, `linha`
- section: `section`, `secao`, `genero`, `gender`, `sexo`, `publico`, `departamento`
- price: `price`, `preco`, `valor`, `valorvenda`
- old_price: `old_price`, `preco_antigo`, `preco_original`, `compare_price`
- model_group: `model_group`, `grupo_modelo`, `familia`, `colorway_group`
- sizes: `sizes`, `tamanhos`, `numeracao`, `grade`
- colors: `colors`, `cores`, `cor`, `colorway`
- site_visible: `site_visible`, `visivel`, `publicado`, `ativo`, `exibir_site`
- images: `images`, `imagens`, `fotos`, `galeria`, `image_urls`, `midias`
- imagem principal: `img`, `imagem`, `foto`, `capa`, `cover`, `thumbnail`

## Valores de `section`
`masculino` | `feminino` | `infantil`
(`unissex`, `unissex kids`, `menino`, `menina`, `kids`, `homem`, `mulher` são convertidos automaticamente)

## Resposta esperada
```json
{ "ok": true, "received": 2, "upserted": 2, "items": [{ "sku": "...", "site_visible": true }] }
```
Erros: `401` chave inválida · `400` payload inválido (retorna quais campos falharam).

## Selo (`tag`) — obrigatório para exibir (v1.4)
O produto só aparece no site se **`site_visible = true`** E tiver um selo válido:

| Selo enviado | Efeito no site |
|---|---|
| `Destaque` | aparece nas vitrines e recebe badge "Destaque" |
| `Lançamento` | aparece em `/lancamentos` e no carrossel da home |
| `Oferta` | aparece em `/ofertas` |
| `Normal` | aparece nas listagens, **sem badge** |
| vazio / "nenhum" | **não é exibido** |

`site_visible` agora tem padrão **false**: se o campo não vier no payload, o produto fica oculto.
