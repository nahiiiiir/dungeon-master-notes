import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreateEncounterDialog } from "@/components/CreateEncounterDialog";
import { CreatePlayerDialog } from "@/components/CreatePlayerDialog";
import { EditCampaignDialog } from "@/components/EditCampaignDialog";
import { EncounterCard } from "@/components/EncounterCard";
import { PlayerCard } from "@/components/PlayerCard";
import { DmAssistantChat } from "@/components/DmAssistantChat";
import { ArrowLeft, Users, Calendar, Scroll, Sparkles, Swords, Brain, Map, BookOpen } from "lucide-react";
import { MapCard } from "@/components/MapCard";
import { SessionCard } from "@/components/SessionCard";
import { CreateSessionDialog } from "@/components/CreateSessionDialog";
import { UploadMapDialog } from "@/components/UploadMapDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCampaignContext } from "@/context/CampaignContext";
import { toast } from "sonner";

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


const CampaignDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    campaigns, 
    getPlayersByCampaign, 
    getEncountersByCampaign,
    getMapsByCampaign,
    getSessionsByCampaign,
    addPlayer,
    addEncounter,
    addMap,
    addSession,
    updateCampaign,
    updatePlayer,
    updateEncounter,
    updateSession,
    deleteMap
  } = useCampaignContext();
  
  const campaign = campaigns.find(c => c.id === id);
  const players = id ? getPlayersByCampaign(id) : [];
  const encounters = id ? getEncountersByCampaign(id) : [];
  const campaignMaps = id ? getMapsByCampaign(id) : [];
  const sessions = id ? getSessionsByCampaign(id) : [];

  const [editingEncounter, setEditingEncounter] = useState<any>(null);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleTabChange = (value: string) => {
    // Limpiar estados de edición al cambiar de pestaña
    setEditingEncounter(null);
    setEditingPlayer(null);
    setEditingSession(null);
  };

