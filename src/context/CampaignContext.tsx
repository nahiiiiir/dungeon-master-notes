import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";

interface Enemy {
  name: string;
  hp: number | null;
  ac: number | null;
  details: string;
}

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
  enemies: Enemy[];
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

export interface CampaignMap {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
}

interface CampaignContextType {
  campaigns: Campaign[];
  players: Player[];
  encounters: Encounter[];
  maps: CampaignMap[];
  addCampaign: (campaign: Omit<Campaign, 'id'>) => Promise<boolean>;
  addPlayer: (player: Omit<Player, 'id'>) => Promise<boolean>;
  addEncounter: (encounter: Omit<Encounter, 'id'>) => Promise<boolean>;
  addMap: (map: Omit<CampaignMap, 'id'>) => Promise<boolean>;
  updateCampaign: (campaignId: string, updatedCampaign: Partial<Campaign>) => void;
  updatePlayer: (playerId: string, updatedPlayer: Partial<Player>) => void;
  updateEncounter: (encounterId: string, updatedEncounter: Partial<Encounter>) => void;
  deleteMap: (mapId: string) => void;
  getPlayersByCampaign: (campaignId: string) => Player[];
  getEncountersByCampaign: (campaignId: string) => Encounter[];
  getMapsByCampaign: (campaignId: string) => CampaignMap[];
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [maps, setMaps] = useState<CampaignMap[]>([]);

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
        enemies: Array.isArray(e.enemies) ? (e.enemies as unknown as Enemy[]) : [],
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
      .insert([{
        campaign_id: encounter.campaignId,
        title: encounter.title,
        description: encounter.description,
        difficulty: encounter.difficulty,
        enemies: encounter.enemies as any,
        date: encounter.date,
        completed: encounter.completed || false,
        notes: encounter.notes || "",
        user_id: user.id,
      }])
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
      enemies: Array.isArray(data.enemies) ? (data.enemies as unknown as Enemy[]) : [],
      date: data.date || "",
      completed: (data as any).completed || false,
      notes: (data as any).notes || "",
    }, ...encounters]);
    
    return true;
  };

  const updateCampaign = async (campaignId: string, updatedCampaign: Partial<Campaign>) => {
    const updateData: any = {};
    if (updatedCampaign.title) updateData.title = updatedCampaign.title;
    if (updatedCampaign.description !== undefined) updateData.description = updatedCampaign.description;

    const { error } = await supabase
      .from("campaigns")
      .update(updateData)
      .eq("id", campaignId);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la campaña",
        variant: "destructive",
      });
      return;
    }

    setCampaigns(campaigns.map(c => c.id === campaignId ? { ...c, ...updatedCampaign } : c));
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

  // Load maps from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchMaps = async () => {
      const { data, error } = await supabase
        .from("maps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los mapas",
          variant: "destructive",
        });
        return;
      }

      setMaps(data.map(m => ({
        id: m.id,
        campaignId: m.campaign_id,
        title: m.title,
        description: m.description || "",
        fileUrl: m.file_url,
        fileType: m.file_type,
        fileSize: m.file_size || undefined,
      })));
    };

    fetchMaps();
  }, [toast, user]);

  const addMap = async (map: Omit<CampaignMap, 'id'>) => {
    if (!user) return false;

    const { data, error } = await supabase
      .from("maps")
      .insert({
        campaign_id: map.campaignId,
        title: map.title,
        description: map.description,
        file_url: map.fileUrl,
        file_type: map.fileType,
        file_size: map.fileSize,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el mapa",
        variant: "destructive",
      });
      return false;
    }

    setMaps([{
      id: data.id,
      campaignId: data.campaign_id,
      title: data.title,
      description: data.description || "",
      fileUrl: data.file_url,
      fileType: data.file_type,
      fileSize: data.file_size || undefined,
    }, ...maps]);
    
    return true;
  };

  const deleteMap = (mapId: string) => {
    setMaps(maps.filter(m => m.id !== mapId));
  };

  const getMapsByCampaign = (campaignId: string) => {
    return maps.filter(m => m.campaignId === campaignId);
  };

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        players,
        encounters,
        maps,
        addCampaign,
        addPlayer,
        addEncounter,
        addMap,
        updateCampaign,
        updatePlayer,
        updateEncounter,
        deleteMap,
        getPlayersByCampaign,
        getEncountersByCampaign,
        getMapsByCampaign,
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
