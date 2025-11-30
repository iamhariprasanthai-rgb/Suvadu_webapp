import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Landing Page
import LandingPage from './pages/LandingPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard
import DashboardPage from './pages/DashboardPage';

// Separation Pages
import SeparationListPage from './pages/separations/SeparationListPage';
import SeparationDetailPage from './pages/separations/SeparationDetailPage';
import CreateSeparationPage from './pages/separations/CreateSeparationPage';

// Manager Pages
import PendingSignoffsPage from './pages/manager/PendingSignoffsPage';
import TeamViewPage from './pages/manager/TeamViewPage';

// Admin Pages
import UsersPage from './pages/admin/UsersPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import TemplatesPage from './pages/admin/TemplatesPage';
import ReportsPage from './pages/admin/ReportsPage';

// Settings
import SettingsPage from './pages/SettingsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({
  children,
  roles,
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Separation Cases */}
        <Route path="/separations" element={<SeparationListPage />} />
        <Route path="/separations/new" element={<CreateSeparationPage />} />
        <Route path="/separations/:id" element={<SeparationDetailPage />} />

        {/* Manager Routes */}
        <Route
          path="/signoffs"
          element={
            <ProtectedRoute roles={['direct_manager', 'department_manager', 'separation_manager']}>
              <PendingSignoffsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRoute roles={['direct_manager', 'department_manager', 'separation_manager']}>
              <TeamViewPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['separation_manager']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute roles={['separation_manager']}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/templates"
          element={
            <ProtectedRoute roles={['separation_manager']}>
              <TemplatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={['separation_manager']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Landing Page - Public */}
      <Route path="/" element={<LandingPage />} />
      
      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