interface Enemy {
  name: string;
  hp: number | null;
  ac: number | null;
  details: string;
}

  const handleCreateEncounter = async (newEncounter: {
    title: string;
    description: string;
    difficulty: string;
    enemies: Enemy[];
    completed: boolean;
    notes: string;
  }) => {
    if (!id) return;
    
    const encounter = {
      campaignId: id,
      ...newEncounter,
      date: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    
    const success = await addEncounter(encounter);
    
    if (success) {
      toast.success("¡Encuentro registrado exitosamente!");
    }
  };

  const handleCreatePlayer = async (newPlayer: {
    playerName: string;
    characterName: string;
    race: string;
    class: string;
    level: number;
  }) => {
    if (!id) return;
    
    const player = {
      campaignId: id,
      ...newPlayer,
    };
    
    const success = await addPlayer(player);
    
    if (success) {
      toast.success("¡Jugador registrado exitosamente!");
    }
  };

  const handleUpdateEncounter = (encounterId: string, updatedData: {
    title: string;
    description: string;
    difficulty: string;
    enemies: Enemy[];
    completed: boolean;
    notes: string;
  }) => {
    updateEncounter(encounterId, updatedData);
    setEditingEncounter(null);
    toast.success("¡Encuentro actualizado exitosamente!");
  };

  const handleUpdatePlayer = (playerId: string, updatedData: {
    playerName: string;
    characterName: string;
    race: string;
    class: string;
    level: number;
  }) => {
    updatePlayer(playerId, updatedData);
    setEditingPlayer(null);
    toast.success("¡Jugador actualizado exitosamente!");
  };

  const handleUpdateCampaign = (campaignId: string, updatedData: { title: string; description: string }) => {
    updateCampaign(campaignId, updatedData);
    toast.success("¡Campaña actualizada exitosamente!");
  };

  const handleUploadMap = async (data: { title: string; description: string; file: File }) => {
    if (!id || !user) return;

    try {
      // Upload file to storage
      const fileExt = data.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('campaign-maps')
        .upload(fileName, data.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('campaign-maps')
        .getPublicUrl(fileName);

      // Save to database
      const success = await addMap({
        campaignId: id,
        title: data.title,
        description: data.description,
        fileUrl: publicUrl,
        fileType: data.file.type,
        fileSize: data.file.size,
      });

      if (success) {
        toast.success("¡Mapa subido exitosamente!");
      }
    } catch (error) {
      toast.error("Error al subir el mapa");
      console.error(error);
    }
  };

  const handleCreateSession = async (sessionData: {
    title: string;
    notes: string;
    encounter_ids: string[];
    completed: boolean;
    encounterNotes?: { [key: string]: string };
    session_date?: Date;
  }) => {
    if (!id) return;
    
    const session = {
      campaignId: id,
      title: sessionData.title,
      notes: sessionData.notes,
      encounterIds: sessionData.encounter_ids,
      completed: sessionData.completed,
      sessionDate: sessionData.session_date,
    };
    
    const success = await addSession(session);
    
    if (success) {
      // Si la sesión está completada, marcar los encuentros como completados y actualizar sus notas
      if (sessionData.completed && sessionData.encounter_ids.length > 0) {
        for (const encounterId of sessionData.encounter_ids) {
          const encounterToUpdate = encounters.find(e => e.id === encounterId);
          if (encounterToUpdate) {
            await updateEncounter(encounterId, {
              title: encounterToUpdate.title,
              description: encounterToUpdate.description,
              difficulty: encounterToUpdate.difficulty,
              enemies: encounterToUpdate.enemies,
              completed: true,
              notes: sessionData.encounterNotes?.[encounterId] || encounterToUpdate.notes || ""
            });
          }
        }
      }
      toast.success("¡Sesión registrada exitosamente!");
    }
  };

  const handleUpdateSession = async (sessionId: string, sessionData: {
    title: string;
    notes: string;
    encounter_ids: string[];
    completed: boolean;
    encounterNotes?: { [key: string]: string };
    session_date?: Date;
  }) => {
    updateSession(sessionId, {
      title: sessionData.title,
      notes: sessionData.notes,
      encounterIds: sessionData.encounter_ids,
      completed: sessionData.completed,
      sessionDate: sessionData.session_date,
    });
    
    // Si la sesión se marca como completada, actualizar los encuentros
    if (sessionData.completed && sessionData.encounter_ids.length > 0) {
      for (const encounterId of sessionData.encounter_ids) {
        const encounterToUpdate = encounters.find(e => e.id === encounterId);
        if (encounterToUpdate) {
          await updateEncounter(encounterId, {
            title: encounterToUpdate.title,
            description: encounterToUpdate.description,
            difficulty: encounterToUpdate.difficulty,
            enemies: encounterToUpdate.enemies,
            completed: true,
            notes: sessionData.encounterNotes?.[encounterId] || encounterToUpdate.notes || ""
          });
        }
      }
    }
    
    setEditingSession(null);
    toast.success("¡Sesión actualizada exitosamente!");
  };

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
                <EditCampaignDialog 
                  campaign={campaign} 
                  onUpdate={handleUpdateCampaign}
                />
              </div>
              <p className="text-muted-foreground">{campaign.description}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{players.length} {players.length === 1 ? 'jugador' : 'jugadores'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Swords className="h-4 w-4" />
              <span>{encounters.length} {encounters.length === 1 ? 'encuentro' : 'encuentros'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              <span>{campaignMaps.length} {campaignMaps.length === 1 ? 'mapa' : 'mapas'}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'}</span>
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
        <Tabs defaultValue="sessions" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full max-w-3xl grid-cols-4 mb-8">
            <TabsTrigger value="sessions" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Sesiones
            </TabsTrigger>
            <TabsTrigger value="encounters" className="gap-2">
              <Swords className="h-4 w-4" />
              Encuentros
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-2">
              <Users className="h-4 w-4" />
              Jugadores
            </TabsTrigger>
            <TabsTrigger value="maps" className="gap-2">
              <Map className="h-4 w-4" />
              Mapas
            </TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  Sesiones de la Campaña
                </h2>
              </div>
              <Button onClick={() => setEditingSession('new')}>
                Crear sesión
              </Button>
            </div>

            <CreateSessionDialog 
              open={editingSession === 'new'}
              onOpenChange={(open) => !open && setEditingSession(null)}
              onSubmit={handleCreateSession}
              editingSession={null}
              encounters={encounters}
            />
            
            {editingSession && editingSession !== 'new' && (
              <CreateSessionDialog 
                open={true}
                onOpenChange={(open) => !open && setEditingSession(null)}
                onSubmit={(data) => handleUpdateSession(editingSession.id, data)}
                editingSession={editingSession}
                encounters={encounters}
              />
            )}

            {sessions.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-lg border border-border shadow-lg">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-xl text-muted-foreground mb-6">
                  No hay sesiones registradas aún
                </p>
                <Button onClick={() => setEditingSession('new')}>
                  Crear sesión
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                  <SessionCard 
                    key={session.id} 
                    session={session} 
                    encounters={encounters}
                    onEdit={setEditingSession}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Encounters Tab */}
          <TabsContent value="encounters">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  Encuentros Registrados
                </h2>
              </div>
              <CreateEncounterDialog 
                onCreateEncounter={handleCreateEncounter}
                editingEncounter={editingEncounter}
                onUpdateEncounter={handleUpdateEncounter}
              />
            </div>

            {encounters.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-lg border border-border shadow-lg">
                <Scroll className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-xl text-muted-foreground mb-6">
                  No hay encuentros registrados aún
                </p>
                <CreateEncounterDialog 
                  onCreateEncounter={handleCreateEncounter}
                  editingEncounter={editingEncounter}
                  onUpdateEncounter={handleUpdateEncounter}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {encounters.map((encounter) => (
                  <EncounterCard 
                    key={encounter.id} 
                    encounter={encounter} 
                    onEdit={setEditingEncounter}
                  />
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
              <CreatePlayerDialog 
                onCreatePlayer={handleCreatePlayer}
                editingPlayer={editingPlayer}
                onUpdatePlayer={handleUpdatePlayer}
              />
            </div>

            {players.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-lg border border-border shadow-lg">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-xl text-muted-foreground mb-6">
                  No hay jugadores registrados aún
                </p>
                <CreatePlayerDialog 
                  onCreatePlayer={handleCreatePlayer}
                  editingPlayer={editingPlayer}
                  onUpdatePlayer={handleUpdatePlayer}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {players.map((player) => (
                  <PlayerCard 
                    key={player.id} 
                    player={player} 
                    onEdit={setEditingPlayer}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Maps Tab */}
          <TabsContent value="maps">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Map className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  Mapas de la Campaña
                </h2>
              </div>
              <UploadMapDialog onUpload={handleUploadMap} />
            </div>

            {campaignMaps.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-lg border border-border shadow-lg">
                <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-xl text-muted-foreground mb-6">
                  No hay mapas registrados aún
                </p>
                <UploadMapDialog onUpload={handleUploadMap} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaignMaps.map((map) => (
                  <MapCard 
                    key={map.id} 
                    map={map} 
                    onDelete={deleteMap}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating AI Assistant Button */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-50 
                   w-14 h-14 rounded-full 
                   bg-primary text-primary-foreground 
                   shadow-lg hover:shadow-xl hover:scale-110 
                   transition-all duration-200
                   flex items-center justify-center"
        aria-label="Abrir Asistente del DM"
      >
        <Brain className="h-6 w-6" />
      </button>

      {/* AI Assistant Chat */}
      <DmAssistantChat
        campaignId={id!}
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
};

export default CampaignDetails;
