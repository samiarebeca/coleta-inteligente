-- Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expense_type TEXT NOT NULL CHECK (expense_type IN (
        'Operacional',
        'Alimentação',
        'Manutenção',
        'Infraestrutura',
        'Administrativo',
        'Logística',
        'Impostos e Taxas',
        'Equipamentos e EPIs'
    )),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policies for security
CREATE POLICY "Users can read expenses from their association" 
ON public.expenses FOR SELECT 
USING ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

CREATE POLICY "Users can insert expenses from their association" 
ON public.expenses FOR INSERT 
WITH CHECK ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

CREATE POLICY "Users can update expenses from their association" 
ON public.expenses FOR UPDATE 
USING ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

CREATE POLICY "Users can delete expenses from their association" 
ON public.expenses FOR DELETE 
USING ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

-- Create index
CREATE INDEX IF NOT EXISTS expenses_association_id_idx ON public.expenses (association_id);
