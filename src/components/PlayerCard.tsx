import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Wand2 } from "lucide-react";

interface Player {
  id: string;
  playerName: string;
  characterName: string;
  race: string;
  class: string;
  level: number;
}

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard = ({ player }: PlayerCardProps) => {
  return (
    <Card className="transition-all hover:shadow-lg bg-gradient-to-b from-card to-card/95 border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div>
            <CardTitle className="text-lg font-serif text-foreground mb-1">
              {player.characterName}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{player.playerName}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg font-bold">
            Nv. {player.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">Raza:</span>
            <span className="text-muted-foreground">{player.race || "No especificada"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wand2 className="h-4 w-4 text-accent" />
            <span className="font-semibold text-foreground">Clase:</span>
            <span className="text-muted-foreground">{player.class || "No especificada"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
