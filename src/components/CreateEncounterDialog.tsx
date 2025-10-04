import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords } from "lucide-react";
import { toast } from "sonner";

interface CreateEncounterDialogProps {
  onCreateEncounter: (encounter: {
    title: string;
    description: string;
    difficulty: string;
    enemies: string;
  }) => void;
}

export const CreateEncounterDialog = ({ onCreateEncounter }: CreateEncounterDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [enemies, setEnemies] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Por favor ingresa un nombre para el encuentro");
      return;
    }

    onCreateEncounter({
      title: title.trim(),
      description: description.trim(),
      difficulty,
      enemies: enemies.trim(),
    });

    toast.success("¡Encuentro registrado exitosamente!");
    
    setTitle("");
    setDescription("");
    setDifficulty("medium");
    setEnemies("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" className="gap-2">
          <Swords className="h-5 w-5" />
          Registrar Encuentro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Nuevo Encuentro</DialogTitle>
          <DialogDescription>
            Registra un nuevo encuentro de combate o desafío para esta sesión.
          </DialogDescription>
        </DialogHeader>
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
            <Label htmlFor="enemies">Enemigos</Label>
            <Input
              id="enemies"
              placeholder="4 Orcos, 1 Líder Orco"
              value={enemies}
              onChange={(e) => setEnemies(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="default">
              Registrar Encuentro
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
