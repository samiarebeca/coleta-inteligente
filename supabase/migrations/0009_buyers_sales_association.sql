-- Arquivo de migração para incluir association_id em compradores e vendas
-- Para que assocações não vejam dados de vendas e compradores de outras.

-- 1. Buyers:
ALTER TABLE public.buyers 
ADD COLUMN IF NOT EXISTS association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS buyers_association_id_idx ON public.buyers (association_id);

-- 2. Sales:
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS sales_association_id_idx ON public.sales (association_id);

-- 3. Atualizar as políticas de ROW LEVEL SECURITY (se aplicável, para garantir travamento direto no DB)
-- Removendo políticas antigas abertas
DROP POLICY IF EXISTS "Public read buyers" ON public.buyers;
DROP POLICY IF EXISTS "Public read sales" ON public.sales;

-- Criando políticas restritivas baseadas na association_id que o user tenha no profile
-- (Assume-se que association_id esteja sendo enviada no backend, ou filtrada no app)
CREATE POLICY "Users can read buyers from their association" 
ON public.buyers FOR SELECT 
USING ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

CREATE POLICY "Users can read sales from their association" 
ON public.sales FOR SELECT 
USING ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

-- Criador pode inserir
CREATE POLICY "Users can insert buyers from their association" 
ON public.buyers FOR INSERT 
WITH CHECK ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

CREATE POLICY "Users can insert sales from their association" 
ON public.sales FOR INSERT 
WITH CHECK ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );
