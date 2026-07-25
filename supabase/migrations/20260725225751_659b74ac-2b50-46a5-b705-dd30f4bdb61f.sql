
-- 1) Trigger que faltava em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Unicidade para permitir ON CONFLICT em user_roles
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_org_role_uidx
  ON public.user_roles(user_id, org_id, role);

-- 3) Super-admin grant restrito aos dois emails autorizados
CREATE OR REPLACE FUNCTION public.grant_super_admin_for_authorized_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  authorized text[] := ARRAY['maxortecnologia@gmail.com','franklinocardoso@gmail.com'];
  target_org uuid;
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN RETURN NEW; END IF;
  IF lower(NEW.email) <> ALL(authorized) THEN RETURN NEW; END IF;
  SELECT org_id INTO target_org FROM public.user_roles WHERE user_id = NEW.id LIMIT 1;
  IF target_org IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.user_roles (user_id, org_id, role)
  VALUES (NEW.id, target_org, 'super_admin')
  ON CONFLICT (user_id, org_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.grant_super_admin_for_authorized_email() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_confirmed_grant_super ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_grant_super
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_super_admin_for_authorized_email();

-- 4) Helper is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin'); $$;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;

-- 5) Triggers updated_at
DROP TRIGGER IF EXISTS t_contacts_updated ON public.contacts;
CREATE TRIGGER t_contacts_updated BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS t_deals_updated ON public.deals;
CREATE TRIGGER t_deals_updated BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS t_buyer_profiles_updated ON public.buyer_profiles;
CREATE TRIGGER t_buyer_profiles_updated BEFORE UPDATE ON public.buyer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6) Índices
CREATE INDEX IF NOT EXISTS idx_contacts_org        ON public.contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner      ON public.contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email      ON public.contacts(lower(email));
CREATE INDEX IF NOT EXISTS idx_contacts_phone      ON public.contacts(phone_e164);
CREATE INDEX IF NOT EXISTS idx_deals_org           ON public.deals(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact       ON public.deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline      ON public.deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage         ON public.deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_status        ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_stages_pipeline     ON public.stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_stages_org          ON public.stages(org_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_org       ON public.pipelines(org_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user     ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org      ON public.user_roles(org_id);
CREATE INDEX IF NOT EXISTS idx_activities_org      ON public.activities(org_id);
CREATE INDEX IF NOT EXISTS idx_activities_entity   ON public.activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created  ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_user ON public.buyer_profiles(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_contacts_org_email
  ON public.contacts(org_id, lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uidx_contacts_org_phone
  ON public.contacts(org_id, phone_e164) WHERE phone_e164 IS NOT NULL;

-- 7) Seed automático de pipeline
CREATE OR REPLACE FUNCTION public.seed_default_pipeline()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE new_pipeline_id uuid;
BEGIN
  INSERT INTO public.pipelines (org_id, name, is_default) VALUES (NEW.id, 'Pipeline Padrão', true)
    RETURNING id INTO new_pipeline_id;
  INSERT INTO public.stages (pipeline_id, org_id, name, "order", color) VALUES
    (new_pipeline_id, NEW.id, 'Novo',       1, '#00BFC6'),
    (new_pipeline_id, NEW.id, 'Contato',    2, '#7EEBC1'),
    (new_pipeline_id, NEW.id, 'Proposta',   3, '#C7F500'),
    (new_pipeline_id, NEW.id, 'Negociação', 4, '#F59E0B'),
    (new_pipeline_id, NEW.id, 'Ganho',      5, '#22C55E'),
    (new_pipeline_id, NEW.id, 'Perdido',    6, '#EF4444');
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.seed_default_pipeline() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS on_org_created_seed_pipeline ON public.organizations;
CREATE TRIGGER on_org_created_seed_pipeline
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_pipeline();

-- 8) Auditoria de papéis
CREATE OR REPLACE FUNCTION public.audit_user_roles()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE target_org uuid; target_user uuid; verb text; role_txt text;
BEGIN
  IF TG_OP = 'INSERT' THEN verb:='role_granted'; target_org:=NEW.org_id; target_user:=NEW.user_id; role_txt:=NEW.role::text;
  ELSIF TG_OP = 'DELETE' THEN verb:='role_revoked'; target_org:=OLD.org_id; target_user:=OLD.user_id; role_txt:=OLD.role::text;
  ELSE verb:='role_changed'; target_org:=NEW.org_id; target_user:=NEW.user_id; role_txt:=OLD.role::text||' -> '||NEW.role::text;
  END IF;
  INSERT INTO public.activities (org_id, entity_type, entity_id, kind, body, owner_id)
  VALUES (target_org, 'user', target_user, verb, role_txt, auth.uid());
  RETURN COALESCE(NEW, OLD);
END; $$;
REVOKE EXECUTE ON FUNCTION public.audit_user_roles() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS t_user_roles_audit ON public.user_roles;
CREATE TRIGGER t_user_roles_audit AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_user_roles();

-- 9) RLS granular
DROP POLICY IF EXISTS "org members manage contacts" ON public.contacts;
CREATE POLICY "members read contacts" ON public.contacts FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "sales write contacts" ON public.contacts FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id) AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'sales') OR public.has_role(auth.uid(),'super_admin')));
CREATE POLICY "sales update contacts" ON public.contacts FOR UPDATE TO authenticated
  USING (public.is_org_member(org_id) AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'sales') OR public.has_role(auth.uid(),'super_admin')));
CREATE POLICY "admins delete contacts" ON public.contacts FOR DELETE TO authenticated
  USING (public.is_org_member(org_id) AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')));

DROP POLICY IF EXISTS "org members manage deals" ON public.deals;
CREATE POLICY "members read deals" ON public.deals FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "sales write deals" ON public.deals FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(org_id) AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'sales') OR public.has_role(auth.uid(),'super_admin')));
CREATE POLICY "sales update deals" ON public.deals FOR UPDATE TO authenticated
  USING (public.is_org_member(org_id) AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'sales') OR public.has_role(auth.uid(),'super_admin')));
CREATE POLICY "admins delete deals" ON public.deals FOR DELETE TO authenticated
  USING (public.is_org_member(org_id) AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')));

DROP POLICY IF EXISTS "org members manage pipelines" ON public.pipelines;
CREATE POLICY "members read pipelines" ON public.pipelines FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "admins write pipelines" ON public.pipelines FOR ALL TO authenticated
  USING (public.is_org_member(org_id) AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')))
  WITH CHECK (public.is_org_member(org_id) AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')));

DROP POLICY IF EXISTS "org members manage stages" ON public.stages;
CREATE POLICY "members read stages" ON public.stages FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "admins write stages" ON public.stages FOR ALL TO authenticated
  USING (public.is_org_member(org_id) AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')))
  WITH CHECK (public.is_org_member(org_id) AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin')));

DROP POLICY IF EXISTS "org members manage activities" ON public.activities;
CREATE POLICY "members read activities" ON public.activities FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "members log activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (public.is_org_member(org_id));
