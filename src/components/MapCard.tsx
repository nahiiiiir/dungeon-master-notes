import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileImage, FileText, File, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MapCardProps {
  map: {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
  };
  onDelete: (id: string) => void;
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes('image')) return <FileImage className="h-5 w-5" />;
  if (fileType.includes('pdf')) return <FileText className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};

export const MapCard = ({ map, onDelete }: MapCardProps) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(map.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = map.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Error al descargar el archivo");
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este mapa?')) return;
    
    try {
      // Extract file path from URL
      const urlParts = map.fileUrl.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('campaign-maps') + 1).join('/');
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('campaign-maps')
        .remove([filePath]);
      
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('maps')
        .delete()
        .eq('id', map.id);
      
      if (dbError) throw dbError;
      
      onDelete(map.id);
      toast.success("Mapa eliminado exitosamente");
    } catch (error) {
      toast.error("Error al eliminar el mapa");
    }
  };

  const isImage = map.fileType.includes('image');

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getFileIcon(map.fileType)}
            <CardTitle className="text-lg">{map.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isImage && (
          <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
            <img 
              src={map.fileUrl} 
              alt={map.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {map.description && (
          <p className="text-sm text-muted-foreground">{map.description}</p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{map.fileType.split('/')[1]?.toUpperCase()}</span>
          {map.fileSize && <span>{formatFileSize(map.fileSize)}</span>}
        </div>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-1" />
            Descargar
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};