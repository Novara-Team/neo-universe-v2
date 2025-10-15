import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  created_at: string;
};

export type AITool = {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string;
  logo_url: string;
  website_url: string;
  category_id: string;
  pricing_type: 'Free' | 'Paid' | 'Freemium' | 'Trial';
  rating: number;
  views: number;
  launch_date: string;
  featured: boolean;
  status: 'Published' | 'Draft' | 'Pending';
  tags: string[];
  features: string[];
  created_at: string;
  updated_at: string;
  category?: Category;
};

export type AINews = {
  id: string;
  title: string;
  description: string;
  source_url: string;
  source_name: string;
  publication_date: string;
  featured: boolean;
  created_at: string;
};

export type ToolReview = {
  id: string;
  tool_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
};

export type ToolSubmission = {
  id: string;
  name: string;
  category: string;
  description: string;
  website_url: string;
  logo_url: string;
  pricing_type: string;
  submitter_email: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
};
