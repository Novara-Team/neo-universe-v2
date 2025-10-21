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
  theme: 'dark',
  primary_color: '#06b6d4',
  accent_color: '#0891b2',
  font_size: 'medium',
  reduced_motion: false,
};

export const THEME_COLORS = [
  { name: 'Default', primary: '#06b6d4', accent: '#0891b2', gradient: 'from-cyan-500 to-blue-500' },
  { name: 'Orange', primary: '#f97316', accent: '#fb923c', gradient: 'from-orange-500 to-amber-500' },
  { name: 'Green', primary: '#10b981', accent: '#14b8a6', gradient: 'from-green-500 to-teal-500' },
  { name: 'Purple', primary: '#a855f7', accent: '#c084fc', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Red', primary: '#ef4444', accent: '#f87171', gradient: 'from-red-500 to-orange-500' },
  { name: 'Blue', primary: '#3b82f6', accent: '#60a5fa', gradient: 'from-blue-500 to-indigo-500' },
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

  if (preferences.primary_color && preferences.accent_color) {
    root.style.setProperty('--color-primary', preferences.primary_color);
    root.style.setProperty('--color-accent', preferences.accent_color);

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const primaryRgb = hexToRgb(preferences.primary_color);
    const accentRgb = hexToRgb(preferences.accent_color);

    if (primaryRgb) {
      root.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);

      root.style.setProperty('--color-primary-50', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.05)`);
      root.style.setProperty('--color-primary-100', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`);
      root.style.setProperty('--color-primary-200', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)`);
      root.style.setProperty('--color-primary-500', preferences.primary_color);
    }

    if (accentRgb) {
      root.style.setProperty('--color-accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
    }

    const styleElement = document.getElementById('dynamic-theme-styles') || document.createElement('style');
    styleElement.id = 'dynamic-theme-styles';
    styleElement.textContent = `
      .bg-gradient-to-r.from-cyan-500, .bg-gradient-to-r.from-cyan-500.to-blue-500 { background-image: linear-gradient(to right, ${preferences.primary_color}, ${preferences.accent_color}) !important; }
      .bg-gradient-to-r.from-cyan-600, .bg-gradient-to-r.from-cyan-600.to-blue-600 { background-image: linear-gradient(to right, ${preferences.primary_color}, ${preferences.accent_color}) !important; }
      .from-cyan-400, .bg-gradient-to-r.from-cyan-400 { --tw-gradient-from: ${preferences.primary_color} !important; }
      .to-blue-500, .bg-gradient-to-r.to-blue-500 { --tw-gradient-to: ${preferences.accent_color} !important; }
      .text-cyan-400 { color: ${preferences.primary_color} !important; }
      .text-cyan-500 { color: ${preferences.primary_color} !important; }
      .border-cyan-500 { border-color: ${preferences.primary_color} !important; }
      .bg-cyan-500\\/10 { background-color: var(--color-primary-100) !important; }
      .bg-cyan-500\\/20 { background-color: var(--color-primary-200) !important; }
      .hover\\:text-cyan-300:hover { color: ${preferences.accent_color} !important; }
      .hover\\:text-cyan-400:hover { color: ${preferences.primary_color} !important; }
      .hover\\:border-cyan-500:hover { border-color: ${preferences.primary_color} !important; }
      .hover\\:border-cyan-500\\/50:hover { border-color: var(--color-primary-200) !important; }
      .hover\\:from-cyan-600:hover { --tw-gradient-from: ${preferences.primary_color} !important; }
      .hover\\:to-blue-600:hover { --tw-gradient-to: ${preferences.accent_color} !important; }
      .shadow-cyan-500\\/30, .shadow-cyan-500\\/50 { box-shadow: 0 20px 25px -5px var(--color-primary-50), 0 8px 10px -6px var(--color-primary-100) !important; }
      .from-cyan-900\\/20 { --tw-gradient-from: var(--color-primary-100) !important; }
      .border-t-cyan-400 { border-top-color: ${preferences.primary_color} !important; }
      .bg-gradient-to-b.from-slate-950, .bg-gradient-to-br.from-slate-50 { background-color: ${preferences.theme === 'light' ? '#f8fafc' : '#020617'} !important; }
    `;
    if (!document.getElementById('dynamic-theme-styles')) {
      document.head.appendChild(styleElement);
    }
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
