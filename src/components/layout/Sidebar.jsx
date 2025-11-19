import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Users,
  AppWindow,
  BookOpen,
  Settings,
  Shield,
  User,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Team overview & metrics',
  },
  {
    title: 'Inquiries',
    href: '/inquiries',
    icon: Inbox,
    description: 'Manage all inquiries',
  },
  {
    title: 'Employees',
    href: '/employees',
    icon: Users,
    description: 'Team members & performance',
  },
  {
    title: 'Apps Library',
    href: '/apps',
    icon: AppWindow,
    description: 'FinalApps documentation',
  },
  {
    title: 'Knowledge Base',
    href: '/knowledge',
    icon: BookOpen,
    description: 'Internal documentation',
  },
];

const bottomItems = [
  {
    title: 'Admin Panel',
    href: '/admin',
    icon: Shield,
    description: 'System administration',
    adminOnly: true,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App preferences',
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Your profile',
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const NavItem = ({ item }) => {
    const active = isActive(item.href);

    if (item.adminOnly && !isAdmin) {
      return null;
    }

    const Icon = item.icon;

    return (
      <Link to={item.href}>
        <div
          className={cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100',
            active && 'bg-blue-50 text-blue-600 hover:bg-blue-50',
            !active && 'text-gray-700 hover:text-gray-900'
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5 shrink-0',
              active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
            )}
          />
          {!collapsed && (
            <div className="flex-1 truncate">
              <div className="truncate">{item.title}</div>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">FO</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">FinalApps Orbit</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard" className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">FO</span>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn('h-8 w-8 p-0', collapsed && 'ml-auto')}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform',
              collapsed && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          {bottomItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>
      </ScrollArea>

      {/* User Info at Bottom */}
      {!collapsed && (
        <div className="border-t border-gray-200 p-4">
          <div className="text-xs text-gray-500">
            FinalApps Orbit v1.0
          </div>
        </div>
      )}
    </div>
  );
}
