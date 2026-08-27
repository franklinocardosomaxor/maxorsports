CREATE TABLE public.finance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('payable','receivable')),
  description text NOT NULL,
  category text,
  counterparty text,
  amount_brl numeric NOT NULL DEFAULT 0,
  due_date date NOT NULL,
  paid_at date,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','paid','canceled')),
  method text,
  notes text,
  deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX finance_entries_org_due_idx ON public.finance_entries (org_id, due_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_entries TO authenticated;
GRANT ALL ON public.finance_entries TO service_role;

ALTER TABLE public.finance_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY finance_entries_org_select ON public.finance_entries
  FOR SELECT TO authenticated USING (private.is_org_member(org_id));
CREATE POLICY finance_entries_org_insert ON public.finance_entries
  FOR INSERT TO authenticated WITH CHECK (private.is_org_member(org_id));
CREATE POLICY finance_entries_org_update ON public.finance_entries
  FOR UPDATE TO authenticated USING (private.is_org_member(org_id)) WITH CHECK (private.is_org_member(org_id));
CREATE POLICY finance_entries_org_delete ON public.finance_entries
  FOR DELETE TO authenticated USING (private.is_org_member(org_id));

CREATE TRIGGER finance_entries_set_updated_at
  BEFORE UPDATE ON public.finance_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();