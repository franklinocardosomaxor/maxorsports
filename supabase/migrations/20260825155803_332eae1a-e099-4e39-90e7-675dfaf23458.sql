CREATE INDEX IF NOT EXISTS products_public_catalog_updated_idx
ON public.products (updated_at DESC)
WHERE site_visible = true
  AND status = 'published'
  AND (tag IS NULL OR tag <> 'Nenhum');

CREATE INDEX IF NOT EXISTS products_status_created_at_idx
ON public.products (status, created_at DESC);

CREATE INDEX IF NOT EXISTS products_org_id_idx
ON public.products (org_id);