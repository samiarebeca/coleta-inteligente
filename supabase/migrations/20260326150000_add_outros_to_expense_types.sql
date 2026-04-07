-- Update expense_type check constraint to include 'Outros'
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_expense_type_check;

ALTER TABLE public.expenses ADD CONSTRAINT expenses_expense_type_check CHECK (expense_type IN (
    'Operacional',
    'Alimentação',
    'Manutenção',
    'Infraestrutura',
    'Administrativo',
    'Logística',
    'Impostos e Taxas',
    'Equipamentos e EPIs',
    'Outros'
));
