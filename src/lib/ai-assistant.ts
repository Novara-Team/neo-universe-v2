import { supabase } from './supabase';

function cleanMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\* /g, '• ')
    .replace(/^- /gm, '• ')
    .replace(/^#+\s/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface UserRequirements {
  useCase?: string;
  budget?: string;
  features?: string[];
  industry?: string;
  teamSize?: string;
  integrations?: string[];
}

export async function chatWithAIAssistant(
  messages: ChatMessage[],
  userRequirements: UserRequirements
): Promise<string> {
  try {
    const context = await buildToolContext();

    const enrichedRequirements = {
      ...userRequirements,
      availableTools: context.tools.map(t => ({
        name: t.name,
        description: t.description,
        pricing: t.pricing_type,
        rating: t.rating,
        category: t.category?.name
      })).slice(0, 20)
    };

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        requirements: enrichedRequirements
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const cleanResponse = cleanMarkdownFormatting(data.response);
    return cleanResponse;
  } catch (error) {
    console.error('Error in AI assistant:', error);
    return 'I apologize, but I encountered an error. Please try rephrasing your question.';
  }
}

async function buildToolContext() {
  const { data: tools } = await supabase
    .from('ai_tools')
    .select('*, category:categories(*)')
    .eq('status', 'Published')
    .limit(100);

  const { data: categories } = await supabase.from('categories').select('*');

  return {
    tools: tools || [],
    categories: categories || [],
  };
}

async function analyzeUserRequest(
  message: string,
  requirements: UserRequirements,
  context: any
): Promise<string> {
  const intent = detectConversationIntent(message);

  switch (intent) {
    case 'greeting':
      return generateGreeting();
    case 'budget':
      return handleBudgetQuery(message, context);
    case 'features':
      return handleFeatureQuery(message, requirements, context);
    case 'comparison':
      return handleComparisonQuery(message, context);
    case 'recommendation':
      return handleRecommendationQuery(message, requirements, context);
    case 'integration':
      return handleIntegrationQuery(message, context);
    case 'setup':
      return handleSetupQuery(message);
    default:
      return handleGeneralQuery(message, context);
  }
}

function detectConversationIntent(message: string): string {
  const lower = message.toLowerCase();

  if (lower.match(/^(hi|hello|hey|greetings)/)) {
    return 'greeting';
  }
  if (lower.includes('budget') || lower.includes('cost') || lower.includes('price') || lower.includes('afford')) {
    return 'budget';
  }
  if (lower.includes('feature') || lower.includes('can it') || lower.includes('does it')) {
    return 'features';
  }
  if (lower.includes('compare') || lower.includes('difference') || lower.includes('vs') || lower.includes('better')) {
    return 'comparison';
  }
  if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('best') || lower.includes('looking for')) {
    return 'recommendation';
  }
  if (lower.includes('integrate') || lower.includes('work with') || lower.includes('connect')) {
    return 'integration';
  }
  if (lower.includes('setup') || lower.includes('install') || lower.includes('get started')) {
    return 'setup';
  }

  return 'general';
}

function generateGreeting(): string {
  return `Hello! I'm your AI tool selection assistant. I'm here to help you find the perfect AI tools for your needs.

I can help you with:
- Finding tools based on your specific requirements
- Comparing different tools
- Checking budget compatibility
- Understanding features and integrations
- Providing setup guidance

What kind of AI tools are you looking for today?`;
}

function handleBudgetQuery(message: string, context: any): string {
  const lower = message.toLowerCase();
  let budgetType = 'all';

  if (lower.includes('free')) {
    budgetType = 'Free';
  } else if (lower.includes('paid') && lower.includes('free')) {
    budgetType = 'Freemium';
  }

  const matchingTools = context.tools.filter((tool: any) =>
    budgetType === 'all' || tool.pricing_type === budgetType
  );

  if (matchingTools.length === 0) {
    return `I couldn't find tools matching your budget criteria. Would you like to explore other pricing options?`;
  }

  const topTools = matchingTools
    .sort((a: any, b: any) => b.rating - a.rating)
    .slice(0, 5);

  let response = `I found ${matchingTools.length} ${budgetType !== 'all' ? budgetType.toLowerCase() : ''} tools for you. Here are the top-rated ones:\n\n`;

  topTools.forEach((tool: any, idx: number) => {
    response += `${idx + 1}. ${tool.name} - ${tool.pricing_type} (★ ${tool.rating})\n   ${tool.description}\n\n`;
  });

  response += `Would you like more details about any of these tools, or shall I refine the search based on specific features?`;

  return response;
}

