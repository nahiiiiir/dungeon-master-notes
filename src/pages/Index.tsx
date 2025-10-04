import { useState } from "react";
import { CampaignCard } from "@/components/CampaignCard";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { Scroll, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-dnd.jpg";

interface Campaign {
  id: string;
  title: string;
  description: string;
  players: number;
  sessions: number;
  lastSession: string;
  status: "active" | "paused" | "completed";
}

const Index = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      title: "La Maldición del Dragón Carmesí",
      description: "Los héroes deben detener al antiguo dragón rojo antes de que destruya el reino de Valoria",
      players: 5,
      sessions: 12,
      lastSession: "15 Oct 2025",
      status: "active",
    },
    {
      id: "2",
      title: "Las Catacumbas Olvidadas",
      description: "Una exploración de mazmorras ancestrales llenas de tesoros y peligros mortales",
      players: 4,
      sessions: 8,
      lastSession: "8 Oct 2025",
      status: "active",
    },
  ]);

  const handleCreateCampaign = (newCampaign: {
    title: string;
    description: string;
    players: number;
  }) => {
    const campaign: Campaign = {
      id: Date.now().toString(),
      ...newCampaign,
      sessions: 0,
      lastSession: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: "active",
    };
    setCampaigns([campaign, ...campaigns]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Scroll className="h-16 w-16 text-accent animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary-foreground mb-4 drop-shadow-2xl">
            Registro de Campañas D&D
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 drop-shadow-lg">
            Gestiona tus aventuras épicas como un verdadero Dungeon Master
          </p>
          <CreateCampaignDialog onCreateCampaign={handleCreateCampaign} />
        </div>
      </section>

      {/* Campaigns Section */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="h-6 w-6 text-accent" />
          <h2 className="text-3xl font-serif font-bold text-foreground">
            Mis Campañas
          </h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border shadow-lg">
            <Scroll className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-xl text-muted-foreground mb-6">
              No tienes campañas registradas aún
            </p>
            <CreateCampaignDialog onCreateCampaign={handleCreateCampaign} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onClick={() => console.log("Ver campaña:", campaign.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
