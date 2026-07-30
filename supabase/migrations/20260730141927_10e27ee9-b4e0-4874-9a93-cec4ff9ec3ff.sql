REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_user_roles() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_default_pipeline() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_super_admin_for_authorized_email() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated;