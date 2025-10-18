-- Add session_date column to sessions table
ALTER TABLE public.sessions 
ADD COLUMN session_date date;