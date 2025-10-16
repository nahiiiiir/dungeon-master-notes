-- Modify encounters table to store enemies as structured data
ALTER TABLE public.encounters 
ALTER COLUMN enemies TYPE jsonb USING 
  CASE 
    WHEN enemies IS NULL OR enemies = '' THEN '[]'::jsonb
    ELSE jsonb_build_array(jsonb_build_object('name', enemies, 'hp', null, 'ac', null))
  END;