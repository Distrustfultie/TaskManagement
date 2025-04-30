import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import SettingsPage from './pages/dashboard/SettingPage';
import ToastNotifications from './components/notifications/ToastNotifications';
import OverviewPage from './pages/dashboard/OverviewPage';
import CalendarPage from './pages/dashboard/CalendarPage';
import MyTasksPage from './pages/dashboard/MyTasksPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import CreateTask from './pages/CreateTask';
import EditTask from './pages/EditTask';
import TaskDetails from './pages/TaskDetails';


const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastNotifications />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<OverviewPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="tasks" element={<MyTasksPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="create-task" element={<CreateTask />} />
          <Route path="edit-task/:id" element={<EditTask />} />
          <Route path="task-details/:id" element={<TaskDetails />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}