import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, MessageSquare, MapPin, Heart, AlertTriangle, Target } from 'lucide-react';

export default function TrendsDashboardPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching trends data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate trending topics
  const categoryFrequency = {};
  inquiries.forEach((inq) => {
    const cat = inq.category || 'Uncategorized';
    categoryFrequency[cat] = (categoryFrequency[cat] || 0) + 1;
  });

  const trendingTopics = Object.entries(categoryFrequency)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate sentiment trends (mock data - would be from AI analysis)
  const sentimentTrends = [
    { date: 'Week 1', positive: 65, neutral: 25, negative: 10 },
    { date: 'Week 2', positive: 70, neutral: 20, negative: 10 },
    { date: 'Week 3', positive: 60, neutral: 30, negative: 10 },
    { date: 'Week 4', positive: 75, neutral: 18, negative: 7 },
  ];

  // Issue frequency over time
  const issueFrequency = inquiries.reduce((acc, inq) => {
    const date = new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ date, count: 1 });
    }
    return acc;
  }, []).slice(0, 14).reverse();

  // Geographic patterns (mock data - would come from IP analysis)
  const geographicData = [
    { region: 'North America', count: 450, percentage: 45 },
    { region: 'Europe', count: 280, percentage: 28 },
    { region: 'Asia Pacific', count: 180, percentage: 18 },
    { region: 'Other', count: 90, percentage: 9 },
  ];

  // Priority distribution
  const priorityData = {
    urgent: inquiries.filter(i => i.priority === 'urgent').length,
    high: inquiries.filter(i => i.priority === 'high').length,
    normal: inquiries.filter(i => i.priority === 'normal').length,
    low: inquiries.filter(i => i.priority === 'low').length,
  };

  const priorityChartData = Object.entries(priorityData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading trends data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Trends Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Analyze trending topics, sentiment, and geographic patterns from Shopify Community
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeRange === '7d'
                ? 'bg-finalapps-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeRange === '30d'
                ? 'bg-finalapps-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              timeRange === '90d'
                ? 'bg-finalapps-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Inquiries</p>
                <p className="text-3xl font-bold text-gray-900">{inquiries.length}</p>
              </div>
              <MessageSquare className="h-10 w-10 text-finalapps-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trending Topics</p>
                <p className="text-3xl font-bold text-green-600">{trendingTopics.length}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Sentiment</p>
                <p className="text-3xl font-bold text-purple-600">68%</p>
              </div>
              <Heart className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Regions</p>
                <p className="text-3xl font-bold text-orange-600">{geographicData.length}</p>
              </div>
              <MapPin className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="frequency" className="space-y-4">
        <TabsList>
          <TabsTrigger value="frequency">Issue Frequency</TabsTrigger>
          <TabsTrigger value="topics">Trending Topics</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Trends</TabsTrigger>
          <TabsTrigger value="geography">Geographic Patterns</TabsTrigger>
        </TabsList>

        {/* Issue Frequency Tab */}
        <TabsContent value="frequency" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inquiry Volume Over Time</CardTitle>
                <CardDescription>Daily inquiry count for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                {issueFrequency.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={issueFrequency}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#2563EB"
                        fillOpacity={1}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>Breakdown of inquiries by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priorityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trending Topics Tab */}
        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Trending Topics</CardTitle>
              <CardDescription>Most discussed categories in the community</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={trendingTopics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#888" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563EB" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingTopics.slice(0, 6).map((topic, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="primary">#{idx + 1}</Badge>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{topic.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{topic.count} inquiries</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-finalapps-blue h-2 rounded-full"
                      style={{ width: `${(topic.count / trendingTopics[0].count) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sentiment Trends Tab */}
        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Analysis Over Time</CardTitle>
              <CardDescription>Community sentiment breakdown (AI-powered analysis)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={sentimentTrends}>
                  <defs>
                    <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stackId="1"
                    stroke="#10B981"
                    fill="url(#colorPositive)"
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    stackId="1"
                    stroke="#F59E0B"
                    fill="url(#colorNeutral)"
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stackId="1"
                    stroke="#EF4444"
                    fill="url(#colorNegative)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Positive</p>
                    <p className="text-2xl font-bold text-green-600">68%</p>
                  </div>
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Up 5% from last period</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Neutral</p>
                    <p className="text-2xl font-bold text-orange-600">23%</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Down 3% from last period</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Negative</p>
                    <p className="text-2xl font-bold text-red-600">9%</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Down 2% from last period</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geographic Patterns Tab */}
        <TabsContent value="geography" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Inquiries by region</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={geographicData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {geographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Breakdown</CardTitle>
                <CardDescription>Detailed statistics by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geographicData.map((region, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5" style={{ color: COLORS[idx % COLORS.length] }} />
                        <div>
                          <p className="font-medium text-gray-900">{region.region}</p>
                          <p className="text-sm text-gray-600">{region.count} inquiries</p>
                        </div>
                      </div>
                      <Badge variant="default">{region.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
