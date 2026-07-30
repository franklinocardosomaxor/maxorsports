CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  sku text UNIQUE,
  name text NOT NULL,
  brand text NOT NULL DEFAULT 'Maxor',
  section text NOT NULL DEFAULT 'masculino',
  category text NOT NULL DEFAULT 'Casual',
  description text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  old_price numeric(12,2),
  img text,
  colors text[] NOT NULL DEFAULT ARRAY['#0F1720'],
  sizes int[] NOT NULL DEFAULT ARRAY[38,39,40,41,42,43,44],
  stock int NOT NULL DEFAULT 0,
  backorder boolean NOT NULL DEFAULT true,
  launch boolean NOT NULL DEFAULT false,
  tag text,
  site_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products
  FOR SELECT TO anon, authenticated
  USING (site_visible = true);

DROP POLICY IF EXISTS "products_org_read" ON public.products;
CREATE POLICY "products_org_read" ON public.products
  FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM public.user_roles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "products_org_insert" ON public.products;
CREATE POLICY "products_org_insert" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (org_id IN (SELECT org_id FROM public.user_roles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "products_org_update" ON public.products;
CREATE POLICY "products_org_update" ON public.products
  FOR UPDATE TO authenticated
  USING (org_id IN (SELECT org_id FROM public.user_roles WHERE user_id = auth.uid()))
  WITH CHECK (org_id IN (SELECT org_id FROM public.user_roles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "products_org_delete" ON public.products;
CREATE POLICY "products_org_delete" ON public.products
  FOR DELETE TO authenticated
  USING (org_id IN (SELECT org_id FROM public.user_roles WHERE user_id = auth.uid()));

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS products_site_visible_idx ON public.products (site_visible);

INSERT INTO public.products (sku, name, brand, section, category, description, price, sizes, stock, backorder, launch, tag, site_visible)
VALUES ('NKE-PEG41-RUN', 'Tênis Nike Pegasus 41 Pro Running', 'Nike', 'masculino', 'Corrida', 'Tênis Nike Pegasus 41 Pro Running com tecnologia Zoom Air para amortecimento responsivo e corridas de alta performance.', 899.00, ARRAY[38,39,40,41,42,43,44], 15, true, true, 'Novo', true)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name, brand = EXCLUDED.brand, section = EXCLUDED.section,
  category = EXCLUDED.category, description = EXCLUDED.description, price = EXCLUDED.price,
  sizes = EXCLUDED.sizes, stock = EXCLUDED.stock, launch = EXCLUDED.launch,
  tag = EXCLUDED.tag, site_visible = EXCLUDED.site_visible;