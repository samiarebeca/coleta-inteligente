-- Update partners table to include ratings
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS residue_quality INTEGER CHECK (residue_quality BETWEEN 1 AND 5) DEFAULT 5;
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS residue_volume INTEGER CHECK (residue_volume BETWEEN 1 AND 5) DEFAULT 3;
