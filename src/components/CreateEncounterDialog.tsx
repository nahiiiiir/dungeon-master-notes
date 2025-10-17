import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Swords } from "lucide-react";
import { toast } from "sonner";

interface Enemy {
  name: string;
  hp: number | null;
  ac: number | null;
  details: string;
}

interface CreateEncounterDialogProps {
  onCreateEncounter: (encounter: {
    title: string;
    description: string;
    difficulty: string;
    enemies: Enemy[];
    completed: boolean;
    notes: string;
  }) => void;
  editingEncounter?: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    enemies: Enemy[];
    completed: boolean;
    notes: string;
  } | null;
  onUpdateEncounter?: (id: string, encounter: {
    title: string;
    description: string;
    difficulty: string;
    enemies: Enemy[];
    completed: boolean;
    notes: string;
  }) => void;
}

export const CreateEncounterDialog = ({ 
  onCreateEncounter, 
  editingEncounter, 
  onUpdateEncounter 
}: CreateEncounterDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(editingEncounter?.title || "");
  const [description, setDescription] = useState(editingEncounter?.description || "");
  const [difficulty, setDifficulty] = useState(editingEncounter?.difficulty || "medium");
  const [enemies, setEnemies] = useState<Enemy[]>(editingEncounter?.enemies || []);
  const [completed, setCompleted] = useState(editingEncounter?.completed || false);
  const [notes, setNotes] = useState(editingEncounter?.notes || "");
  
  const [currentEnemy, setCurrentEnemy] = useState("");
  const [currentHp, setCurrentHp] = useState("");
  const [currentAc, setCurrentAc] = useState("");
  const [currentDetails, setCurrentDetails] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddEnemy = () => {
    if (!currentEnemy.trim()) {
      toast.error("Por favor ingresa el nombre del enemigo");
      return;
    }

    const newEnemy: Enemy = {
      name: currentEnemy.trim(),
      hp: currentHp ? parseInt(currentHp) : null,
      ac: currentAc ? parseInt(currentAc) : null,
      details: currentDetails.trim(),
    };

    if (editingIndex !== null) {
      // Actualizar enemigo existente
      const updatedEnemies = [...enemies];
      updatedEnemies[editingIndex] = newEnemy;
      setEnemies(updatedEnemies);
      setEditingIndex(null);
    } else {
      // Agregar nuevo enemigo
      setEnemies([...enemies, newEnemy]);
    }
    
    setCurrentEnemy("");
    setCurrentHp("");
    setCurrentAc("");
    setCurrentDetails("");
  };

  const handleEditEnemy = (index: number) => {
    const enemy = enemies[index];
    setCurrentEnemy(enemy.name);
    setCurrentHp(enemy.hp ? enemy.hp.toString() : "");
    setCurrentAc(enemy.ac ? enemy.ac.toString() : "");
    setCurrentDetails(enemy.details || "");
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setCurrentEnemy("");
    setCurrentHp("");
    setCurrentAc("");
    setCurrentDetails("");
    setEditingIndex(null);
  };

  const handleRemoveEnemy = (index: number) => {
    setEnemies(enemies.filter((_, i) => i !== index));
    if (editingIndex === index) {
      handleCancelEdit();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Por favor ingresa un nombre para el encuentro");
      return;
    }

    if (editingEncounter && onUpdateEncounter) {
      onUpdateEncounter(editingEncounter.id, {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        enemies,
        completed,
        notes: notes.trim(),
      });
    } else {
      onCreateEncounter({
        title: title.trim(),
        description: description.trim(),
        difficulty,
        enemies,
        completed,
        notes: notes.trim(),
      });
    }
    
    setTitle("");
    setDescription("");
    setDifficulty("medium");
    setEnemies([]);
    setCompleted(false);
    setNotes("");
    setCurrentEnemy("");
    setCurrentHp("");
    setCurrentAc("");
    setCurrentDetails("");
    setEditingIndex(null);
    setOpen(false);
  };

  useEffect(() => {
    if (editingEncounter) {
      setTitle(editingEncounter.title);
      setDescription(editingEncounter.description);
      setDifficulty(editingEncounter.difficulty);
      setEnemies(editingEncounter.enemies);
      setCompleted(editingEncounter.completed);
      setNotes(editingEncounter.notes);
      setCurrentEnemy("");
      setCurrentHp("");
      setCurrentAc("");
      setCurrentDetails("");
      setEditingIndex(null);
      setOpen(true);
    }
  }, [editingEncounter]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!editingEncounter && (
        <DialogTrigger asChild>
          <Button variant="secondary" size="lg" className="gap-2">
            <Swords className="h-5 w-5" />
            Registrar Encuentro
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            {editingEncounter ? "Editar Encuentro" : "Nuevo Encuentro"}
          </DialogTitle>
          <DialogDescription>
            {editingEncounter 
              ? "Actualiza la información de este encuentro."
              : "Registra un nuevo encuentro de combate o desafío para esta sesión."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nombre del Encuentro</Label>
              <Input
                id="title"
                placeholder="Emboscada de Orcos"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-serif"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Los héroes son emboscados por una horda de orcos en el camino..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificultad</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                  <SelectItem value="deadly">Mortal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Enemigos</Label>
              <div className="space-y-2">
                {enemies.map((enemy, index) => (
                  <div key={index} className="space-y-1 p-2 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-muted-foreground w-6">{index + 1}.</span>
                      <span className="flex-1 text-sm font-medium">{enemy.name}</span>
                      {enemy.hp !== null && <span className="text-sm text-muted-foreground">HP: {enemy.hp}</span>}
                      {enemy.ac !== null && <span className="text-sm text-muted-foreground">AC: {enemy.ac}</span>}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEnemy(index)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEnemy(index)}
                      >
                        ×
                      </Button>
                    </div>
                    {enemy.details && (
                      <p className="text-xs text-muted-foreground ml-8 italic">{enemy.details}</p>
                    )}
                  </div>
                ))}
                <div className="space-y-2 p-3 border border-border rounded-md bg-card">
                  {editingIndex !== null && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Editando enemigo #{editingIndex + 1}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enemigo"
                        value={currentEnemy}
                        onChange={(e) => setCurrentEnemy(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="HP"
                        value={currentHp}
                        onChange={(e) => setCurrentHp(e.target.value)}
                        className="w-20"
                      />
                      <Input
                        type="number"
                        placeholder="AC"
                        value={currentAc}
                        onChange={(e) => setCurrentAc(e.target.value)}
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={handleAddEnemy}
                      >
                        {editingIndex !== null ? "✓" : "+"}
                      </Button>
                      {editingIndex !== null && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelEdit}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                    <Textarea
                      placeholder="Detalles (opcional)"
                      value={currentDetails}
                      onChange={(e) => setCurrentDetails(e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-2 pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="completed">Encuentro Completado</Label>
                <p className="text-sm text-muted-foreground">
                  Marca si el encuentro ya finalizó
                </p>
              </div>
              <Switch
                id="completed"
                checked={completed}
                onCheckedChange={setCompleted}
              />
            </div>

            {completed && (
              <div className="space-y-2">
                <Label htmlFor="notes">Comentarios y Conclusión</Label>
                <Textarea
                  id="notes"
                  placeholder="¿Cómo se desarrolló la batalla? ¿Quién ganó? ¿Hubo caídos?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 pb-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="default">
                {editingEncounter ? "Actualizar Encuentro" : "Registrar Encuentro"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
