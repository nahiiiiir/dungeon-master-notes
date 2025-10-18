import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Session {
  id: string;
  title: string;
  notes: string | null;
  encounterIds: string[];
  completed: boolean;
}

interface Encounter {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
}

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (sessionData: {
    title: string;
    notes: string;
    encounter_ids: string[];
    completed: boolean;
    encounterNotes?: { [key: string]: string };
  }) => void;
  editingSession?: Session | null;
  encounters: Encounter[];
}

export const CreateSessionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editingSession,
  encounters
}: CreateSessionDialogProps) => {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedEncounters, setSelectedEncounters] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [encounterNotes, setEncounterNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingSession) {
      setTitle(editingSession.title);
      setNotes(editingSession.notes || "");
      setSelectedEncounters(editingSession.encounterIds || []);
      setCompleted(editingSession.completed);
      
      // Inicializar las notas de encuentros si ya existen
      const initialNotes: { [key: string]: string } = {};
      editingSession.encounterIds?.forEach(id => {
        const encounter = encounters.find(e => e.id === id);
        if (encounter?.notes) {
          initialNotes[id] = encounter.notes;
        }
      });
      setEncounterNotes(initialNotes);
    } else {
      setTitle("");
      setNotes("");
      setSelectedEncounters([]);
      setCompleted(false);
      setEncounterNotes({});
    }
  }, [editingSession, open, encounters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      notes: notes.trim(),
      encounter_ids: selectedEncounters,
      completed,
      encounterNotes: completed ? encounterNotes : undefined
    });

    setTitle("");
    setNotes("");
    setSelectedEncounters([]);
    setCompleted(false);
    setEncounterNotes({});
  };

  const handleEncounterToggle = (encounterId: string) => {
    setSelectedEncounters(prev =>
      prev.includes(encounterId)
        ? prev.filter(id => id !== encounterId)
        : [...prev, encounterId]
    );
  };

  const availableEncounters = encounters.filter(e => !e.completed);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {editingSession ? "Editar sesión" : "Crear nueva sesión"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-1">
            <form onSubmit={handleSubmit} className="space-y-4 pr-4">
              <div className="space-y-2">
                <Label htmlFor="title">Sesión *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Sesión 1: el primer contacto entre los aventureros"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Escribe la historia de la sesión..."
                  className="min-h-[120px]"
                />
              </div>

              {availableEncounters.length > 0 && (
                <div className="space-y-2">
                  <Label>Encuentros</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                    {availableEncounters.map((encounter) => (
                      <div key={encounter.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={encounter.id}
                          checked={selectedEncounters.includes(encounter.id)}
                          onCheckedChange={() => handleEncounterToggle(encounter.id)}
                        />
                        <Label
                          htmlFor={encounter.id}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {encounter.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="completed"
                  checked={completed}
                  onCheckedChange={(checked) => setCompleted(checked as boolean)}
                />
                <Label htmlFor="completed" className="cursor-pointer">
                  Marcar como completada
                </Label>
              </div>

              {completed && selectedEncounters.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-base">Comentarios y Conclusión por Encuentro</Label>
                  {selectedEncounters.map((encounterId) => {
                    const encounter = encounters.find(e => e.id === encounterId);
                    if (!encounter) return null;
                    
                    return (
                      <div key={encounterId} className="space-y-2">
                        <Label htmlFor={`notes-${encounterId}`} className="text-sm font-normal">
                          {encounter.title}
                        </Label>
                        <Textarea
                          id={`notes-${encounterId}`}
                          value={encounterNotes[encounterId] || ""}
                          onChange={(e) => setEncounterNotes(prev => ({
                            ...prev,
                            [encounterId]: e.target.value
                          }))}
                          placeholder="Escribe el resultado y conclusiones del encuentro..."
                          className="min-h-[80px]"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </form>
          </ScrollArea>
        </div>
        <DialogFooter className="flex-shrink-0 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {editingSession ? "Actualizar sesión" : "Crear sesión"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
