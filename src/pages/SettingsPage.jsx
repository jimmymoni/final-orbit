import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { Bell, Moon, Sun, Globe, Lock, Mail } from 'lucide-react';

export default function SettingsPage() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [inquiryAlerts, setInquiryAlerts] = useState(true);
  const [performanceReports, setPerformanceReports] = useState(false);

  // Theme settings
  const [darkMode, setDarkMode] = useState(false);

  // Language settings
  const [language, setLanguage] = useState('en');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Email change
  const [newEmail, setNewEmail] = useState('');

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // In a real app, you'd save these to a user_settings table
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Notification preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail) {
      toast.error('Please enter a new email address');
      return;
    }

    if (newEmail === userProfile?.email) {
      toast.error('This is already your current email');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast.success('Verification email sent! Please check your inbox.');
      setNewEmail('');
    } catch (error) {
      toast.error(error.message || 'Failed to change email');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = (checked) => {
    setDarkMode(checked);
    // In a real app, you'd apply the theme to the document
    toast.info(checked ? 'Dark mode enabled (coming soon)' : 'Light mode enabled');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your application preferences and account settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive browser push notifications
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="inquiry-alerts">Inquiry Alerts</Label>
                <p className="text-sm text-gray-500">
                  Get notified when new inquiries are assigned to you
                </p>
              </div>
              <Switch
                id="inquiry-alerts"
                checked={inquiryAlerts}
                onCheckedChange={setInquiryAlerts}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="performance-reports">Performance Reports</Label>
                <p className="text-sm text-gray-500">
                  Receive weekly performance summaries
                </p>
              </div>
              <Switch
                id="performance-reports"
                checked={performanceReports}
                onCheckedChange={setPerformanceReports}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveNotifications} disabled={loading}>
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {darkMode ? <Moon className="h-5 w-5 text-blue-600" /> : <Sun className="h-5 w-5 text-blue-600" />}
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize how the application looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-gray-500">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleThemeToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <CardTitle>Language & Region</CardTitle>
            </div>
            <CardDescription>
              Set your preferred language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Manage your password and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-900">Change Password</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Change */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <CardTitle>Email Address</CardTitle>
            </div>
            <CardDescription>
              Update your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Email</Label>
              <Input value={userProfile?.email || ''} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
              />
            </div>
            <Button onClick={handleChangeEmail} disabled={loading}>
              {loading ? 'Updating...' : 'Update Email'}
            </Button>
            <p className="text-xs text-gray-500">
              You will receive a verification email at your new address
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
