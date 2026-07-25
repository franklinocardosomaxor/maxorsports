
-- 1) Reduzir superfície das funções SECURITY DEFINER
-- Triggers internos: revogar EXECUTE de qualquer visitante e usuário
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Helpers usados por políticas RLS: manter para authenticated (RLS precisa),
-- mas negar para visitantes anônimos e público geral
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_org_id() FROM PUBLIC, anon;

-- 2) Impedir escalonamento de privilégios em user_roles
-- Apenas admins da mesma organização podem gerir papéis
CREATE POLICY "admins insert roles in their org"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id) AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins update roles in their org"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.is_org_member(org_id) AND public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.is_org_member(org_id) AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "admins delete roles in their org"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_org_member(org_id) AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) buyer_profiles: negar exclusão pelo cliente (nunca deve apagar sozinho)
-- Já não tem política DELETE → permanece fail-closed. Apenas reforçamos comentário.
COMMENT ON TABLE public.buyer_profiles IS 'Dados de comprador. DELETE apenas via service_role.';
