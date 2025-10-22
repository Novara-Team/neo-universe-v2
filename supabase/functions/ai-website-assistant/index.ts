import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface WebsiteContext {
  tools: any[];
  collections: any[];
  news: any[];
  categories: string[];
  features: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { question, context } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: 'Question is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const systemPrompt = `You are an AI assistant for AI Universe, a comprehensive platform for discovering and exploring AI tools.

Website Knowledge Base:

**Platform Features:**
- Browse 200+ AI tools across various categories
- Compare tools side-by-side with advanced metrics
- Create and share collections of favorite tools
- Get personalized AI recommendations
- Read latest AI news and updates
- Track personal analytics and usage patterns
- Submit new tools for review
- Real-time support chat system

**Subscription Plans:**
- Free: Access to 100 tools, 3 favorites, top 5 news
- Plus ($7-9/month): Full tool access, comparisons, collections, unlimited favorites, tool submissions
- Pro ($19-29/month): Everything in Plus + analytics, recommendations, priority support, exports

**Key Sections:**
- Home: Featured tools and trending content
- Explore: Browse all AI tools with filters
- Compare: Side-by-side tool comparison (Advanced for Pro users)
- Collections: Curated tool collections (can remix other users' collections)
- Top Tools: Most popular and highest-rated tools
- News: Latest AI industry news
- Recommendations: Personalized tool suggestions (Pro feature)
- Analytics: Personal usage insights (Pro feature)
- Support: Real-time chat support with file sharing

**Tool Information:**
- Each tool has: name, description, logo, pricing, features, tags, rating, views
- Tools can be: Free, Freemium, or Paid
- Users can favorite tools, add to collections, write reviews
- Tools display launch date, website link, and demo status

**Collections:**
- Users can create public or private collections
- Collections can be remixed/forked by other users
- Track views and shares with analytics
- Export collections as CSV or PDF

**Notifications:**
- Users receive notifications for new tools and news
- Real-time notification system with unread counts

**Support System:**
- Real-time chat with admins
- File and image sharing support
- Conversation history preserved

${context ? `\n**Current Context:**\n${JSON.stringify(context, null, 2)}` : ''}

Provide helpful, accurate, and friendly responses about the platform. If asked about specific tools, use the context provided. If you don't have specific information, acknowledge that and provide general guidance.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ answer }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process request' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
