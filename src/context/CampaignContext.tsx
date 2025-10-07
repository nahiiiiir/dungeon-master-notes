import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  addCampaign: (campaign: Campaign) => Promise<void>;
  addPlayer: (player: Player) => Promise<void>;
  addEncounter: (encounter: Encounter) => Promise<void>;
  updatePlayer: (playerId: string, updatedPlayer: Partial<Player>) => Promise<void>;
  updateEncounter: (encounterId: string, updatedEncounter: Partial<Encounter>) => Promise<void>;
  getPlayersByCampaign: (campaignId: string) => Player[];
  getEncountersByCampaign: (campaignId: string) => Encounter[];
  loading: boolean;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch campaigns
  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al cargar campañas",
        description: error.message,
      });
      return;
    }

    if (data) {
      setCampaigns(
        data.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description || "",
          lastSession: c.last_session || "",
          status: c.status as "active" | "paused" | "completed",
        }))
      );
    }
  };

  // Fetch players
  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al cargar jugadores",
        description: error.message,
      });
      return;
    }

    if (data) {
      setPlayers(
        data.map((p) => ({
          id: p.id,
          campaignId: p.campaign_id,
          playerName: p.player_name,
          characterName: p.character_name,
          race: p.race,
          class: p.class,
          level: p.level,
        }))
      );
    }
  };

  // Fetch encounters
  const fetchEncounters = async () => {
    const { data, error } = await supabase
      .from("encounters")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al cargar encuentros",
        description: error.message,
      });
      return;
    }

    if (data) {
      setEncounters(
        data.map((e) => ({
          id: e.id,
          campaignId: e.campaign_id,
          title: e.title,
          description: e.description || "",
          difficulty: e.difficulty,
          enemies: e.enemies,
          date: e.date || "",
        }))
      );
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCampaigns(), fetchPlayers(), fetchEncounters()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const addCampaign = async (campaign: Campaign) => {
    const { error } = await supabase.from("campaigns").insert({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      last_session: campaign.lastSession,
      status: campaign.status,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al crear campaña",
        description: error.message,
      });
      return;
    }

    await fetchCampaigns();
  };

  const addPlayer = async (player: Player) => {
    const { error } = await supabase.from("players").insert({
      id: player.id,
      campaign_id: player.campaignId,
      player_name: player.playerName,
      character_name: player.characterName,
      race: player.race,
      class: player.class,
      level: player.level,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al crear jugador",
        description: error.message,
      });
      return;
    }

    await fetchPlayers();
  };

  const addEncounter = async (encounter: Encounter) => {
    const { error } = await supabase.from("encounters").insert({
      id: encounter.id,
      campaign_id: encounter.campaignId,
      title: encounter.title,
      description: encounter.description,
      difficulty: encounter.difficulty,
      enemies: encounter.enemies,
      date: encounter.date,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al crear encuentro",
        description: error.message,
      });
      return;
    }

    await fetchEncounters();
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
        variant: "destructive",
        title: "Error al actualizar jugador",
        description: error.message,
      });
      return;
    }

    await fetchPlayers();
  };

  const updateEncounter = async (encounterId: string, updatedEncounter: Partial<Encounter>) => {
    const updateData: any = {};
    if (updatedEncounter.title) updateData.title = updatedEncounter.title;
    if (updatedEncounter.description) updateData.description = updatedEncounter.description;
    if (updatedEncounter.difficulty) updateData.difficulty = updatedEncounter.difficulty;
    if (updatedEncounter.enemies) updateData.enemies = updatedEncounter.enemies;
    if (updatedEncounter.date) updateData.date = updatedEncounter.date;

    const { error } = await supabase
      .from("encounters")
      .update(updateData)
      .eq("id", encounterId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al actualizar encuentro",
        description: error.message,
      });
      return;
    }

    await fetchEncounters();
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
        loading,
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
