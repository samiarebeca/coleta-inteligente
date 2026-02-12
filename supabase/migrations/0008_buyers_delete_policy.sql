-- Adiciona política de exclusão para a tabela buyers
-- Permite que usuários autenticados excluam compradores

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete buyers' AND tablename = 'buyers') THEN
        CREATE POLICY "Authenticated users can delete buyers" ON public.buyers FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;
