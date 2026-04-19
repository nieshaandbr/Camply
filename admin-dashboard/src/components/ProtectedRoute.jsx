import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute({ children }) {
  const { admin, isLoading, loadSession } = useAuthStore();

  // On first render, restore saved admin session from localStorage.
  useEffect(() => {
    loadSession();
  }, []);

  // While checking localStorage, do not redirect yet.
  if (isLoading) {
    return (
      <div style={styles.loaderPage}>
        <div style={styles.loaderCard}>Loading session...</div>
      </div>
    );
  }

  // If no admin exists after loading, send user to login.
  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const styles = {
  loaderPage: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f9fafb',
  },
  loaderCard: {
    background: '#fff',
    padding: '18px 24px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    color: '#374151',
    fontWeight: '600',
  },
};
