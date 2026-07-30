-- 1) buyer_profiles: allow owners to delete their own profile
CREATE POLICY "Buyers delete own profile" ON public.buyer_profiles
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 2) organizations: allow authenticated users to create an organization
CREATE POLICY "Authenticated can create org" ON public.organizations
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 3) explicit delete coverage for pipelines and stages (admins / super admins only)
CREATE POLICY "admins delete pipelines" ON public.pipelines
FOR DELETE TO authenticated
USING (public.is_org_member(org_id) AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "admins delete stages" ON public.stages
FOR DELETE TO authenticated
USING (public.is_org_member(org_id) AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role)));

-- 4) harden security definer role-check functions so they only answer about the caller
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    WHEN _user_id <> auth.uid()
         AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
      THEN false
    ELSE EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
  END;
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    WHEN _user_id <> auth.uid()
         AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
      THEN false
    ELSE EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin')
  END;
$function$;

-- keep internal-only definer functions unreachable from client roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_user_roles() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_default_pipeline() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_super_admin_for_authorized_email() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.current_org_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid) FROM anon;