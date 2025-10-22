import { supabase } from './supabase';

const ADMIN_SESSION_KEY = 'ai_universe_admin_session';
const ADMIN_EMAIL = 'mohamed1abou2020@gmail.com';

export const authenticateAdmin = async (email: string, password: string): Promise<boolean> => {
  if (email !== ADMIN_EMAIL) {
    return false;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error && data.user) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return true;
  }
  return false;
};

export const isAdminAuthenticated = (): boolean => {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
};

export const logoutAdmin = async (): Promise<void> => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  await supabase.auth.signOut();
};
