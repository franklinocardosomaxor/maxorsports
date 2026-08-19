-- Migração para estender a tabela de produtos com campos do CRM Maxor v1.4

-- 1. Adicionar colunas se não existirem
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='id_produto') THEN
        ALTER TABLE public.products ADD COLUMN id_produto TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='name_prod') THEN
        ALTER TABLE public.products ADD COLUMN name_prod TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='marca_prod') THEN
        ALTER TABLE public.products ADD COLUMN marca_prod TEXT DEFAULT 'Nike';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='categoria_prod') THEN
        ALTER TABLE public.products ADD COLUMN categoria_prod TEXT DEFAULT 'Calçados Esportivos';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='tipo_prod') THEN
        ALTER TABLE public.products ADD COLUMN tipo_prod TEXT DEFAULT 'Calçados Esportivos';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='genero') THEN
        ALTER TABLE public.products ADD COLUMN genero TEXT DEFAULT 'Masculino';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='cost_supplier') THEN
        ALTER TABLE public.products ADD COLUMN cost_supplier NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='shipping_cost') THEN
        ALTER TABLE public.products ADD COLUMN shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='margin_percent') THEN
        ALTER TABLE public.products ADD COLUMN margin_percent NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='valor_dec') THEN
        ALTER TABLE public.products ADD COLUMN valor_dec NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='discount_price') THEN
        ALTER TABLE public.products ADD COLUMN discount_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='num_cal_min') THEN
        ALTER TABLE public.products ADD COLUMN num_cal_min INTEGER NOT NULL DEFAULT 37;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='num_cal_max') THEN
        ALTER TABLE public.products ADD COLUMN num_cal_max INTEGER NOT NULL DEFAULT 44;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='qtde_est') THEN
        ALTER TABLE public.products ADD COLUMN qtde_est INTEGER NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='vender_sem_estoque') THEN
        ALTER TABLE public.products ADD COLUMN vender_sem_estoque BOOLEAN NOT NULL DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='badge_text') THEN
        ALTER TABLE public.products ADD COLUMN badge_text TEXT DEFAULT 'Normal';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='status') THEN
        ALTER TABLE public.products ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='foto_principal') THEN
        ALTER TABLE public.products ADD COLUMN foto_principal TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='imagens') THEN
        ALTER TABLE public.products ADD COLUMN imagens JSONB NOT NULL DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='descricao') THEN
        ALTER TABLE public.products ADD COLUMN descricao TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='slug') THEN
        ALTER TABLE public.products ADD COLUMN slug TEXT;
    END IF;
END $$;

-- 2. Atualizar políticas de RLS para o site público refletir as novas colunas
DROP POLICY IF EXISTS "Produtos visíveis são públicos" ON public.products;
CREATE POLICY "Produtos visíveis são públicos" ON public.products
    FOR SELECT USING (
        (site_visible = true AND status = 'published' AND tag <> 'Nenhum')
        OR (auth.role() = 'authenticated')
    );

-- Garantir acesso
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
