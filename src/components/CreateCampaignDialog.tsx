import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface CreateCampaignDialogProps {
  onCreateCampaign: (campaign: {
    title: string;
    description: string;
    players: number;
  }) => void;
}

export const CreateCampaignDialog = ({ onCreateCampaign }: CreateCampaignDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [players, setPlayers] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Por favor ingresa un nombre para la campaña");
      return;
    }

    onCreateCampaign({
      title: title.trim(),
      description: description.trim(),
      players,
    });

    toast.success("¡Campaña creada exitosamente!");
    
    setTitle("");
    setDescription("");
    setPlayers(4);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="lg" className="gap-2">
          <PlusCircle className="h-5 w-5" />
          Nueva Campaña
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Crear Nueva Campaña</DialogTitle>
          <DialogDescription>
            Comienza una nueva aventura épica. Registra los detalles de tu campaña.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nombre de la Campaña</Label>
            <Input
              id="title"
              placeholder="La Maldición del Dragón Carmesí"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-serif"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Una aventura épica en las tierras olvidadas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="players">Número de Jugadores</Label>
            <Input
              id="players"
              type="number"
              min="1"
              max="10"
              value={players}
              onChange={(e) => setPlayers(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="default">
              Crear Campaña
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
