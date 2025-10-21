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

    let systemPrompt = `You are a highly experienced AI tools analyst with deep expertise in evaluating software solutions. Your analysis should be professional, data-driven, and actionable.

Tools to compare:
${JSON.stringify(toolsData, null, 2)}

Provide a comprehensive, professional analysis with the following structure:

## Executive Summary
- Quick overview (2-3 sentences) comparing the tools at a high level
- Key differentiators between the tools

## Detailed Comparison

### Feature Analysis
- Core features comparison
- Unique capabilities of each tool
- Feature gaps or limitations
- Advanced functionality assessment

### Performance & Quality
- Rating analysis and what it indicates
- User satisfaction indicators
- Reliability and consistency factors

### Pricing & Value Proposition
- Pricing model comparison (${toolsData.map((t: any) => t.pricing).join(' vs ')})
- Cost-effectiveness analysis
- ROI considerations
- Best value for different budget levels

### Strengths & Weaknesses

For each tool, provide:
- Top 3 Strengths
- Top 3 Weaknesses
- Competitive advantages

### Use Case Recommendations

Provide specific scenarios for each tool:
- Best for: [specific use case]
- Ideal users: [user profile]
- When to choose: [decision factors]
- When to avoid: [limitation scenarios]

### Integration & Ecosystem
- Compatibility considerations
- Learning curve assessment
- Support and community

## Final Recommendations

Provide tiered recommendations:
- **For Beginners:** [tool name] because [reasons]
- **For Professionals:** [tool name] because [reasons]
- **For Enterprises:** [tool name] because [reasons]
- **Best Overall Value:** [tool name] because [reasons]

## Decision Framework
Provide a simple decision tree to help users choose based on their priority (features, price, ease of use, etc.)

Be analytical, objective, and back your insights with specific examples from the tool data. Use professional language and provide actionable guidance.`;

    if (question) {
      systemPrompt += `\n\n## Specific User Question
The user has asked: "${question}"

Please address this question specifically in your analysis and provide a detailed answer based on the comparison above.`;
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
