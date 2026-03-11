ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE;

ALTER TABLE public.goals
DROP CONSTRAINT IF EXISTS goals_material_name_month_year_key;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.goals
        WHERE association_id IS NULL
    ) AND NOT EXISTS (
        SELECT 1
        FROM public.associations
    ) THEN
        RAISE EXCEPTION 'Cannot backfill goals.association_id because no associations exist.';
    END IF;
END $$;

INSERT INTO public.goals (material_name, month, year, target_weight, created_at, association_id)
SELECT
    g.material_name,
    g.month,
    g.year,
    g.target_weight,
    g.created_at,
    a.id
FROM public.goals g
CROSS JOIN public.associations a
WHERE g.association_id IS NULL
AND NOT EXISTS (
    SELECT 1
    FROM public.goals existing
    WHERE existing.association_id = a.id
      AND existing.material_name = g.material_name
      AND existing.month = g.month
      AND existing.year = g.year
);

DELETE FROM public.goals
WHERE association_id IS NULL;

ALTER TABLE public.goals
ALTER COLUMN association_id SET NOT NULL;

ALTER TABLE public.goals
ADD CONSTRAINT goals_association_id_material_name_month_year_key
UNIQUE (association_id, material_name, month, year);

CREATE INDEX IF NOT EXISTS goals_association_id_idx
ON public.goals (association_id);
