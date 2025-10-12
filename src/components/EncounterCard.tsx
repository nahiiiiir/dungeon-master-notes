import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skull, Swords, Pencil, CheckCircle2, ScrollText } from "lucide-react";

interface Encounter {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  enemies: string;
  date: string;
  completed: boolean;
  notes: string;
}

interface EncounterCardProps {
  encounter: Encounter;
  onEdit: (encounter: Encounter) => void;
}

const difficultyColors = {
  easy: "bg-secondary text-secondary-foreground",
  medium: "bg-accent text-accent-foreground",
  hard: "bg-primary text-primary-foreground",
  deadly: "bg-destructive text-destructive-foreground",
};

const difficultyLabels = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
  deadly: "Mortal",
};

export const EncounterCard = ({ encounter, onEdit }: EncounterCardProps) => {
  return (
    <Card className="transition-all hover:shadow-lg bg-gradient-to-b from-card to-card/95 border-border/50">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-serif">{encounter.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={difficultyColors[encounter.difficulty as keyof typeof difficultyColors]}>
              {difficultyLabels[encounter.difficulty as keyof typeof difficultyLabels]}
            </Badge>
            {encounter.completed && (
              <Badge variant="outline" className="gap-1 bg-secondary/50 text-secondary-foreground border-secondary">
                <CheckCircle2 className="h-3 w-3" />
                Completado
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(encounter)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>{encounter.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <Skull className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Enemigos:</p>
            <p className="text-muted-foreground">{encounter.enemies}</p>
          </div>
        </div>
        
        {encounter.completed && encounter.notes && (
          <div className="flex items-start gap-2 text-sm pt-2 border-t border-border/50">
            <ScrollText className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">Resultado:</p>
              <p className="text-muted-foreground italic text-xs leading-relaxed">{encounter.notes}</p>
            </div>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">{encounter.date}</p>
      </CardContent>
    </Card>
  );
};
