import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, targetLanguage, storyContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing language chat request:", { targetLanguage, storyContext, messageCount: messages.length });

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
          ...messages.map((m: any) => ({ 
            role: m.role, 
            content: m.content 
          })),
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
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
    
    console.log("Raw AI response:", content);

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
      console.error("Failed to parse AI response as JSON:", parseError);
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
    console.error("Language chat error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
