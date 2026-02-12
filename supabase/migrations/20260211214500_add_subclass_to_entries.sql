-- Add subclass column to entries table
ALTER TABLE public.entries ADD COLUMN IF NOT EXISTS subclass TEXT;
