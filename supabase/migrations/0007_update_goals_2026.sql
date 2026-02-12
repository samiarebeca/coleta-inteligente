-- Migration to update monthly goals for 2026
-- This ensures values are consistent from January to December

DO $$
DECLARE
    m INTEGER;
BEGIN
    FOR m IN 1..12 LOOP
        -- 1. Remove entries if they exist for this month/year
        DELETE FROM public.goals WHERE year = 2026 AND month = m;

        -- 2. Insert the specific goals requested (USING UPPERCASE as requested)
        -- METAL: 3.9 tons = 3900 kg
        -- PAPEL: 33.28 tons = 33280 kg
        -- PLÁSTICO: 7.8 tons = 7800 kg
        -- VIDRO: 9.6 tons = 9600 kg
        
        INSERT INTO public.goals (material_name, month, year, target_weight)
        VALUES 
            ('METAL', m, 2026, 3900.00),
            ('PAPEL', m, 2026, 33280.00),
            ('PLÁSTICO', m, 2026, 7800.00),
            ('VIDRO', m, 2026, 9600.00);
            
    END LOOP;
END $$;
