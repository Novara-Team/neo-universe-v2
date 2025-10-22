const ADMIN_SESSION_KEY = 'ai_universe_admin_session';
const ADMIN_USERNAME = 'NeoUniverseAdmin';
const ADMIN_PASSWORD = 'Bomoxhmtk2010';

export const authenticateAdmin = async (username: string, password: string): Promise<boolean> => {
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return false;
  }

  sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
  return true;
};

export const isAdminAuthenticated = (): boolean => {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
};

export const logoutAdmin = async (): Promise<void> => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
};
