DROP POLICY IF EXISTS "Produtos visíveis são públicos" ON public.products;
DROP POLICY IF EXISTS products_public_read ON public.products;
DROP POLICY IF EXISTS products_org_read ON public.products;

CREATE POLICY products_anon_read ON public.products
FOR SELECT TO anon
USING (site_visible = true AND status = 'published' AND (tag IS NULL OR tag <> 'Nenhum'));

CREATE POLICY products_authenticated_read ON public.products
FOR SELECT TO authenticated
USING (
  (site_visible = true AND status = 'published' AND (tag IS NULL OR tag <> 'Nenhum'))
  OR (org_id IN (SELECT ur.org_id FROM public.user_roles ur WHERE ur.user_id = auth.uid()))
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;