function handleFeatureQuery(message: string, requirements: UserRequirements, context: any): string {
  const features = extractFeatures(message);

  if (features.length === 0) {
    return `I'd be happy to help you find tools with specific features! Could you tell me what features are most important to you? For example: automation, API access, collaboration, analytics, etc.`;
  }

  const matchingTools = context.tools.filter((tool: any) =>
    features.some(feature =>
      tool.description.toLowerCase().includes(feature) ||
      tool.long_description?.toLowerCase().includes(feature) ||
      tool.tags?.some((tag: string) => tag.toLowerCase().includes(feature))
    )
  );

  if (matchingTools.length === 0) {
    return `I couldn't find tools with those specific features. Could you describe your use case differently, or would you like suggestions for alternative features?`;
  }

  let response = `I found ${matchingTools.length} tools with ${features.join(', ')} capabilities:\n\n`;

  matchingTools.slice(0, 5).forEach((tool: any, idx: number) => {
    response += `${idx + 1}. ${tool.name} (${tool.pricing_type})\n   ${tool.description}\n   Rating: ★ ${tool.rating}\n\n`;
  });

  response += `Would you like detailed information about any of these tools?`;

  return response;
}

function handleComparisonQuery(message: string, context: any): string {
  const toolNames = extractToolNames(message, context.tools);

  if (toolNames.length < 2) {
    return `To help you compare tools, please mention at least two tool names you'd like to compare. For example: "Compare ChatGPT and Claude" or tell me your requirements and I'll suggest tools to compare.`;
  }

  const tools = toolNames.map(name =>
    context.tools.find((t: any) => t.name.toLowerCase() === name.toLowerCase())
  ).filter(Boolean);

  if (tools.length < 2) {
    return `I found some of the tools you mentioned, but I need at least two valid tool names to compare. Could you check the spelling or browse our catalog?`;
  }

  let response = `Here's a comparison of the tools you mentioned:\n\n`;

  tools.forEach((tool: any) => {
    response += `**${tool.name}**\n`;
    response += `- Pricing: ${tool.pricing_type}\n`;
    response += `- Rating: ★ ${tool.rating}\n`;
    response += `- Category: ${tool.category?.name || 'N/A'}\n`;
    response += `- Description: ${tool.description}\n\n`;
  });

  response += `Would you like more detailed comparisons on specific aspects like features, pricing, or use cases?`;

  return response;
}

function handleRecommendationQuery(message: string, requirements: UserRequirements, context: any): string {
  const { useCase, budget, industry } = requirements;

  let filteredTools = [...context.tools];

  if (budget) {
    filteredTools = filteredTools.filter((tool: any) =>
      tool.pricing_type === budget || budget === 'all'
    );
  }

  const keywords = extractKeywords(message);
  if (keywords.length > 0) {
    filteredTools = filteredTools.filter((tool: any) =>
      keywords.some(keyword =>
        tool.name.toLowerCase().includes(keyword) ||
        tool.description.toLowerCase().includes(keyword) ||
        tool.tags?.some((tag: string) => tag.toLowerCase().includes(keyword))
      )
    );
  }

  filteredTools.sort((a: any, b: any) => {
    const scoreA = a.rating * 2 + Math.log10(a.views + 1);
    const scoreB = b.rating * 2 + Math.log10(b.views + 1);
    return scoreB - scoreA;
  });

  const recommendations = filteredTools.slice(0, 5);

  if (recommendations.length === 0) {
    return `I couldn't find tools matching your exact criteria. Could you provide more details about what you're looking for? For example, your industry, team size, or specific use cases?`;
  }

  let response = `Based on your requirements, here are my top recommendations:\n\n`;

  recommendations.forEach((tool: any, idx: number) => {
    response += `${idx + 1}. **${tool.name}** (${tool.pricing_type})\n`;
    response += `   Rating: ★ ${tool.rating} | Views: ${tool.views.toLocaleString()}\n`;
    response += `   ${tool.description}\n`;
    response += `   Why I recommend it: ${generateRecommendationReason(tool, requirements)}\n\n`;
  });

  response += `Would you like more information about any of these tools, or shall I adjust the recommendations?`;

  return response;
}

