ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand_visible BOOLEAN DEFAULT TRUE;
COMMENT ON COLUMN public.products.brand_visible IS 'Visibilidade do produto nas páginas de marcas, independente da vitrine principal.';
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO service_role;
