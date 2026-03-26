-- Ensure public access to buyers
DROP POLICY IF EXISTS "Public read buyers" ON public.buyers;
DROP POLICY IF EXISTS "Users can read buyers from their association" ON public.buyers;

-- Ensure public access or authenticated access to create buyers globally
DROP POLICY IF EXISTS "Authenticated users can create buyers" ON public.buyers;
DROP POLICY IF EXISTS "Users can insert buyers from their association" ON public.buyers;

-- Remove association_id from buyers to make them global across all associations
ALTER TABLE public.buyers DROP COLUMN IF EXISTS association_id CASCADE;

CREATE POLICY "Public read buyers" ON public.buyers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create buyers" ON public.buyers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
