import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(10000),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).max(50),
  targetLanguage: z.string().min(1).max(50),
  storyContext: z.string().max(500).optional(),
});

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LANGUAGE-CHAT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id });

    // Validate and parse request body
    const body = await req.json();
    const validatedData = requestSchema.parse(body);
    const { messages, targetLanguage, storyContext } = validatedData;

    logStep("Request validated", { 
      messageCount: messages.length, 
      targetLanguage,
      hasStoryContext: !!storyContext 
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a friendly language learning assistant named Lingo. You help users learn ${targetLanguage || 'Spanish'} through natural conversation.

IMPORTANT RULES:
1. Respond primarily in ${targetLanguage || 'Spanish'} with English translations below
2. Keep responses conversational and natural - 1-3 sentences max
3. Use vocabulary appropriate for language learners
4. Be encouraging and helpful
5. If the user makes mistakes, gently correct them
6. Adapt to the conversation topic naturally

${storyContext ? `SCENARIO: ${storyContext}. Stay in character for this roleplay scenario.` : 'Have a free-flowing conversation.'}

RESPONSE FORMAT (ALWAYS follow this exact JSON format):
{
  "text": "Your response in ${targetLanguage || 'Spanish'}",
  "translation": "English translation of your response",
  "words": [
    {
      "word": "word in target language",
      "translation": "English meaning",
      "pronunciation": "phonetic pronunciation",
      "partOfSpeech": "noun/verb/adjective/etc",
      "isNew": true or false (mark vocabulary that might be new to learners)
    }
  ]
}

Include 3-6 key vocabulary words from your response in the words array. Focus on useful/interesting words.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ 
            role: m.role, 
            content: m.content 
          })),
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("AI gateway error", { status: response.status, error: errorText });
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    logStep("AI response received", { contentLength: content?.length || 0 });

    // Parse the JSON response
    let parsed;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      logStep("JSON parse failed, using fallback");
      // Fallback: use raw content as text
      parsed = {
        text: content,
        translation: "",
        words: []
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    // Check if it's a validation error
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        error: "Invalid request data",
        details: error.errors 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
