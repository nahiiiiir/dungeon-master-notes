import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface CreatePlayerDialogProps {
  onCreatePlayer: (player: {
    playerName: string;
    characterName: string;
    race: string;
    class: string;
    level: number;
  }) => void;
  editingPlayer?: {
    id: string;
    playerName: string;
    characterName: string;
    race: string;
    class: string;
    level: number;
  } | null;
  onUpdatePlayer?: (id: string, player: {
    playerName: string;
    characterName: string;
    race: string;
    class: string;
    level: number;
  }) => void;
}

export const CreatePlayerDialog = ({ 
  onCreatePlayer,
  editingPlayer,
  onUpdatePlayer
}: CreatePlayerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [playerName, setPlayerName] = useState(editingPlayer?.playerName || "");
  const [characterName, setCharacterName] = useState(editingPlayer?.characterName || "");
  const [race, setRace] = useState(editingPlayer?.race || "");
  const [characterClass, setCharacterClass] = useState(editingPlayer?.class || "");
  const [level, setLevel] = useState(editingPlayer?.level || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim() || !characterName.trim()) {
      toast.error("Por favor completa el nombre del jugador y del personaje");
      return;
    }

    if (editingPlayer && onUpdatePlayer) {
      onUpdatePlayer(editingPlayer.id, {
        playerName: playerName.trim(),
        characterName: characterName.trim(),
        race: race.trim(),
        class: characterClass.trim(),
        level,
      });
    } else {
      onCreatePlayer({
        playerName: playerName.trim(),
        characterName: characterName.trim(),
        race: race.trim(),
        class: characterClass.trim(),
        level,
      });
    }
    
    setPlayerName("");
    setCharacterName("");
    setRace("");
    setCharacterClass("");
    setLevel(1);
    setOpen(false);
  };

  // Update form when editingPlayer changes
  useEffect(() => {
    if (editingPlayer) {
      setPlayerName(editingPlayer.playerName);
      setCharacterName(editingPlayer.characterName);
      setRace(editingPlayer.race);
      setCharacterClass(editingPlayer.class);
      setLevel(editingPlayer.level);
      setOpen(true);
    }
  }, [editingPlayer]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!editingPlayer && (
        <DialogTrigger asChild>
          <Button variant="secondary" size="lg" className="gap-2">
            <UserPlus className="h-5 w-5" />
            Registrar Jugador
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            {editingPlayer ? "Editar Jugador" : "Nuevo Jugador"}
          </DialogTitle>
          <DialogDescription>
            {editingPlayer
              ? "Actualiza la información de este jugador."
              : "Registra un nuevo jugador y su personaje en esta campaña."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="playerName">Nombre del Jugador</Label>
            <Input
              id="playerName"
              placeholder="Juan Pérez"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="characterName">Nombre del Personaje</Label>
            <Input
              id="characterName"
              placeholder="Thorin Escudo de Roble"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              className="font-serif"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="race">Raza</Label>
              <Input
                id="race"
                placeholder="Enano"
                value={race}
                onChange={(e) => setRace(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Clase</Label>
              <Input
                id="class"
                placeholder="Guerrero"
                value={characterClass}
                onChange={(e) => setCharacterClass(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Nivel</Label>
            <Input
              id="level"
              type="number"
              min="1"
              max="20"
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="default">
              {editingPlayer ? "Actualizar Jugador" : "Registrar Jugador"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
