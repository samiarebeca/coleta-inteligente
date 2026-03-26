-- Replace associate_id with association_id in entries to ensure data separation by association
ALTER TABLE public.entries DROP COLUMN IF EXISTS associate_id;
ALTER TABLE public.entries ADD COLUMN IF NOT EXISTS association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS entries_association_id_idx ON public.entries (association_id);

-- Ensure association_id exists in sales table to guarantee separation (might already exist in prior migration)
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS sales_association_id_idx ON public.sales (association_id);

-- Replace entries security policies to be based on association
DROP POLICY IF EXISTS "Public read entries" ON public.entries;
DROP POLICY IF EXISTS "Users can read entries from their association" ON public.entries;

CREATE POLICY "Users can read entries from their association" 
ON public.entries FOR SELECT 
USING ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

-- Criador pode inserir com o seu association_id
DROP POLICY IF EXISTS "Authenticated users can create entries" ON public.entries;
DROP POLICY IF EXISTS "Users can insert entries from their association" ON public.entries;

CREATE POLICY "Users can insert entries from their association" 
ON public.entries FOR INSERT 
WITH CHECK ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );
