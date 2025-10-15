-- Add HP, AC and notes fields to players table
ALTER TABLE public.players
ADD COLUMN hp integer,
ADD COLUMN ac integer,
ADD COLUMN notes text;