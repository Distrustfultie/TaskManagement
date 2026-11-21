import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { LogoMark } from "./components/ui/Logo";

import DashboardLayout from "./layouts/DashboardLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

import SettingsPage from "./pages/dashboard/SettingPage";
import OverviewPage from "./pages/dashboard/OverviewPage";
import CalendarPage from "./pages/dashboard/CalendarPage";
import MyTasksPage from "./pages/dashboard/MyTasksPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import ProjectPage from "./pages/dashboard/ProjectPage";
import InsightsPage from "./pages/dashboard/InsightsPage";
import HabitsPage from "./pages/dashboard/HabitsPage";

function AppLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas" role="status">
      <div className="animate-pulse">
        <LogoMark size={40} />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AppLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AppLoader />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
      <Route path="/forgot-password" element={<AuthRoute><ForgotPasswordPage /></AuthRoute>} />
      <Route path="/reset-password" element={<AuthRoute><ResetPasswordPage /></AuthRoute>} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="tasks" element={<MyTasksPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="projects/:id" element={<ProjectPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="habits" element={<HabitsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
