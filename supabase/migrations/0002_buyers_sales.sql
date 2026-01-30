-- Arquivo de migração específico para Compradores e Vendas
-- Rode este arquivo para adicionar as novas funcionalidades sem perder os dados existentes.

-- 1. Tabela Buyers (Compradores)
CREATE TABLE IF NOT EXISTS public.buyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    phone TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Políticas de segurança para Buyers
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read buyers' AND tablename = 'buyers') THEN
        CREATE POLICY "Public read buyers" ON public.buyers FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can create buyers' AND tablename = 'buyers') THEN
        CREATE POLICY "Authenticated users can create buyers" ON public.buyers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update buyers' AND tablename = 'buyers') THEN
        CREATE POLICY "Authenticated users can update buyers" ON public.buyers FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
END $$;


-- 2. Tabela Buyer Materials (Preços e Materiais por Comprador)
CREATE TABLE IF NOT EXISTS public.buyer_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES public.buyers(id) ON DELETE CASCADE NOT NULL,
    material_name TEXT NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Políticas de segurança para Buyer Materials
ALTER TABLE public.buyer_materials ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read buyer_materials' AND tablename = 'buyer_materials') THEN
        CREATE POLICY "Public read buyer_materials" ON public.buyer_materials FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can create buyer_materials' AND tablename = 'buyer_materials') THEN
        CREATE POLICY "Authenticated users can create buyer_materials" ON public.buyer_materials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;


-- 3. Tabela Sales (Vendas)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES public.buyers(id),
    material TEXT NOT NULL,
    subclass TEXT,
    weight DECIMAL(10,2) NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Políticas de segurança para Sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read sales' AND tablename = 'sales') THEN
        CREATE POLICY "Public read sales" ON public.sales FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can create sales' AND tablename = 'sales') THEN
        CREATE POLICY "Authenticated users can create sales" ON public.sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

