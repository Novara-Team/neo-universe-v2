const ADMIN_PASSWORD = '20102010';
const ADMIN_SESSION_KEY = 'ai_universe_admin_session';

export const authenticateAdmin = (password: string): boolean => {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return true;
  }
  return false;
};

export const isAdminAuthenticated = (): boolean => {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
};

export const logoutAdmin = (): void => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
};
