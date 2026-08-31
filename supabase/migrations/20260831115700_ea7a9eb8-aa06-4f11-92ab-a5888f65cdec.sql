CREATE TABLE public.catalog_taxonomy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('brand','category','type')),
  name text NOT NULL,
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, kind, slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_taxonomy TO authenticated;
GRANT ALL ON public.catalog_taxonomy TO service_role;

ALTER TABLE public.catalog_taxonomy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog_taxonomy_select_members" ON public.catalog_taxonomy
  FOR SELECT TO authenticated
  USING (private.is_org_member(org_id));

CREATE POLICY "catalog_taxonomy_insert_admin" ON public.catalog_taxonomy
  FOR INSERT TO authenticated
  WITH CHECK (private.is_org_member(org_id) AND (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'super_admin')));

CREATE POLICY "catalog_taxonomy_update_admin" ON public.catalog_taxonomy
  FOR UPDATE TO authenticated
  USING (private.is_org_member(org_id) AND (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'super_admin')))
  WITH CHECK (private.is_org_member(org_id) AND (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'super_admin')));

CREATE POLICY "catalog_taxonomy_delete_admin" ON public.catalog_taxonomy
  FOR DELETE TO authenticated
  USING (private.is_org_member(org_id) AND (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'super_admin')));

CREATE TRIGGER catalog_taxonomy_set_updated_at
  BEFORE UPDATE ON public.catalog_taxonomy
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.catalog_taxonomy (org_id, kind, name, slug)
SELECT DISTINCT ON (p.org_id, k.kind, lower(btrim(k.val)))
  p.org_id, k.kind, btrim(k.val),
  regexp_replace(lower(btrim(k.val)), '[^a-z0-9]+', '-', 'g')
FROM public.products p
CROSS JOIN LATERAL (VALUES
  ('brand', COALESCE(NULLIF(btrim(p.marca_prod), ''), p.brand)),
  ('category', COALESCE(NULLIF(btrim(p.categoria_prod), ''), p.category)),
  ('type', NULLIF(btrim(p.tipo_prod), ''))
) AS k(kind, val)
WHERE p.org_id IS NOT NULL AND k.val IS NOT NULL AND btrim(k.val) <> ''
ON CONFLICT (org_id, kind, slug) DO NOTHING;