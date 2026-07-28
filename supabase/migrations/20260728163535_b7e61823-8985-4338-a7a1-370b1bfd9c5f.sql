CREATE TABLE public.buyer_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id text NOT NULL,
  name text NOT NULL,
  brand text,
  img text,
  price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyer_favorites TO authenticated;
GRANT ALL ON public.buyer_favorites TO service_role;
ALTER TABLE public.buyer_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers read own favorites" ON public.buyer_favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Buyers insert own favorites" ON public.buyer_favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Buyers delete own favorites" ON public.buyer_favorites FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX idx_buyer_favorites_user ON public.buyer_favorites (user_id);