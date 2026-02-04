-- Arquivo para criar tabela de entradas (Entries) e atualizar Materials
-- 0003_entries_materials.sql

-- 1. Atualizar a tabela Materials para ter 'subclass'
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS subclass TEXT;


-- 2. Tabela Entries (Entradas)
CREATE TABLE IF NOT EXISTS public.entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT CHECK (source_type IN ('associate', 'avulso')) NOT NULL,
    
    -- Se for associado, guardamos o ID do perfil ou user_id
    associate_id UUID REFERENCES public.profiles(id), 
    
    -- Se for avulso, guardamos nomes/detalhes opcionais
    avulso_name TEXT,
    avulso_document TEXT,

    material_id UUID REFERENCES public.materials(id),
    material_name TEXT, -- Backup caso material seja deletado ou para busca rápida
    
    weight DECIMAL(10,2) NOT NULL DEFAULT 0,
    observation TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Políticas de segurança para Entries
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read entries' AND tablename = 'entries') THEN
        CREATE POLICY "Public read entries" ON public.entries FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can create entries' AND tablename = 'entries') THEN
        CREATE POLICY "Authenticated users can create entries" ON public.entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update entries' AND tablename = 'entries') THEN
        CREATE POLICY "Authenticated users can update entries" ON public.entries FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete entries' AND tablename = 'entries') THEN
        CREATE POLICY "Authenticated users can delete entries" ON public.entries FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;


-- Políticas de segurança para Materials (caso faltem para update/insert)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert materials' AND tablename = 'materials') THEN
        CREATE POLICY "Authenticated users can insert materials" ON public.materials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update materials' AND tablename = 'materials') THEN
        CREATE POLICY "Authenticated users can update materials" ON public.materials FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
END $$;
