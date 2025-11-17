import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;
}
