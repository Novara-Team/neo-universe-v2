import { supabase } from './supabase';

export interface AppearancePreferences {
  id?: string;
  user_id: string;
  theme: 'light' | 'dark' | 'auto';
  primary_color: string;
  accent_color: string;
  font_size: 'small' | 'medium' | 'large';
  reduced_motion: boolean;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_PREFERENCES: Omit<AppearancePreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  theme: 'light',
  primary_color: '#3b82f6',
  accent_color: '#06b6d4',
  font_size: 'medium',
  reduced_motion: false,
};

export const THEME_COLORS = [
  { name: 'Blue', primary: '#3b82f6', accent: '#06b6d4' },
  { name: 'Green', primary: '#10b981', accent: '#14b8a6' },
  { name: 'Red', primary: '#ef4444', accent: '#f59e0b' },
  { name: 'Orange', primary: '#f97316', accent: '#f59e0b' },
  { name: 'Pink', primary: '#ec4899', accent: '#a855f7' },
  { name: 'Slate', primary: '#64748b', accent: '#475569' },
];

export async function getUserAppearancePreferences(userId: string): Promise<AppearancePreferences | null> {
  const { data, error } = await supabase
    .from('user_appearance_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching appearance preferences:', error);
    return null;
  }

  return data;
}

export async function saveAppearancePreferences(
  userId: string,
  preferences: Partial<AppearancePreferences>
): Promise<{ success: boolean; error?: string }> {
  const existingPrefs = await getUserAppearancePreferences(userId);

  if (existingPrefs) {
    const { error } = await supabase
      .from('user_appearance_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating appearance preferences:', error);
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from('user_appearance_preferences')
      .insert({
        user_id: userId,
        ...DEFAULT_PREFERENCES,
        ...preferences,
      });

    if (error) {
      console.error('Error creating appearance preferences:', error);
      return { success: false, error: error.message };
    }
  }

  const finalPrefs = { ...DEFAULT_PREFERENCES, ...preferences };
  applyAppearancePreferences(finalPrefs);

  return { success: true };
}

export function applyAppearancePreferences(preferences: Partial<AppearancePreferences>): void {
  const root = document.documentElement;

  if (preferences.theme) {
    if (preferences.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', preferences.theme === 'dark');
    }
  }

  if (preferences.primary_color) {
    root.style.setProperty('--color-primary', preferences.primary_color);
  }

  if (preferences.accent_color) {
    root.style.setProperty('--color-accent', preferences.accent_color);
  }

  if (preferences.font_size) {
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[preferences.font_size]);
  }

  if (preferences.reduced_motion !== undefined) {
    root.style.setProperty('--transition-duration', preferences.reduced_motion ? '0ms' : '150ms');
  }
}

export async function initializeAppearancePreferences(userId: string): Promise<void> {
  const preferences = await getUserAppearancePreferences(userId);
  if (preferences) {
    applyAppearancePreferences(preferences);
  } else {
    applyAppearancePreferences(DEFAULT_PREFERENCES);
  }
}
