import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreateEncounterDialog } from "@/components/CreateEncounterDialog";
import { CreatePlayerDialog } from "@/components/CreatePlayerDialog";
import { EncounterCard } from "@/components/EncounterCard";
import { PlayerCard } from "@/components/PlayerCard";
import { ArrowLeft, Users, Calendar, Scroll, Sparkles, Swords } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Player {
  id: string;
  playerName: string;
  characterName: string;
  race: string;
  class: string;
  level: number;
}

interface Encounter {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  enemies: string;
  date: string;
}

const statusColors = {
  active: "bg-primary text-primary-foreground",
  paused: "bg-muted text-muted-foreground",
  completed: "bg-secondary text-secondary-foreground",
};

const statusLabels = {
  active: "Activa",
  paused: "En pausa",
  completed: "Completada",
};

// Datos de ejemplo - en producción vendrían de un estado global o base de datos
const campaignsData = {
  "1": {
    title: "La Maldición del Dragón Carmesí",
    description: "Los héroes deben detener al antiguo dragón rojo antes de que destruya el reino de Valoria",
    players: 5,
    sessions: 12,
    lastSession: "15 Oct 2025",
    status: "active" as const,
  },
  "2": {
    title: "Las Catacumbas Olvidadas",
    description: "Una exploración de mazmorras ancestrales llenas de tesoros y peligros mortales",
    players: 4,
    sessions: 8,
    lastSession: "8 Oct 2025",
    status: "active" as const,
  },
};

const CampaignDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const campaign = id ? campaignsData[id as keyof typeof campaignsData] : null;

  const [encounters, setEncounters] = useState<Encounter[]>([
    {
      id: "1",
      title: "Emboscada de Goblins",
      description: "Los héroes fueron emboscados por un grupo de goblins mientras viajaban por el bosque oscuro",
      difficulty: "easy",
      enemies: "6 Goblins, 1 Hobgoblin",
      date: "12 Oct 2025",
    },
    {
      id: "2",
      title: "El Guardian del Templo",
      description: "Un golem de piedra ancestral protege la entrada del templo perdido",
      difficulty: "hard",
      enemies: "1 Golem de Piedra",
      date: "14 Oct 2025",
    },
  ]);

  const [players, setPlayers] = useState<Player[]>([
    {
      id: "1",
      playerName: "María García",
      characterName: "Elara Luzdestrella",
      race: "Elfa",
      class: "Maga",
      level: 5,
    },
    {
      id: "2",
      playerName: "Carlos Ruiz",
      characterName: "Thorin Martillo de Guerra",
      race: "Enano",
      class: "Guerrero",
      level: 5,
    },
  ]);

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">Campaña no encontrada</h1>
          <Button onClick={() => navigate("/")} variant="default">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const handleCreateEncounter = (newEncounter: {
    title: string;
    description: string;
    difficulty: string;
    enemies: string;
  }) => {
    const encounter: Encounter = {
      id: Date.now().toString(),
      ...newEncounter,
      date: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    setEncounters([encounter, ...encounters]);
  };

  const handleCreatePlayer = (newPlayer: {
    playerName: string;
    characterName: string;
    race: string;
    class: string;
    level: number;
  }) => {
    const player: Player = {
      id: Date.now().toString(),
      ...newPlayer,
    };
    setPlayers([...players, player]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                  {campaign.title}
                </h1>
                <Badge className={statusColors[campaign.status]}>
                  {statusLabels[campaign.status]}
                </Badge>
              </div>
              <p className="text-muted-foreground">{campaign.description}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{campaign.players} jugadores</span>
            </div>
            <div className="flex items-center gap-1">
              <Scroll className="h-4 w-4" />
              <span>{campaign.sessions} sesiones</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Última sesión: {campaign.lastSession}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="encounters" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="encounters" className="gap-2">
              <Swords className="h-4 w-4" />
              Encuentros
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-2">
              <Users className="h-4 w-4" />
              Jugadores
            </TabsTrigger>
          </TabsList>

          {/* Encounters Tab */}
          <TabsContent value="encounters">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  Encuentros Registrados
                </h2>
              </div>
              <CreateEncounterDialog onCreateEncounter={handleCreateEncounter} />
            </div>

            {encounters.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-lg border border-border shadow-lg">
                <Scroll className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-xl text-muted-foreground mb-6">
                  No hay encuentros registrados aún
                </p>
                <CreateEncounterDialog onCreateEncounter={handleCreateEncounter} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {encounters.map((encounter) => (
                  <EncounterCard key={encounter.id} encounter={encounter} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  Jugadores de la Campaña
                </h2>
              </div>
              <CreatePlayerDialog onCreatePlayer={handleCreatePlayer} />
            </div>

            {players.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-lg border border-border shadow-lg">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-xl text-muted-foreground mb-6">
                  No hay jugadores registrados aún
                </p>
                <CreatePlayerDialog onCreatePlayer={handleCreatePlayer} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {players.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CampaignDetails;
