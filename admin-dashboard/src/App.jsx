import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CreatePostPage from './pages/posts/CreatePostPage';
import ApplicationListPage from './pages/applications/ApplicationListPage';
import ViewPostHistoryPage from './pages/posts/ViewPostHistoryPage';
import { ProtectedRoute } from './components/ProtectedRoute';

// Super Admin Pages
import SuperAdminLoginPage from './pages/super-admin/SuperAdminLoginPage';
import SuperAdminDashboardPage from './pages/super-admin/SuperAdminDashboardPage';
import UniversitiesPage from './pages/super-admin/UniversitiesPage';
import EditUniversityPage from './pages/super-admin/EditUniversityPage';

// Page for first login to set up admin account
import ChangePasswordPage from './pages/auth/ChangePasswordPage'

// Temporary page for onboarding pilot universities and students
import PilotOnboardingPage from './pages/super-admin/PilotOnboardingPage';

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
          {/* First login page to set up admin account */}
          <Route path="/change-password" element={<ChangePasswordPage />}/>
        
        {/* All these routes are wrapped in Layout to keep Sidebar visible */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
        <Route path="/create-post" element={<ProtectedRoute><Layout><CreatePostPage /></Layout></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><Layout><ApplicationListPage /></Layout></ProtectedRoute>} />
        <Route path="/post-history" element={<ProtectedRoute><Layout><ViewPostHistoryPage /></Layout></ProtectedRoute>} />
        {/* Super Admin Routes */}
        <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboardPage />} />
        <Route path="/super-admin/universities" element={<UniversitiesPage />} />
        <Route path="/super-admin/universities/:id" element={<EditUniversityPage />} />

        {/* Pilot on boarding temporary route */}
        <Route path="/super-admin/pilot-onboarding" element={<PilotOnboardingPage />} />
      
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}