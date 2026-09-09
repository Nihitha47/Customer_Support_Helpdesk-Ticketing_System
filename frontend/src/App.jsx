import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerTickets from './pages/customer/CustomerTickets';
import CreateTicket from './pages/customer/CreateTicket';
import CustomerTicketDetails from './pages/customer/CustomerTicketDetails';
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentTicketQueue from './pages/agent/AgentTicketQueue';
import AgentTicketDetails from './pages/agent/AgentTicketDetails';
import AgentWorkload from './pages/agent/AgentWorkload';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerTickets from './pages/manager/ManagerTickets';
import ManagerTicketDetails from './pages/manager/ManagerTicketDetails';
import ManagerCategories from './pages/manager/ManagerCategories';
import ManagerAnalytics from './pages/manager/ManagerAnalytics';

const RedirectToHome = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'customer') return <Navigate to="/customer" replace />;
  if (user.role === 'agent') return <Navigate to="/agent" replace />;
  if (user.role === 'manager') return <Navigate to="/manager" replace />;
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/" element={<RedirectToHome />} />

    <Route element={<DashboardLayout />}>
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/tickets"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/create"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CreateTicket />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerTicketDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agent"
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/tickets"
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <AgentTicketQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <AgentTicketDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/workload"
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <AgentWorkload />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/tickets"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/tickets/:id"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerTicketDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/categories"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/workload"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <AgentWorkload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/analytics"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerAnalytics />
          </ProtectedRoute>
        }
      />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
