-- Create campaigns table
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  last_session text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  player_name text NOT NULL,
  character_name text NOT NULL,
  race text NOT NULL,
  class text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create encounters table
CREATE TABLE public.encounters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  difficulty text NOT NULL,
  enemies text NOT NULL,
  date text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;

-- Create public access policies (for development - update for production!)
CREATE POLICY "Public campaigns access" ON public.campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public players access" ON public.players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public encounters access" ON public.encounters FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_encounters_updated_at
  BEFORE UPDATE ON public.encounters
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert example data
INSERT INTO public.campaigns (id, title, description, last_session, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'La Maldición del Dragón Carmesí', 'Los héroes deben detener al antiguo dragón rojo antes de que destruya el reino de Valoria', '15 Oct 2025', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'Las Catacumbas Olvidadas', 'Una exploración de mazmorras ancestrales llenas de tesoros y peligros mortales', '8 Oct 2025', 'active');

INSERT INTO public.players (campaign_id, player_name, character_name, race, class, level) VALUES
  ('00000000-0000-0000-0000-000000000001', 'María García', 'Elara Luzdestrella', 'Elfa', 'Maga', 5),
  ('00000000-0000-0000-0000-000000000001', 'Carlos Ruiz', 'Thorin Martillo de Guerra', 'Enano', 'Guerrero', 5);

INSERT INTO public.encounters (campaign_id, title, description, difficulty, enemies, date) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Emboscada de Goblins', 'Los héroes fueron emboscados por un grupo de goblins mientras viajaban por el bosque oscuro', 'easy', '6 Goblins, 1 Hobgoblin', '12 Oct 2025'),
  ('00000000-0000-0000-0000-000000000001', 'El Guardian del Templo', 'Un golem de piedra ancestral protege la entrada del templo perdido', 'hard', '1 Golem de Piedra', '14 Oct 2025');