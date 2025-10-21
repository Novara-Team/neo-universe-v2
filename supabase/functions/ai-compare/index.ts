const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Tool {
  name: string;
  description: string;
  pricing_type: string;
  features: string[];
  rating: number;
  tags: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { tools, question } = await req.json();

    if (!tools || !Array.isArray(tools) || tools.length === 0) {
      return new Response(
        JSON.stringify({ error: "Tools array is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openRouterKey) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const toolsData = tools.map((tool: Tool) => ({
      name: tool.name,
      description: tool.description,
      pricing: tool.pricing_type,
      features: tool.features,
      rating: tool.rating,
      tags: tool.tags,
    }));

    let systemPrompt = `You are an expert AI tool analyst. Compare the following AI tools and provide a comprehensive analysis.

Tools to compare:
${JSON.stringify(toolsData, null, 2)}

Provide your analysis in the following structure:
1. Overview comparison
2. Strengths and weaknesses of each tool
3. Best use cases for each tool
4. Pricing analysis
5. Final recommendation based on different user needs

Be objective, detailed, and provide actionable insights.`;

    if (question) {
      systemPrompt += `\n\nUser's specific question: ${question}`;
    }

    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": Deno.env.get("SUPABASE_URL") || "",
          "X-Title": "AI Universe",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            {
              role: "user",
              content: systemPrompt,
            },
          ],
        }),
      }
    );

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text();
      console.error("OpenRouter error:", errorData);
      return new Response(
        JSON.stringify({
          error: "Failed to get AI analysis",
          details: errorData
        }),
        {
          status: openRouterResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await openRouterResponse.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      return new Response(
        JSON.stringify({ error: "No analysis generated" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
