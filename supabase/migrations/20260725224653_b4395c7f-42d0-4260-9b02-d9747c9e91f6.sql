
CREATE TABLE public.buyer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  email text,
  country text,
  state text,
  city text,
  address text,
  zip text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyer_profiles TO authenticated;
GRANT ALL ON public.buyer_profiles TO service_role;

ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers read own profile" ON public.buyer_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Buyers insert own profile" ON public.buyer_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Buyers update own profile" ON public.buyer_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER buyer_profiles_set_updated_at
  BEFORE UPDATE ON public.buyer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
