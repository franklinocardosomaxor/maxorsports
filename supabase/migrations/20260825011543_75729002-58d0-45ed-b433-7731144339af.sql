CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS import_cost numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS import_cost_included boolean NOT NULL DEFAULT false;

-- Backfill: calcula o imposto de importação para os cadastros existentes
-- (VA = cost_supplier). Não marca como incluído no custo.
UPDATE public.products
SET import_cost = ceil(cost_supplier * 0.60 / 0.83 + 15)
WHERE cost_supplier IS NOT NULL AND cost_supplier > 0;

CREATE TABLE IF NOT EXISTS public.site_campaign (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  active boolean NOT NULL DEFAULT false,
  title text NOT NULL DEFAULT 'Campanha Maxor Sports',
  subtitle text,
  cta_label text,
  cta_url text,
  images text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_campaign TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_campaign TO authenticated;
GRANT ALL ON public.site_campaign TO service_role;

ALTER TABLE public.site_campaign ENABLE ROW LEVEL SECURITY;

-- Leitura: campanha ativa é pública; campanhas inativas só super-admin vê.
CREATE POLICY site_campaign_public_read ON public.site_campaign
  FOR SELECT TO anon, authenticated
  USING (active = true OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY site_campaign_admin_insert ON public.site_campaign
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY site_campaign_admin_update ON public.site_campaign
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY site_campaign_admin_delete ON public.site_campaign
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE OR REPLACE FUNCTION public.site_campaign_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS site_campaign_touch ON public.site_campaign;
CREATE TRIGGER site_campaign_touch BEFORE UPDATE ON public.site_campaign
  FOR EACH ROW EXECUTE FUNCTION public.site_campaign_touch_updated_at();

-- Linha única inicial (inativa) para o CRM editar.
INSERT INTO public.site_campaign (active, title, subtitle)
SELECT false, 'Campanha Maxor Sports', 'Configure as imagens do banner de abertura do site.'
WHERE NOT EXISTS (SELECT 1 FROM public.site_campaign);