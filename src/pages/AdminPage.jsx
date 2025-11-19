import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Users, BookOpen, Settings, Activity } from 'lucide-react';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchApps();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApps = async () => {
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('name');

      if (error) throw error;
      setApps(data || []);
    } catch (error) {
      console.error('Error fetching apps:', error);
    }
  };

  const toggleUserActive = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user:', error);
      alert('Error updating user status');
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You do not have admin access</p>
      </div>
    );
  }

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'apps', label: 'Apps', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">
          Manage users, apps, and system settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-finalapps-blue text-finalapps-blue'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage team members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Stats</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100">
                        <td className="py-4 font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="py-4 text-gray-600 text-sm">
                          {user.email}
                        </td>
                        <td className="py-4">
                          <Badge variant={user.role === 'admin' ? 'primary' : 'default'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Badge variant={user.active ? 'success' : 'danger'}>
                            {user.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {user.total_replied} replies • {user.total_score} pts
                        </td>
                        <td className="py-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserActive(user.id, user.active)}
                          >
                            {user.active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'apps' && (
        <Card>
          <CardHeader>
            <CardTitle>FinalApps Library</CardTitle>
            <CardDescription>
              Manage app documentation and details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apps.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No apps added yet</p>
                <Button className="mt-4" onClick={() => alert('Add app functionality coming soon')}>
                  Add First App
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{app.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{app.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={
                            app.status === 'active' ? 'success' :
                            app.status === 'updating' ? 'warning' : 'danger'
                          }>
                            {app.status}
                          </Badge>
                          {app.pricing && (
                            <Badge variant="outline">{app.pricing}</Badge>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure round-robin, bandwidth, and escalation rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Default Bandwidth (minutes)
              </label>
              <Input type="number" defaultValue="240" />
              <p className="text-xs text-gray-500 mt-1">
                Default time allowed for responses before escalation
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Escalation Notification
              </label>
              <Input type="email" placeholder="slack-webhook-url@company.com" />
              <p className="text-xs text-gray-500 mt-1">
                Email or webhook for escalation notifications
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Round-Robin Mode
              </label>
              <select className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                <option>Least Recently Assigned</option>
                <option>Equal Distribution</option>
                <option>Lowest Workload</option>
              </select>
            </div>

            <Button className="mt-4">Save Settings</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              System-wide activity log
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-12 text-gray-500">
              Activity log coming soon
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
