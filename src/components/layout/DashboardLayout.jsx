import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  User,
  BarChart3
} from 'lucide-react';

export default function DashboardLayout() {
  const { userProfile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Inquiries', icon: LayoutDashboard },
    { path: '/apps', label: 'App Library', icon: BookOpen },
    { path: '/stats', label: 'My Stats', icon: BarChart3 },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: Settings });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src="/orbit-logo.png" alt="FinalApps Orbit" className="w-10 h-10 object-contain" />
              <h1 className="text-xl font-bold text-gray-900">FinalApps Orbit</h1>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{userProfile?.role}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-finalapps-blue text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
