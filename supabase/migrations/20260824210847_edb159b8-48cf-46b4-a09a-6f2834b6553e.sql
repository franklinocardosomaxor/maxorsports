-- Backfill: brand é a coluna soberana (lida pelo site); marca_prod vira espelho.
UPDATE public.products
SET marca_prod = brand
WHERE marca_prod IS DISTINCT FROM brand;

-- Trigger: garante que brand e marca_prod nunca mais divirjam,
-- não importa se o cadastro veio do CRM, da API de ingestão ou de SQL manual.
CREATE OR REPLACE FUNCTION public.sync_product_brand_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.brand IS NULL OR btrim(NEW.brand) = '' THEN
    NEW.brand := COALESCE(NULLIF(btrim(NEW.marca_prod), ''), 'Maxor');
  END IF;
  NEW.marca_prod := NEW.brand;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_sync_brand_columns ON public.products;
CREATE TRIGGER products_sync_brand_columns
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.sync_product_brand_columns();