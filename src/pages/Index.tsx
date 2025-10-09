import { useNavigate } from "react-router-dom";
import { CampaignCard } from "@/components/CampaignCard";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { Scroll, Sparkles, LogOut, User } from "lucide-react";
import heroImage from "@/assets/hero-dnd.jpg";
import { useCampaignContext } from "@/context/CampaignContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { campaigns, addCampaign, getPlayersByCampaign, getEncountersByCampaign } = useCampaignContext();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
    toast.success("Sesión cerrada exitosamente");
  };

  const handleCreateCampaign = async (newCampaign: {
    title: string;
    description: string;
  }) => {
    const campaign = {
      title: newCampaign.title,
      description: newCampaign.description,
      lastSession: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: "active" as const,
    };
    
    const success = await addCampaign(campaign);
    
    if (success) {
      toast.success("¡Campaña creada exitosamente!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scroll className="h-5 w-5 text-accent" />
            <span className="font-serif font-bold text-lg">D&D Campaign Manager</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
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
                playersCount={getPlayersByCampaign(campaign.id).length}
                encountersCount={getEncountersByCampaign(campaign.id).length}
                onClick={() => navigate(`/campaign/${campaign.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
