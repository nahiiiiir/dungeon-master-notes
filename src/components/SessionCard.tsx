import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface Session {
  id: string;
  title: string;
  notes: string | null;
  encounterIds: string[];
  completed: boolean;
}

interface SessionCardProps {
  session: Session;
  encounters: Array<{ id: string; title: string }>;
  onEdit: (session: Session) => void;
}

export const SessionCard = ({ session, encounters, onEdit }: SessionCardProps) => {
  const sessionEncounters = encounters.filter(e => 
    session.encounterIds.includes(e.id)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{session.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={session.completed ? "default" : "secondary"}>
            {session.completed ? "Completada" : "Pendiente"}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(session)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.notes && (
          <div>
            <h4 className="text-sm font-semibold mb-1">Notas:</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {session.notes}
            </p>
          </div>
        )}
        
        {sessionEncounters.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Encuentros:</h4>
            <div className="flex flex-wrap gap-2">
              {sessionEncounters.map((encounter) => (
                <Badge key={encounter.id} variant="outline">
                  {encounter.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
