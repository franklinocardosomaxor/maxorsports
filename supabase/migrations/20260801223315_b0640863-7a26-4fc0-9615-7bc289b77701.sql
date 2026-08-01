ALTER TABLE public.products ADD COLUMN IF NOT EXISTS model_group text;
CREATE INDEX IF NOT EXISTS products_model_group_idx ON public.products (model_group);