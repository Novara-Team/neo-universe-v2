import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  requirements?: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { messages, requirements }: ChatRequest = await req.json();

    const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openRouterKey) {
      throw new Error("OpenRouter API key not configured");
    }

    const systemPrompt = `You are an intelligent AI tool selection assistant. You help users find the perfect AI tools based on their needs.

You can:
- Recommend tools based on requirements
- Compare different tools
- Explain features and capabilities
- Help with budget planning
- Provide integration advice
- Give setup guidance

Be helpful, concise, and professional. Always provide actionable recommendations.${requirements ? `\n\nUser Requirements: ${JSON.stringify(requirements)}` : ''}`;

    const openRouterMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers.get("origin") || "https://ai-universe.app",
        "X-Title": "AI Universe"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: openRouterMessages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!openRouterResponse.ok) {
      const error = await openRouterResponse.text();
      console.error("OpenRouter error:", error);
      throw new Error("Failed to get AI response");
    }

    const data = await openRouterResponse.json();
    const aiResponse = data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in ai-chat:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred",
        response: "I apologize, but I encountered an error. Please try again."
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});