-- Create maps table
CREATE TABLE public.maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for maps
CREATE POLICY "Users can view their own maps"
ON public.maps
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own maps"
ON public.maps
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maps"
ON public.maps
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maps"
ON public.maps
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_maps_updated_at
BEFORE UPDATE ON public.maps
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for map files
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-maps', 'campaign-maps', true);

-- Create storage policies for map uploads
CREATE POLICY "Users can view their own map files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'campaign-maps' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own map files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'campaign-maps' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own map files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'campaign-maps' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own map files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'campaign-maps' AND auth.uid()::text = (storage.foldername(name))[1]);