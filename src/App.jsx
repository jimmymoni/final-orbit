import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import TeamDashboard from './pages/TeamDashboard';
import InquiryDashboard from './pages/InquiryDashboard';
import InquiryDetailPage from './pages/InquiryDetailPage';
import AppLibraryPage from './pages/AppLibraryPage';
import StatsPage from './pages/StatsPage';
import AdminPage from './pages/AdminPage';

// Layout
import AppLayout from './components/layout/AppLayout';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes - All use new AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<TeamDashboard />} />
              <Route path="/inquiries" element={<InquiryDashboard />} />
              <Route path="/inquiry/:id" element={<InquiryDetailPage />} />
              <Route path="/employees" element={<StatsPage />} />
              <Route path="/apps" element={<AppLibraryPage />} />
              <Route path="/apps/:id" element={<AppLibraryPage />} />
              <Route path="/knowledge" element={<StatsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/settings" element={<StatsPage />} />
              <Route path="/profile" element={<StatsPage />} />
            </Route>

            {/* Catch all - redirect to dashboard if logged in, otherwise home */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
