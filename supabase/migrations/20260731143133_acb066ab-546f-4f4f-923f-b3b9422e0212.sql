ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}'::text[];

UPDATE public.products
SET images = ARRAY[img]
WHERE img IS NOT NULL AND coalesce(array_length(images, 1), 0) = 0;