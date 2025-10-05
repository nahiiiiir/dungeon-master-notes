import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Swords } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: "active" | "paused" | "completed";
  lastSession: string;
}

interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
  playersCount: number;
  encountersCount: number;
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

export const CampaignCard = ({ campaign, onClick, playersCount, encountersCount }: CampaignCardProps) => {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-[var(--shadow-mystical)] hover:-translate-y-1 bg-gradient-to-b from-card to-card/95 border-border/50"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl font-serif">{campaign.title}</CardTitle>
          <Badge className={statusColors[campaign.status]}>
            {statusLabels[campaign.status]}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{playersCount} {playersCount === 1 ? 'jugador' : 'jugadores'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Swords className="h-4 w-4" />
            <span>{encountersCount} {encountersCount === 1 ? 'encuentro' : 'encuentros'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{campaign.lastSession}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
