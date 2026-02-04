-- Add subclasses array column to materials table
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS subclasses TEXT[] DEFAULT '{}';

-- Optional: Migrate existing single subclass to array if needed (simple approximation)
-- UPDATE public.materials SET subclasses = ARRAY[subclass] WHERE subclass IS NOT NULL AND subclasses = '{}';
