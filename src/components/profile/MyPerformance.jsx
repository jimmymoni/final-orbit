import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
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
import { Trophy, Clock, Target, TrendingUp } from 'lucide-react';
import { formatDate, timeAgo } from '../../lib/utils';

export default function MyPerformance({ userProfile, stats, replies = [], leaderboard = [] }) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading performance data...</p>
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

  const userRank = leaderboard.findIndex((u) => u.id === userProfile?.id) + 1;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Score</p>
                <p className="text-3xl font-bold text-blue-600">
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
              <Clock className="h-10 w-10 text-blue-600" />
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
                <p className="text-sm text-gray-600">Leaderboard Rank</p>
                <p className="text-3xl font-bold text-purple-600">
                  #{userRank || '-'}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speed Score Trend */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Speed Score Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={speedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="speed" stroke="#2563EB" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Average Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Replies by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name} (${entry.value})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Replies */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Recent Replies</h3>
          <div className="space-y-3">
            {recentReplies.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No replies yet</p>
            ) : (
              recentReplies.map((reply) => (
                <div
                  key={reply.id}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {reply.inquiry?.title || 'Untitled Inquiry'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {reply.inquiry?.category && (
                        <Badge variant="outline" className="mr-2">
                          {reply.inquiry.category}
                        </Badge>
                      )}
                      Replied {timeAgo(reply.replied_at)}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-blue-600">{reply.score_total}</div>
                    <div className="text-xs text-gray-500">
                      {reply.score_speed}s · {reply.score_quality}q · {reply.score_outcome}o
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium">Average Recent Score</p>
              <p className="text-xl font-bold">{avgScoreRecent}</p>
            </div>
            <div>
              <p className="font-medium">Total Inquiries Handled</p>
              <p className="text-xl font-bold">{stats.total_replied + stats.total_missed}</p>
            </div>
            <div>
              <p className="font-medium">Success Rate</p>
              <p className="text-xl font-bold">
                {stats.total_replied + stats.total_missed > 0
                  ? ((stats.total_replied / (stats.total_replied + stats.total_missed)) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
