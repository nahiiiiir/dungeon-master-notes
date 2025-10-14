import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Send, Loader2, Mic, Play, Pause } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const VOICE_OPTIONS = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', category: 'Mujeres', description: 'Femenina, versátil' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', category: 'Hombres', description: 'Masculina, madura' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', category: 'Mujeres', description: 'Femenina, suave' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', category: 'Mujeres', description: 'Femenina, cálida' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', category: 'Hombres', description: 'Masculina, casual' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', category: 'Hombres', description: 'Masculina, profunda' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', category: 'Hombres', description: 'Masculina, seria' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', category: 'Jóvenes', description: 'Neutral, joven' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', category: 'Hombres', description: 'Masculina, enérgica' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', category: 'Mujeres', description: 'Femenina, elegante' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', category: 'Mujeres', description: 'Femenina, clara' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', category: 'Mujeres', description: 'Femenina, madura' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', category: 'Hombres', description: 'Masculina, amigable' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', category: 'Mujeres', description: 'Femenina, expresiva' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', category: 'Hombres', description: 'Masculina, autoritaria' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', category: 'Hombres', description: 'Masculina, conversacional' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', category: 'Jóvenes', description: 'Femenina, juvenil' },
];

interface DmAssistantChatProps {
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DmAssistantChat({ campaignId, isOpen, onClose }: DmAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[5].id); // George por defecto
  const [generatingVoice, setGeneratingVoice] = useState<string | null>(null);
  const [audioCache, setAudioCache] = useState<Record<string, { audio: string; voiceId: string }>>({});
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch chat history
  useEffect(() => {
    if (isOpen && campaignId) {
      fetchMessages();
    }
  }, [isOpen, campaignId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('dm_chat_messages')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const typedMessages = (data || []).filter(
        (m: any) => m.role === 'user' || m.role === 'assistant'
      ) as Message[];
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes anteriores",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Optimistic UI: Add user message immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('dm-assistant-chat', {
        body: {
          message: userMessage,
          campaignId: campaignId,
        },
      });

      if (error) throw error;

      // Refresh messages to get the actual saved messages
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGenerateVoice = async (messageId: string, content: string) => {
    if (generatingVoice) return;

    setGeneratingVoice(messageId);

    try {
      const { data, error } = await supabase.functions.invoke('generate-npc-voice', {
        body: {
          text: content,
          voiceId: selectedVoice,
        },
      });

      if (error) throw error;

      if (!data?.audio) {
        throw new Error('No audio data received');
      }

      // Cache the audio
      setAudioCache(prev => ({
        ...prev,
        [messageId]: { audio: data.audio, voiceId: selectedVoice }
      }));

      // Auto-play
      playAudio(messageId, data.audio);

      toast({
        title: "Voz generada",
        description: `Audio generado con la voz ${VOICE_OPTIONS.find(v => v.id === selectedVoice)?.name}`,
      });
    } catch (error: any) {
      console.error('Error generating voice:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo generar la voz. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setGeneratingVoice(null);
    }
  };

  const playAudio = (messageId: string, base64Audio: string) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
    audioRef.current = audio;
    setPlayingAudio(messageId);

    audio.play();
    audio.onended = () => {
      setPlayingAudio(null);
      audioRef.current = null;
    };
  };

  const togglePlayPause = (messageId: string) => {
    const cached = audioCache[messageId];
    if (!cached) return;

    if (playingAudio === messageId && audioRef.current) {
      audioRef.current.pause();
      setPlayingAudio(null);
      audioRef.current = null;
    } else {
      playAudio(messageId, cached.audio);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl">Asistente del DM</SheetTitle>
              <SheetDescription>
                Tu asistente de D&D 5e con conocimiento de tu campaña
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  ¡Hola! Soy tu asistente de D&D. Pregúntame sobre encuentros, NPCs, reglas, o cualquier cosa relacionada con tu campaña.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                    {msg.role === 'user' ? 'DM' : <Brain className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 max-w-[80%]">
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {msg.role === 'assistant' && (
                    <div className="mt-2 flex gap-2 items-center">
                      {!audioCache[msg.id] ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateVoice(msg.id, msg.content)}
                          disabled={generatingVoice === msg.id}
                          className="gap-2"
                        >
                          {generatingVoice === msg.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <Mic className="h-3 w-3" />
                              Generar Voz
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePlayPause(msg.id)}
                            className="gap-2"
                          >
                            {playingAudio === msg.id ? (
                              <>
                                <Pause className="h-3 w-3" />
                                Pausar
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3" />
                                Reproducir
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateVoice(msg.id, msg.content)}
                            disabled={generatingVoice === msg.id}
                            className="gap-2"
                          >
                            <Mic className="h-3 w-3" />
                            Regenerar
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {VOICE_OPTIONS.find(v => v.id === audioCache[msg.id]?.voiceId)?.name}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-muted">
                    <Brain className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Pensando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t space-y-3">
          <div className="flex gap-2 items-center">
            <Mic className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una voz" />
              </SelectTrigger>
              <SelectContent>
                {['Hombres', 'Mujeres', 'Jóvenes'].map(category => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {category === 'Hombres' && '🧙‍♂️ '}
                      {category === 'Mujeres' && '🧙‍♀️ '}
                      {category === 'Jóvenes' && '👦 '}
                      {category}
                    </div>
                    {VOICE_OPTIONS.filter(v => v.category === category).map(voice => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name} - {voice.description}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Escribe tu pregunta o solicitud..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Presiona Enter para enviar • Shift+Enter para nueva línea
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
