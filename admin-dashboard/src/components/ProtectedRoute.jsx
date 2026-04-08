import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ children }) => {
  const admin = useAuthStore((state) => state.admin);
  return admin ? children : <Navigate to="/login" />;
}; 