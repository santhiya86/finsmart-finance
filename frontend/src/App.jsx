import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Reports from './pages/Reports';
import BudgetTracker from './pages/BudgetTracker';
import ExportData from './pages/ExportData';
import RecurringTransactions from './pages/RecurringTransactions';
import AIInsights from './pages/AIInsights';
import GoalPlanner from './pages/GoalPlanner';

import Sidebar from './components/Sidebar';

const PrivateLayout = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  );
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateLayout><Dashboard /></PrivateLayout>} />
      <Route path="/add" element={<PrivateLayout><AddExpense /></PrivateLayout>} />
      <Route path="/edit/:id" element={<PrivateLayout><AddExpense /></PrivateLayout>} />
      <Route path="/reports" element={<PrivateLayout><Reports /></PrivateLayout>} />
      <Route path="/budget" element={<PrivateLayout><BudgetTracker /></PrivateLayout>} />
      <Route path="/goals" element={<PrivateLayout><GoalPlanner /></PrivateLayout>} />
      <Route path="/recurring" element={<PrivateLayout><RecurringTransactions /></PrivateLayout>} />
      
      <Route path="/export" element={<PrivateLayout><ExportData /></PrivateLayout>} />
      <Route path="/ai-insights" element={<PrivateLayout><AIInsights /></PrivateLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
