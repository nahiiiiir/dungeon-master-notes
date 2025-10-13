import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, campaignId } = await req.json();

    if (!message || !campaignId) {
      return new Response(
        JSON.stringify({ error: 'Message and campaignId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY')!;

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'GOOGLE_GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate user has access to campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: 'Campaign not found or access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch chat history (last 20 messages)
    const { data: chatHistory } = await supabase
      .from('dm_chat_messages')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Fetch campaign context: players and encounters
    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('campaign_id', campaignId);

    const { data: encounters } = await supabase
      .from('encounters')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Build campaign context
    const playersContext = players && players.length > 0
      ? players.map(p => `- ${p.character_name} (${p.race} ${p.class}, nivel ${p.level})`).join('\n')
      : 'No hay jugadores registrados aún.';

    const encountersContext = encounters && encounters.length > 0
      ? encounters.map(e => `- ${e.title} (${e.difficulty}, ${e.completed ? 'completado' : 'pendiente'})`).join('\n')
      : 'No hay encuentros registrados aún.';

    const campaignContext = `
**Campaña:** ${campaign.title}
**Descripción:** ${campaign.description || 'Sin descripción'}
**Estado:** ${campaign.status}

**Jugadores:**
${playersContext}

**Encuentros recientes:**
${encountersContext}
`;

    // Build system prompt
    const systemPrompt = `Eres un asistente experto de Dungeons & Dragons 5e que ayuda a Dungeon Masters a gestionar sus campañas.

Tu rol es:
- Sugerir ideas creativas para encuentros, NPCs, lugares y tesoros
- Ayudar a balancear encuentros según el nivel y cantidad de jugadores
- Responder preguntas sobre reglas de D&D 5e
- Generar descripciones narrativas y diálogos para NPCs
- Proporcionar hooks de aventura y plot twists
- Ayudar con la creación de mazmorras y mapas conceptuales

Contexto de la campaña actual:
${campaignContext}

IMPORTANTE:
- Tus respuestas deben ser prácticas y directas
- Si sugieres encuentros, proporciona detalles completos (enemigos, CR, tácticas)
- Si sugieres NPCs, incluye personalidad, motivaciones y secretos
- Adapta tus sugerencias al nivel de los jugadores
- Sé creativo pero mantén coherencia con D&D 5e
- Si el DM pide crear algo, genera contenido detallado pero deja que él lo ajuste
- Responde siempre en español`;

    // Build conversation history for Gemini
    const conversationHistory = chatHistory
      ? chatHistory
          .filter((m: any) => m.role !== 'system')
          .map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
      : [];

    // Add current user message
    conversationHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: conversationHistory,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Error calling Gemini API', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiResponse.json();
    const assistantMessage = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';

    // Save user message to DB
    await supabase.from('dm_chat_messages').insert({
      campaign_id: campaignId,
      user_id: user.id,
      role: 'user',
      content: message
    });

    // Save assistant message to DB
    await supabase.from('dm_chat_messages').insert({
      campaign_id: campaignId,
      user_id: user.id,
      role: 'assistant',
      content: assistantMessage
    });

    console.log('Chat interaction successful for campaign:', campaignId);

    return new Response(
      JSON.stringify({ response: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in dm-assistant-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
