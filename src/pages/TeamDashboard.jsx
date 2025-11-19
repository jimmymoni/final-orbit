import { useState } from 'react';
import {
  Users,
  Inbox,
  Clock,
  AlertTriangle,
  CheckCircle,
  Trophy,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useInquiries,
  useInquiryStats,
  useUsersWithWorkload,
  useLeaderboard,
} from '@/hooks';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function TeamDashboard() {
  const { data: inquiries, isLoading: loadingInquiries } = useInquiries();
  const { data: stats, isLoading: loadingStats } = useInquiryStats();
  const { data: users, isLoading: loadingUsers } = useUsersWithWorkload();
  const { data: leaderboard, isLoading: loadingLeaderboard } = useLeaderboard(5);

  // Calculate metrics
  const thisWeekInquiries = inquiries?.filter((inq) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(inq.created_at) >= weekAgo;
  }).length || 0;

  const totalReplies = stats?.byStatus?.replied || 0;
  const avgReplyTime = users?.reduce((sum, user) => sum + (user.avg_reply_time || 0), 0) / (users?.length || 1) || 0;
  const totalEscalations = stats?.byStatus?.escalated || 0;
  const activeEmployees = users?.filter(u => u.active).length || 0;

  // Prepare chart data
  const inquiriesPerEmployee = users?.map(user => ({
    name: user.name.split(' ')[0],
    count: user.current_workload,
  })) || [];

  const categoryData = stats?.byCategory ? Object.entries(stats.byCategory).map(([name, value]) => ({
    name,
    value,
  })) : [];

  // Mock trend data - replace with real data
  const trendData = [
    { day: 'Mon', avgTime: 145 },
    { day: 'Tue', avgTime: 132 },
    { day: 'Wed', avgTime: 158 },
    { day: 'Thu', avgTime: 120 },
    { day: 'Fri', avgTime: 110 },
    { day: 'Sat', avgTime: 165 },
    { day: 'Sun', avgTime: 140 },
  ];

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loadingInquiries || loadingStats || loadingUsers) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of team performance and workload</p>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Inquiries This Week"
          value={thisWeekInquiries}
          icon={Inbox}
          color="blue"
        />
        <StatCard
          title="Total Replies"
          value={totalReplies}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Avg Reply Time"
          value={formatMinutes(Math.round(avgReplyTime))}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Escalations"
          value={totalEscalations}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Active Employees"
          value={activeEmployees}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Team Member Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users?.map((user) => (
              <div
                key={user.id}
                className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-sm"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className="text-xs mt-1">
                        {user.role}
                      </Badge>
                    </div>
                    <div className={`h-2 w-2 rounded-full ${user.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Assigned:</span>
                      <span className="font-medium">{user.current_workload}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Score:</span>
                      <span className="font-medium text-blue-600">{user.total_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Missed:</span>
                      <span className="font-medium text-red-600">{user.total_missed}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Inquiries per Employee */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Current Workload Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inquiriesPerEmployee}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reply Speed Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Avg Reply Time Trend (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avgTime"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ fill: '#2563EB', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard?.map((user, index) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">
                      {user.total_replied} replies • {formatMinutes(user.avg_reply_time)} avg
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{user.total_score}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`rounded-full p-3 ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    </div>
  );
}
