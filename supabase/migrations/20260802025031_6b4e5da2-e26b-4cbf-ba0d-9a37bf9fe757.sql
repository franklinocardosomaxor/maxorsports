CREATE OR REPLACE FUNCTION private.is_crm_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

REVOKE ALL ON FUNCTION private.is_crm_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_crm_member(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "crm members read product images" ON storage.objects;
CREATE POLICY "crm members read product images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-images' AND private.is_crm_member(auth.uid()));

DROP POLICY IF EXISTS "crm members upload product images" ON storage.objects;
CREATE POLICY "crm members upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND private.is_crm_member(auth.uid()));

DROP POLICY IF EXISTS "crm members update product images" ON storage.objects;
CREATE POLICY "crm members update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND private.is_crm_member(auth.uid()))
WITH CHECK (bucket_id = 'product-images' AND private.is_crm_member(auth.uid()));

DROP POLICY IF EXISTS "crm members delete product images" ON storage.objects;
CREATE POLICY "crm members delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND private.is_crm_member(auth.uid()));

DROP FUNCTION IF EXISTS public.is_crm_member(uuid);