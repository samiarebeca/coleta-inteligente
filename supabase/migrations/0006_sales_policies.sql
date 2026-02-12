-- Políticas de Permissão para Edição e Exclusão na Tabela Sales

-- Permitir que usuários autenticados atualizem vendas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update sales' AND tablename = 'sales') THEN
        CREATE POLICY "Authenticated users can update sales" ON public.sales FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Permitir que usuários autenticados excluam vendas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete sales' AND tablename = 'sales') THEN
        CREATE POLICY "Authenticated users can delete sales" ON public.sales FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;
