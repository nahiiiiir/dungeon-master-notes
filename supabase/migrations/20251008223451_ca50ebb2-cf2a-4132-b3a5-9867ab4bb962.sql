-- Create profiles table for DM information
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Add user_id to campaigns table
ALTER TABLE public.campaigns ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add user_id to players table
ALTER TABLE public.players ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add user_id to encounters table
ALTER TABLE public.encounters ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update campaigns RLS policies
DROP POLICY IF EXISTS "Public campaigns access" ON public.campaigns;

CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
  ON public.campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.campaigns
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON public.campaigns
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update players RLS policies
DROP POLICY IF EXISTS "Public players access" ON public.players;

CREATE POLICY "Users can view their own players"
  ON public.players
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own players"
  ON public.players
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own players"
  ON public.players
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own players"
  ON public.players
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update encounters RLS policies
DROP POLICY IF EXISTS "Public encounters access" ON public.encounters;

CREATE POLICY "Users can view their own encounters"
  ON public.encounters
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own encounters"
  ON public.encounters
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own encounters"
  ON public.encounters
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own encounters"
  ON public.encounters
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();