import { supabase } from './supabase';

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string;
  slug: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionTool {
  id: string;
  collection_id: string;
  tool_id: string;
  position: number;
  created_at: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') +
    '-' +
    Math.random().toString(36).substring(2, 8);
}

export async function createCollection(
  userId: string,
  name: string,
  description: string,
  isPublic: boolean
): Promise<{ success: boolean; data?: Collection; error?: string }> {
  const slug = generateSlug(name);

  const { data, error } = await supabase
    .from('tool_collections')
    .insert({
      user_id: userId,
      name,
      description,
      slug,
      is_public: isPublic,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateCollection(
  collectionId: string,
  updates: Partial<Pick<Collection, 'name' | 'description' | 'is_public'>>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('tool_collections')
    .update(updates)
    .eq('id', collectionId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteCollection(collectionId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('tool_collections')
    .delete()
    .eq('id', collectionId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getUserCollections(userId: string) {
  const { data, error } = await supabase
    .from('tool_collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getCollectionBySlug(slug: string) {
  const { data, error } = await supabase
    .from('tool_collections')
    .select(`
      *,
      collection_tools (
        id,
        position,
        tool_id,
        ai_tools (
          id,
          name,
          slug,
          description,
          logo_url,
          website_url,
          pricing_type,
          rating
        )
      )
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCollectionTools(collectionId: string) {
  const { data, error } = await supabase
    .from('collection_tools')
    .select(`
      id,
      position,
      tool_id,
      ai_tools (
        id,
        name,
        slug,
        description,
        logo_url,
        website_url,
        pricing_type,
        rating
      )
    `)
    .eq('collection_id', collectionId)
    .order('position', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function addToolToCollection(
  collectionId: string,
  toolId: string
): Promise<{ success: boolean; error?: string }> {
  const { count } = await supabase
    .from('collection_tools')
    .select('*', { count: 'exact', head: true })
    .eq('collection_id', collectionId);

  const position = (count || 0) + 1;

  const { error } = await supabase
    .from('collection_tools')
    .insert({
      collection_id: collectionId,
      tool_id: toolId,
      position,
    });

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Tool already in collection' };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function removeToolFromCollection(
  collectionId: string,
  toolId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('collection_tools')
    .delete()
    .eq('collection_id', collectionId)
    .eq('tool_id', toolId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateToolPosition(
  collectionId: string,
  toolId: string,
  newPosition: number
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('collection_tools')
    .update({ position: newPosition })
    .eq('collection_id', collectionId)
    .eq('tool_id', toolId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
