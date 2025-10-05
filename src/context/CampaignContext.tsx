import { createContext, useContext, useState, ReactNode } from "react";

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
  addCampaign: (campaign: Campaign) => void;
  addPlayer: (player: Player) => void;
  addEncounter: (encounter: Encounter) => void;
  updatePlayer: (playerId: string, updatedPlayer: Partial<Player>) => void;
  updateEncounter: (encounterId: string, updatedEncounter: Partial<Encounter>) => void;
  getPlayersByCampaign: (campaignId: string) => Player[];
  getEncountersByCampaign: (campaignId: string) => Encounter[];
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      title: "La Maldición del Dragón Carmesí",
      description: "Los héroes deben detener al antiguo dragón rojo antes de que destruya el reino de Valoria",
      lastSession: "15 Oct 2025",
      status: "active",
    },
    {
      id: "2",
      title: "Las Catacumbas Olvidadas",
      description: "Una exploración de mazmorras ancestrales llenas de tesoros y peligros mortales",
      lastSession: "8 Oct 2025",
      status: "active",
    },
  ]);

  const [players, setPlayers] = useState<Player[]>([
    {
      id: "1",
      campaignId: "1",
      playerName: "María García",
      characterName: "Elara Luzdestrella",
      race: "Elfa",
      class: "Maga",
      level: 5,
    },
    {
      id: "2",
      campaignId: "1",
      playerName: "Carlos Ruiz",
      characterName: "Thorin Martillo de Guerra",
      race: "Enano",
      class: "Guerrero",
      level: 5,
    },
  ]);

  const [encounters, setEncounters] = useState<Encounter[]>([
    {
      id: "1",
      campaignId: "1",
      title: "Emboscada de Goblins",
      description: "Los héroes fueron emboscados por un grupo de goblins mientras viajaban por el bosque oscuro",
      difficulty: "easy",
      enemies: "6 Goblins, 1 Hobgoblin",
      date: "12 Oct 2025",
    },
    {
      id: "2",
      campaignId: "1",
      title: "El Guardian del Templo",
      description: "Un golem de piedra ancestral protege la entrada del templo perdido",
      difficulty: "hard",
      enemies: "1 Golem de Piedra",
      date: "14 Oct 2025",
    },
  ]);

  const addCampaign = (campaign: Campaign) => {
    setCampaigns([campaign, ...campaigns]);
  };

  const addPlayer = (player: Player) => {
    setPlayers([...players, player]);
  };

  const addEncounter = (encounter: Encounter) => {
    setEncounters([encounter, ...encounters]);
  };

  const updatePlayer = (playerId: string, updatedPlayer: Partial<Player>) => {
    setPlayers(players.map(p => p.id === playerId ? { ...p, ...updatedPlayer } : p));
  };

  const updateEncounter = (encounterId: string, updatedEncounter: Partial<Encounter>) => {
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
