import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Trophy, Clock, Target, TrendingUp, Award, AlertCircle } from 'lucide-react';

export default function StatsPage() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [replies, setReplies] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      fetchStats();
      fetchReplies();
      fetchLeaderboard();
    }
  }, [userProfile]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userProfile.id)
        .single();

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('replies')
        .select(`
          *,
          inquiry:inquiries(title, category, created_at)
        `)
        .eq('user_id', userProfile.id)
        .order('replied_at', { ascending: false });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('active', true)
        .order('total_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading stats...</p>
      </div>
    );
  }

  // Calculate performance metrics
  const recentReplies = replies.slice(0, 10);
  const avgScoreRecent = recentReplies.length > 0
    ? (recentReplies.reduce((sum, r) => sum + r.score_total, 0) / recentReplies.length).toFixed(1)
    : 0;

  // Prepare chart data
  const speedData = recentReplies.map((reply, idx) => ({
    name: `Reply ${recentReplies.length - idx}`,
    speed: reply.score_speed,
  })).reverse();

  const scoreDistribution = [
    { name: 'Speed', value: stats?.total_score ? (replies.reduce((sum, r) => sum + r.score_speed, 0) / replies.length).toFixed(0) : 0 },
    { name: 'Quality', value: stats?.total_score ? (replies.reduce((sum, r) => sum + r.score_quality, 0) / replies.length).toFixed(0) : 0 },
    { name: 'Outcome', value: stats?.total_score ? (replies.reduce((sum, r) => sum + r.score_outcome, 0) / replies.length).toFixed(0) : 0 },
  ];

  const categoryBreakdown = {};
  replies.forEach((reply) => {
    const category = reply.inquiry?.category || 'Uncategorized';
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
  });

  const categoryData = Object.entries(categoryBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const userRank = leaderboard.findIndex((u) => u.id === userProfile.id) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Performance</h1>
        <p className="text-gray-600 mt-2">
          Track your stats, scores, and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Score</p>
                <p className="text-3xl font-bold text-finalapps-blue">
                  {stats?.total_score || 0}
                </p>
              </div>
              <Trophy className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Reply Time</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.avg_reply_time || 0}m
                </p>
              </div>
              <Clock className="h-10 w-10 text-finalapps-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Replies</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.total_replied || 0}
                </p>
              </div>
              <Target className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Missed</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats?.total_missed || 0}
                </p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speed Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Speed Score Trend</CardTitle>
            <CardDescription>Your last 10 replies</CardDescription>
          </CardHeader>
          <CardContent>
            {speedData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={speedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="speed"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ fill: '#2563EB', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No reply data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Average scores by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Replies by Category</CardTitle>
            <CardDescription>Distribution of your replies</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
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
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No category data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>
              Your rank: #{userRank > 0 ? userRank : 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((user, idx) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    user.id === userProfile.id
                      ? 'bg-finalapps-blue bg-opacity-10 border-2 border-finalapps-blue'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {idx === 0 && <Trophy className="h-6 w-6 text-yellow-500" />}
                      {idx === 1 && <Award className="h-6 w-6 text-gray-400" />}
                      {idx === 2 && <Award className="h-6 w-6 text-orange-600" />}
                      {idx > 2 && <span className="text-gray-600 font-bold">{idx + 1}</span>}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name}
                        {user.id === userProfile.id && (
                          <span className="text-finalapps-blue ml-2 text-sm">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.total_replied} replies • {user.avg_reply_time}m avg
                      </p>
                    </div>
                  </div>
                  <Badge variant="primary">{user.total_score} pts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Replies */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Replies</CardTitle>
          <CardDescription>Your last 10 replies with scores</CardDescription>
        </CardHeader>
        <CardContent>
          {recentReplies.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No replies yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                    <th className="pb-3 font-medium">Inquiry</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Speed</th>
                    <th className="pb-3 font-medium">Quality</th>
                    <th className="pb-3 font-medium">Outcome</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReplies.map((reply) => (
                    <tr key={reply.id} className="border-b border-gray-100">
                      <td className="py-3 font-medium text-gray-900 max-w-xs truncate">
                        {reply.inquiry?.title}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {reply.inquiry?.category || '-'}
                      </td>
                      <td className="py-3">
                        <Badge variant="default">{reply.score_speed}</Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant="default">{reply.score_quality}</Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant="default">{reply.score_outcome}</Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant="primary">{reply.score_total}</Badge>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {new Date(reply.replied_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
