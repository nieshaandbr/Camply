import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CreatePostPage from './pages/posts/CreatePostPage';
import ApplicationListPage from './pages/applications/ApplicationListPage';
import ViewPostHistoryPage from './pages/posts/ViewPostHistoryPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminQuestionnairesPage from './pages/questionnaires/AdminQuestionnairesPage';

// Super Admin
import SuperAdminLoginPage from './pages/super-admin/SuperAdminLoginPage';
import SuperAdminDashboardPage from './pages/super-admin/SuperAdminDashboardPage';
import UniversitiesPage from './pages/super-admin/UniversitiesPage';
import EditUniversityPage from './pages/super-admin/EditUniversityPage';
import PilotOnboardingPage from './pages/super-admin/PilotOnboardingPage';
import QuestionnairesPage from './pages/super-admin/QuestionnairesPage';
import QuestionnaireDetailPage from './pages/super-admin/QuestionnaireDetailPage';
import SuperAdminLayout from './components/super-admin/SuperAdminLayout';

const Layout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <main
      style={{
        marginLeft: '260px',
        flex: 1,
        padding: '40px',
        backgroundColor: '#f9fafb',
      }}
    >
      {children}
    </main>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-post"
          element={
            <ProtectedRoute>
              <Layout>
                <CreatePostPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Layout>
                <ApplicationListPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/post-history"
          element={
            <ProtectedRoute>
              <Layout>
                <ViewPostHistoryPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-questionnaires"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminQuestionnairesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />

        <Route
          path="/super-admin/dashboard"
          element={
            <SuperAdminLayout>
              <SuperAdminDashboardPage />
            </SuperAdminLayout>
          }
        />

        <Route
          path="/super-admin/universities"
          element={
            <SuperAdminLayout>
              <UniversitiesPage />
            </SuperAdminLayout>
          }
        />

        <Route
          path="/super-admin/universities/:id"
          element={
            <SuperAdminLayout>
              <EditUniversityPage />
            </SuperAdminLayout>
          }
        />

        <Route
          path="/super-admin/pilot-onboarding"
          element={
            <SuperAdminLayout>
              <PilotOnboardingPage />
            </SuperAdminLayout>
          }
        />

        <Route
          path="/super-admin/questionnaires"
          element={
            <SuperAdminLayout>
              <QuestionnairesPage />
            </SuperAdminLayout>
          }
        />

        <Route
          path="/super-admin/questionnaires/:id"
          element={
            <SuperAdminLayout>
              <QuestionnaireDetailPage />
            </SuperAdminLayout>
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}