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
}

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (sessionData: {
    title: string;
    notes: string;
    encounter_ids: string[];
    completed: boolean;
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

  useEffect(() => {
    if (editingSession) {
      setTitle(editingSession.title);
      setNotes(editingSession.notes || "");
      setSelectedEncounters(editingSession.encounterIds || []);
      setCompleted(editingSession.completed);
    } else {
      setTitle("");
      setNotes("");
      setSelectedEncounters([]);
      setCompleted(false);
    }
  }, [editingSession, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      notes: notes.trim(),
      encounter_ids: selectedEncounters,
      completed
    });

    setTitle("");
    setNotes("");
    setSelectedEncounters([]);
    setCompleted(false);
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
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingSession ? "Editar sesión" : "Crear nueva sesión"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
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
          </form>
        </ScrollArea>
        <DialogFooter>
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
