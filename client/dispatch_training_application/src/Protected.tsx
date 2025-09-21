// src/routes/Protected.tsx
import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from './contexts/AuthProvider';
import HomeLayout from './HomeLayout';
import { UniversalProvider } from './contexts/UniversalHelpers';
export function Protected() {
  const { token } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" replace  />;
  return (
    <UniversalProvider>
      <HomeLayout />
    </UniversalProvider>
  );
}

