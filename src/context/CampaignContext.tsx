import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";

export interface Player {
  id: string;
  campaignId: string;
  playerName: string;
  characterName: string;
  race: string;
  class: string;
  level: number;
}

export interface Encounter {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  difficulty: string;
  enemies: string;
  date: string;
  completed: boolean;
  notes: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  lastSession: string;
  status: "active" | "paused" | "completed";
}

interface CampaignContextType {
  campaigns: Campaign[];
  players: Player[];
  encounters: Encounter[];
  addCampaign: (campaign: Omit<Campaign, 'id'>) => Promise<boolean>;
  addPlayer: (player: Omit<Player, 'id'>) => Promise<boolean>;
  addEncounter: (encounter: Omit<Encounter, 'id'>) => Promise<boolean>;
  updatePlayer: (playerId: string, updatedPlayer: Partial<Player>) => void;
  updateEncounter: (encounterId: string, updatedEncounter: Partial<Encounter>) => void;
  getPlayersByCampaign: (campaignId: string) => Player[];
  getEncountersByCampaign: (campaignId: string) => Encounter[];
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);

  // Load campaigns from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las campañas",
          variant: "destructive",
        });
        return;
      }

      setCampaigns(data.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description || "",
        lastSession: c.last_session || "",
        status: c.status as "active" | "paused" | "completed",
      })));
    };

    fetchCampaigns();
  }, [toast, user]);

  // Load players from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*");

      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los jugadores",
          variant: "destructive",
        });
        return;
      }

      setPlayers(data.map(p => ({
        id: p.id,
        campaignId: p.campaign_id,
        playerName: p.player_name,
        characterName: p.character_name,
        race: p.race,
        class: p.class,
        level: p.level,
      })));
    };

    fetchPlayers();
  }, [toast, user]);

  // Load encounters from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchEncounters = async () => {
      const { data, error } = await supabase
        .from("encounters")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los encuentros",
          variant: "destructive",
        });
        return;
      }

      setEncounters(data.map(e => ({
        id: e.id,
        campaignId: e.campaign_id,
        title: e.title,
        description: e.description || "",
        difficulty: e.difficulty,
        enemies: e.enemies,
        date: e.date || "",
        completed: (e as any).completed || false,
        notes: (e as any).notes || "",
      })));
    };

    fetchEncounters();
  }, [toast, user]);

  const addCampaign = async (campaign: Omit<Campaign, 'id'>) => {
    if (!user) return false;

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        title: campaign.title,
        description: campaign.description,
        last_session: campaign.lastSession,
        status: campaign.status,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la campaña",
        variant: "destructive",
      });
      return false;
    }

    setCampaigns([{
      id: data.id,
      title: data.title,
      description: data.description || "",
      lastSession: data.last_session || "",
      status: data.status as "active" | "paused" | "completed",
    }, ...campaigns]);
    
    return true;
  };

  const addPlayer = async (player: Omit<Player, 'id'>) => {
    if (!user) return false;

    const { data, error } = await supabase
      .from("players")
      .insert({
        campaign_id: player.campaignId,
        player_name: player.playerName,
        character_name: player.characterName,
        race: player.race,
        class: player.class,
        level: player.level,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el jugador",
        variant: "destructive",
      });
      return false;
    }

    setPlayers([{
      id: data.id,
      campaignId: data.campaign_id,
      playerName: data.player_name,
      characterName: data.character_name,
      race: data.race,
      class: data.class,
      level: data.level,
    }, ...players]);
    
    return true;
  };

  const addEncounter = async (encounter: Omit<Encounter, 'id'>) => {
    if (!user) return false;

    const { data, error } = await supabase
      .from("encounters")
      .insert({
        campaign_id: encounter.campaignId,
        title: encounter.title,
        description: encounter.description,
        difficulty: encounter.difficulty,
        enemies: encounter.enemies,
        date: encounter.date,
        completed: encounter.completed || false,
        notes: encounter.notes || "",
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el encuentro",
        variant: "destructive",
      });
      return false;
    }

    setEncounters([{
      id: data.id,
      campaignId: data.campaign_id,
      title: data.title,
      description: data.description || "",
      difficulty: data.difficulty,
      enemies: data.enemies,
      date: data.date || "",
      completed: (data as any).completed || false,
      notes: (data as any).notes || "",
    }, ...encounters]);
    
    return true;
  };

  const updatePlayer = async (playerId: string, updatedPlayer: Partial<Player>) => {
    const updateData: any = {};
    if (updatedPlayer.playerName) updateData.player_name = updatedPlayer.playerName;
    if (updatedPlayer.characterName) updateData.character_name = updatedPlayer.characterName;
    if (updatedPlayer.race) updateData.race = updatedPlayer.race;
    if (updatedPlayer.class) updateData.class = updatedPlayer.class;
    if (updatedPlayer.level !== undefined) updateData.level = updatedPlayer.level;

    const { error } = await supabase
      .from("players")
      .update(updateData)
      .eq("id", playerId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el jugador",
        variant: "destructive",
      });
      return;
    }

    setPlayers(players.map(p => p.id === playerId ? { ...p, ...updatedPlayer } : p));
  };

  const updateEncounter = async (encounterId: string, updatedEncounter: Partial<Encounter>) => {
    const updateData: any = {};
    if (updatedEncounter.title) updateData.title = updatedEncounter.title;
    if (updatedEncounter.description) updateData.description = updatedEncounter.description;
    if (updatedEncounter.difficulty) updateData.difficulty = updatedEncounter.difficulty;
    if (updatedEncounter.enemies) updateData.enemies = updatedEncounter.enemies;
    if (updatedEncounter.date) updateData.date = updatedEncounter.date;
    if (updatedEncounter.completed !== undefined) updateData.completed = updatedEncounter.completed;
    if (updatedEncounter.notes !== undefined) updateData.notes = updatedEncounter.notes;

    const { error } = await supabase
      .from("encounters")
      .update(updateData)
      .eq("id", encounterId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el encuentro",
        variant: "destructive",
      });
      return;
    }

    setEncounters(encounters.map(e => e.id === encounterId ? { ...e, ...updatedEncounter } : e));
  };

  const getPlayersByCampaign = (campaignId: string) => {
    return players.filter(p => p.campaignId === campaignId);
  };

  const getEncountersByCampaign = (campaignId: string) => {
    return encounters.filter(e => e.campaignId === campaignId);
  };

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        players,
        encounters,
        addCampaign,
        addPlayer,
        addEncounter,
        updatePlayer,
        updateEncounter,
        getPlayersByCampaign,
        getEncountersByCampaign,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaignContext = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error("useCampaignContext must be used within a CampaignProvider");
  }
  return context;
};
