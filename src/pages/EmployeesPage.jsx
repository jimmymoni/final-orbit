import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import EmployeeLeaderboardTable from '../components/employees/EmployeeLeaderboardTable';
import { Users, Trophy, TrendingUp, Award } from 'lucide-react';
import { supabase } from '../config/supabase';

export default function EmployeesPage() {
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    topPerformer: null,
    avgScore: 0
  });

  useEffect(() => {
    fetchEmployees();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('users_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users'
      }, () => {
        fetchEmployees();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('total_score', { ascending: false });

      if (error) throw error;

      setEmployees(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (employeeData) => {
    const activeEmps = employeeData.filter(emp => emp.active);
    const totalScore = activeEmps.reduce((sum, emp) => sum + (emp.total_score || 0), 0);

    setStats({
      totalEmployees: employeeData.length,
      activeEmployees: activeEmps.length,
      topPerformer: activeEmps[0] || null,
      avgScore: activeEmps.length > 0 ? Math.round(totalScore / activeEmps.length) : 0
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Leaderboard</h1>
        <p className="text-gray-600 mt-2">
          View performance rankings and statistics for all team members
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeEmployees} active
            </p>
          </CardContent>
        </Card>

        {/* Top Performer */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Top Performer
            </CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 truncate">
              {stats.topPerformer?.name || 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.topPerformer?.total_score || 0} points
            </p>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.avgScore}</div>
            <p className="text-xs text-gray-500 mt-1">
              Team average
            </p>
          </CardContent>
        </Card>

        {/* Your Rank */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Your Rank
            </CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              #{employees.filter(emp => emp.active).findIndex(emp => emp.id === userProfile?.id) + 1 || 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Out of {stats.activeEmployees} active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Trophy className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Transparent Team Performance</h4>
              <p className="text-sm text-blue-700 mt-1">
                This leaderboard shows real-time performance rankings for all team members.
                Scores are calculated based on reply speed, quality, and outcomes.
                Use this to track progress and motivate friendly competition.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Full Rankings</h2>
          <p className="text-sm text-gray-600">
            Click column headers to sort by different metrics
          </p>
        </div>
        <EmployeeLeaderboardTable employees={employees} loading={loading} />
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Badges Explained</CardTitle>
          <CardDescription>Understanding the status badges</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="gap-1">
              Top Performer
            </Badge>
            <span className="text-sm text-gray-600">
              Rank #1 or consistency ≥90% with active score
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success" className="gap-1">
              Improving
            </Badge>
            <span className="text-sm text-gray-600">
              Consistency between 70-89%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1">
              Steady
            </Badge>
            <span className="text-sm text-gray-600">
              Consistent performance between 50-69%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="destructive" className="gap-1">
              Needs Push
            </Badge>
            <span className="text-sm text-gray-600">
              Consistency &lt;50% or score &lt;10 points
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
