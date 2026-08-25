# Diagnóstico de Sincronização CRM Maxor

## 1. Diagnóstico Rápido
A falha de visibilidade (produtos ocultos no CRM que ainda aparecem no site) ocorre principalmente porque:
- **Cache de Query:** Se houver algum cache de rede ou persistência local, o site pode estar lendo uma versão antiga do catálogo.
- **Lógica de "Merge":** Se o site tentar mesclar (merge) novos produtos com os antigos em vez de substituir (set) o array inteiro, produtos deletados ou ocultados no CRM permanecerão no estado local do frontend.
- **Filtro de Visibilidade no Fetch:** No `src/lib/crm-db-catalog.ts`, o filtro `.eq("site_visible", true)` já existe, mas se o Realtime disparar um `UPDATE` onde `site_visible` mudou para `false`, o site precisa garantir que esse item suma do carrossel.

## 2. Código Corrigido (Site)

### Reforço no `src/lib/catalog.ts`
Garantir que o método de atualização seja sempre destrutivo para o estado antigo (substituição total) e que o filtro de visibilidade seja absoluto.

```typescript
// src/lib/catalog.ts

export function setCrmProducts(products: unknown[] | null | undefined): number {
  // 1. Limpa o array local IMEDIATAMENTE para evitar stale data
  const next: ProductWithSection[] = (Array.isArray(products) ? products : [])
    .map((p) => p as Record<string, unknown>)
    .filter((p) => {
      const isPub = isPublished(p); // Verifica site_visible
      const selo = normalizeSelo(p.tag ?? p.selo);
      
      // GATING ESTREITO v1.6: site_visible DEVE ser true
      // Se o CRM mandou o produto mas site_visible é false, ele NÃO entra no site.
      return isPub === true && selo !== null;
    })
    .map(normalizeProduct)
    .filter((p) => p.id && isUsableImage(p.img));

  // 2. Substituição atômica
  ALL_PRODUCTS.length = 0;
  ALL_PRODUCTS.push(...next);
  
  version += 1;
  listeners.forEach((fn) => fn());
  return ALL_PRODUCTS.length;
}
```

## 3. Validação de Payload (CRM)
Para que a sincronização seja perfeita, o CRM (Antigravity) deve garantir o envio destes campos:
```json
{
  "sku": "MXR-XXXX",
  "site_visible": true,
  "tag": "Destaque",
  "price": 299.90
}
```
**Nota:** Se `site_visible` for alterado para `false` no CRM, o Realtime do site detectará a mudança na tabela `products`, chamará `fetchDbProducts` (que já filtra por `true`) e o `setCrmProducts` atualizará a vitrine removendo o produto automaticamente.
