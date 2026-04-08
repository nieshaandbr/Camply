import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CreatePostPage from './pages/posts/CreatePostPage';
import ApplicationListPage from './pages/applications/ApplicationListPage';
import { ProtectedRoute } from './components/ProtectedRoute';

// 🛠 Layout Component: The "Shell" of your dashboard
const Layout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <main style={{ 
      marginLeft: '260px', // Prevents content from being hidden behind Sidebar
      flex: 1, 
      padding: '40px', 
      backgroundColor: '#f9fafb' 
    }}>
      {children}
    </main>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* All these routes are wrapped in Layout to keep Sidebar visible */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
        <Route path="/create-post" element={<ProtectedRoute><Layout><CreatePostPage /></Layout></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><Layout><ApplicationListPage /></Layout></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}