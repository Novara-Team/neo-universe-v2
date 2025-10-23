import { supabase } from './supabase';

export interface SearchMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationContext {
  query: string;
  filters?: {
    category?: string;
    pricing?: string;
    tags?: string[];
    features?: string[];
  };
  intent?: string;
}

export async function performAISearch(
  query: string,
  conversationHistory: SearchMessage[] = []
): Promise<{
  response: string;
  suggestedFilters?: any;
  results?: any[];
}> {
  try {
    const tools = await supabase
      .from('ai_tools')
      .select('*, category:categories(*)')
      .eq('status', 'Published')
      .limit(100);

    const categories = await supabase.from('categories').select('*');

    const context = {
      availableCategories: categories.data?.map(c => c.name) || [],
      toolCount: tools.data?.length || 0,
      conversationHistory,
    };

    const intent = detectIntent(query);
    const filters = extractFilters(query);

    let filteredTools = tools.data || [];

    if (filters.category) {
      const category = categories.data?.find(c =>
        c.name.toLowerCase().includes(filters.category.toLowerCase())
      );
      if (category) {
        filteredTools = filteredTools.filter(t => t.category_id === category.id);
      }
    }

    if (filters.pricing) {
      filteredTools = filteredTools.filter(t =>
        t.pricing_type.toLowerCase() === filters.pricing.toLowerCase()
      );
    }

    if (filters.features && filters.features.length > 0) {
      filteredTools = filteredTools.filter(tool =>
        filters.features!.some(feature =>
          tool.description.toLowerCase().includes(feature.toLowerCase()) ||
          tool.long_description?.toLowerCase().includes(feature.toLowerCase()) ||
          tool.tags.some((tag: string) => tag.toLowerCase().includes(feature.toLowerCase()))
        )
      );
    }

    const searchTerms = query.toLowerCase().split(' ').filter(w => w.length > 2);
    filteredTools = filteredTools.filter(tool =>
      searchTerms.some(term =>
        tool.name.toLowerCase().includes(term) ||
        tool.description.toLowerCase().includes(term) ||
        tool.long_description?.toLowerCase().includes(term) ||
        tool.tags.some((tag: string) => tag.toLowerCase().includes(term))
      )
    );

    filteredTools.sort((a, b) => {
      const scoreA = calculateRelevanceScore(a, query);
      const scoreB = calculateRelevanceScore(b, query);
      return scoreB - scoreA;
    });

    const response = generateNaturalResponse(query, intent, filteredTools, filters);

    return {
      response,
      suggestedFilters: filters,
      results: filteredTools.slice(0, 12),
    };
  } catch (error) {
    console.error('Error performing AI search:', error);
    return {
      response: 'I encountered an error while searching. Please try again.',
      results: [],
    };
  }
}

function detectIntent(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('show me') || lowerQuery.includes('find') || lowerQuery.includes('looking for')) {
    return 'search';
  }
  if (lowerQuery.includes('compare') || lowerQuery.includes('difference') || lowerQuery.includes('vs')) {
    return 'compare';
  }
  if (lowerQuery.includes('best') || lowerQuery.includes('top') || lowerQuery.includes('recommend')) {
    return 'recommend';
  }
  if (lowerQuery.includes('how') || lowerQuery.includes('what') || lowerQuery.includes('why')) {
    return 'question';
  }
  if (lowerQuery.includes('free') || lowerQuery.includes('price') || lowerQuery.includes('cost')) {
    return 'pricing';
  }

  return 'general';
}

function extractFilters(query: string): any {
  const filters: any = {};
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('free')) {
    filters.pricing = 'Free';
  } else if (lowerQuery.includes('paid')) {
    filters.pricing = 'Paid';
  } else if (lowerQuery.includes('freemium')) {
    filters.pricing = 'Freemium';
  }

  const categories = [
    'writing', 'image', 'video', 'audio', 'code', 'chat', 'productivity',
    'research', 'design', 'marketing', 'data', 'business'
  ];

  for (const cat of categories) {
    if (lowerQuery.includes(cat)) {
      filters.category = cat;
      break;
    }
  }

  const features: string[] = [];
  const featureKeywords = ['api', 'automation', 'analytics', 'collaboration', 'integration'];

  for (const keyword of featureKeywords) {
    if (lowerQuery.includes(keyword)) {
      features.push(keyword);
    }
  }

  if (features.length > 0) {
    filters.features = features;
  }

  return filters;
}

function calculateRelevanceScore(tool: any, query: string): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  const terms = lowerQuery.split(' ').filter(w => w.length > 2);

  terms.forEach(term => {
    if (tool.name.toLowerCase().includes(term)) score += 10;
    if (tool.description.toLowerCase().includes(term)) score += 5;
    if (tool.long_description?.toLowerCase().includes(term)) score += 3;
    if (tool.tags.some((tag: string) => tag.toLowerCase().includes(term))) score += 4;
  });

  score += tool.rating * 2;
  score += Math.log10(tool.views + 1);

  if (tool.featured) score += 5;

  return score;
}

function generateNaturalResponse(
  query: string,
  intent: string,
  results: any[],
  filters: any
): string {
  if (results.length === 0) {
    return `I couldn't find any tools matching "${query}". Try adjusting your search or browse our categories to discover tools.`;
  }

  let response = '';

  switch (intent) {
    case 'search':
      response = `I found ${results.length} relevant tool${results.length !== 1 ? 's' : ''} for you. `;
      break;
    case 'recommend':
      response = `Based on your search, here are the top ${Math.min(results.length, 5)} recommended tools. `;
      break;
    case 'pricing':
      response = `I found ${results.length} ${filters.pricing || 'tool'}${results.length !== 1 ? 's' : ''} matching your criteria. `;
      break;
    case 'compare':
      response = `Here are tools related to your comparison query. You can select multiple to compare them side-by-side. `;
      break;
    default:
      response = `I found ${results.length} relevant tool${results.length !== 1 ? 's' : ''} for you. `;
  }

  if (filters.category) {
    response += `Showing ${filters.category} tools. `;
  }

  if (filters.pricing) {
    response += `Filtered by ${filters.pricing} pricing. `;
  }

  return response;
}
