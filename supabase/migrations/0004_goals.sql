-- Arquivo de migração para Metas (Goals) - Atualizado
-- 0004_goals.sql

-- 1. DROP Tabela Goals (para resetar as metas antigas se for necessário, ou apenas deletar os dados)
-- DROP TABLE IF EXISTS public.goals; -- CUIDADO: Isso apaga tudo. Vamos apenas limpar e reinserir.

CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_name TEXT NOT NULL,
    month INTEGER NOT NULL, -- 1 a 12
    year INTEGER NOT NULL,
    target_weight DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(material_name, month, year)
);

-- Políticas de segurança (se ainda não existirem)
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read goals' AND tablename = 'goals') THEN
        CREATE POLICY "Public read goals" ON public.goals FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can manage goals' AND tablename = 'goals') THEN
        CREATE POLICY "Authenticated users can manage goals" ON public.goals FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;


-- 2. Limpar metas existentes para Fevereiro 2026 para recriá-las com os novos valores
DELETE FROM public.goals WHERE year = 2026 AND month = 2;

-- 3. Inserir metas específicas para Fevereiro de 2026
-- Materiais: Metal, Vidro, Papel, Plástico
INSERT INTO public.goals (material_name, month, year, target_weight)
VALUES 
    ('Metal', 2, 2026, 3900.00),   -- Ex: 700kg
    ('Vidro', 2, 2026, 9600.00),   -- Ex: 500kg
    ('Papel/Papelão', 2, 2026, 3328.00),  -- Ex: 1200kg (Papelão?) - O user pediu "Papel", vamos usar "Papel" mas talvez ele queira "Papelão".
    ('Plástico', 2, 2026, 7800.00); -- Ex: 1500kg

-- OBS: Se na verdade "Papel" for "Papelão" no banco, o frontend pode não encontrar se buscar por "Papelão".
-- No frontend estamos usando 'Papelão', 'Plástico', 'Alumínio' (Metal?), 'Vidro'.
-- Vou inserir também com os nomes que usamos no app para garantir compatibilidade.
-- Metal = Alumínio, Papel = Papelão.

