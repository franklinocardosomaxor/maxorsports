DROP POLICY IF EXISTS site_campaign_public_read ON public.site_campaign;

CREATE POLICY site_campaign_anon_read ON public.site_campaign
  FOR SELECT TO anon
  USING (active = true);

CREATE POLICY site_campaign_auth_read ON public.site_campaign
  FOR SELECT TO authenticated
  USING (active = true OR private.has_role(auth.uid(), 'super_admin'::app_role));