import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated } from '../lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/adminpn" replace />;
  }

  return <>{children}</>;
}
