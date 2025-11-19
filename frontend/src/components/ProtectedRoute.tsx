import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

/**
 * Check if the user is authenticated.
 * It simply verifies whether a JWT token is stored in localStorage.
 *
 * @returns {boolean} `true` if a token exists, otherwise `false`
 */
function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

/**
 * ProtectedRoute
 * ----------------
 * A React component to guard routes that require authentication.
 * If the user is logged in (i.e., token is present), it renders `children`.
 * Otherwise, it redirects them to the login page ("/").
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  // If user is authenticated, render the protected component(s)
  if (isAuthenticated()) {
    return <>{children}</>;
  }

  // Otherwise, redirect to the login/home page
  return <Navigate to="/" replace />;
}