function handleIntegrationQuery(message: string, context: any): string {
  const integrations = extractIntegrations(message);

  if (integrations.length === 0) {
    return `I can help you find tools with specific integrations! Which platforms or services do you need to integrate with? For example: Slack, Google Workspace, Salesforce, etc.`;
  }

  return `I'm checking for tools that integrate with ${integrations.join(', ')}. Many tools in our catalog support various integrations. Let me show you some relevant options. Could you also tell me what you're trying to accomplish with these integrations?`;
}

function handleSetupQuery(message: string): string {
  return `I'd be happy to guide you through the setup process! To provide the most helpful guidance:

1. Which tool are you interested in setting up?
2. What's your technical background (beginner, intermediate, advanced)?
3. What's your primary use case?

Most tools in our catalog offer:
- Easy signup process (usually 5-10 minutes)
- Free trials or free tiers
- Documentation and tutorials
- Community support

Please share more details so I can provide specific setup guidance!`;
}

function handleGeneralQuery(message: string, context: any): string {
  return `I'm here to help you find the perfect AI tools! I can assist with:

- **Tool Discovery**: Tell me what you're trying to accomplish
- **Comparisons**: Compare different tools side-by-side
- **Budget Planning**: Find tools within your budget
- **Feature Matching**: Match tools to your specific needs
- **Integration Help**: Find tools that work with your existing stack

What would you like to know more about?`;
}

function extractFeatures(message: string): string[] {
  const featureKeywords = [
    'api', 'automation', 'analytics', 'collaboration', 'integration',
    'real-time', 'cloud', 'mobile', 'dashboard', 'reporting',
    'ai', 'ml', 'nlp', 'vision', 'speech'
  ];

  return featureKeywords.filter(keyword =>
    message.toLowerCase().includes(keyword)
  );
}

function extractToolNames(message: string, tools: any[]): string[] {
  const names: string[] = [];

  tools.forEach(tool => {
    if (message.toLowerCase().includes(tool.name.toLowerCase())) {
      names.push(tool.name);
    }
  });

  return names;
}

function extractKeywords(message: string): string[] {
  const words = message.toLowerCase().split(/\s+/);
  const stopWords = ['i', 'need', 'want', 'looking', 'for', 'the', 'a', 'an', 'to', 'and', 'or'];

  return words.filter(word =>
    word.length > 3 && !stopWords.includes(word)
  );
}

function extractIntegrations(message: string): string[] {
  const integrationKeywords = [
    'slack', 'teams', 'google', 'microsoft', 'salesforce', 'hubspot',
    'zapier', 'api', 'webhook', 'aws', 'azure', 'gcp'
  ];

  return integrationKeywords.filter(keyword =>
    message.toLowerCase().includes(keyword)
  );
}

function generateRecommendationReason(tool: any, requirements: UserRequirements): string {
  const reasons = [];

  if (tool.rating >= 4.5) {
    reasons.push('highly rated by users');
  }

  if (tool.views > 1000) {
    reasons.push('popular choice');
  }

  if (requirements.budget && tool.pricing_type === requirements.budget) {
    reasons.push('matches your budget');
  }

  if (tool.featured) {
    reasons.push('featured tool');
  }

  if (reasons.length === 0) {
    return 'fits your requirements';
  }

  return reasons.join(', ');
}

export function extractRequirementsFromConversation(messages: ChatMessage[]): UserRequirements {
  const requirements: UserRequirements = {};

  messages.forEach(msg => {
    const content = msg.content.toLowerCase();

    if (content.includes('free')) requirements.budget = 'Free';
    else if (content.includes('paid')) requirements.budget = 'Paid';

    if (content.includes('small team')) requirements.teamSize = 'small';
    else if (content.includes('enterprise')) requirements.teamSize = 'enterprise';

    const industries = ['healthcare', 'finance', 'education', 'marketing', 'technology'];
    industries.forEach(industry => {
      if (content.includes(industry)) requirements.industry = industry;
    });
  });

  return requirements;
}
