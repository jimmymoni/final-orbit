import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { ArrowUpDown, TrendingUp, Target, Zap } from 'lucide-react';

export default function EmployeeLeaderboardTable({ employees = [], loading = false }) {
  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' });

  // Calculate rank based on total_score
  const employeesWithRank = employees
    .filter(emp => emp.active)
    .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
    .map((emp, index) => ({
      ...emp,
      rank: index + 1,
      monthlyScore: emp.total_score || 0,
      tasksCompleted: emp.total_replied || 0,
      consistency: emp.total_replied > 0
        ? Math.round(((emp.total_replied / (emp.total_replied + emp.total_missed)) * 100))
        : 0
    }));

  // Sort employees based on current sort configuration
  const sortedEmployees = [...employeesWithRank].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === bValue) return 0;

    const comparison = aValue < bValue ? -1 : 1;
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getPerformanceBadge = (employee) => {
    const { rank, consistency } = employee;

    if (rank === 1 || (employee.total_score > 0 && consistency >= 90)) {
      return { label: 'Top Performer', variant: 'default', icon: Zap, color: 'text-yellow-600' };
    }

    if (consistency >= 70 && consistency < 90) {
      return { label: 'Improving', variant: 'success', icon: TrendingUp, color: 'text-green-600' };
    }

    if (consistency < 50 || employee.total_score < 10) {
      return { label: 'Needs Push', variant: 'destructive', icon: Target, color: 'text-red-600' };
    }

    return { label: 'Steady', variant: 'outline', icon: Target, color: 'text-blue-600' };
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return (
      <ArrowUpDown
        className={`h-4 w-4 ${sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-blue-600 rotate-180'}`}
      />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedEmployees.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No employees found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('rank')}
                >
                  <div className="flex items-center gap-2">
                    Rank
                    <SortIcon columnKey="rank" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('department')}
                >
                  <div className="flex items-center gap-2">
                    Department
                    <SortIcon columnKey="department" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('monthlyScore')}
                >
                  <div className="flex items-center gap-2">
                    Monthly Score
                    <SortIcon columnKey="monthlyScore" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('tasksCompleted')}
                >
                  <div className="flex items-center gap-2">
                    Tasks Completed
                    <SortIcon columnKey="tasksCompleted" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('consistency')}
                >
                  <div className="flex items-center gap-2">
                    Consistency
                    <SortIcon columnKey="consistency" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedEmployees.map((employee) => {
                const badge = getPerformanceBadge(employee);
                const BadgeIcon = badge.icon;

                return (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {employee.rank <= 3 ? (
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            employee.rank === 1 ? 'bg-yellow-100' :
                            employee.rank === 2 ? 'bg-gray-100' :
                            'bg-orange-100'
                          }`}>
                            <span className={`text-sm font-bold ${
                              employee.rank === 1 ? 'text-yellow-700' :
                              employee.rank === 2 ? 'text-gray-700' :
                              'text-orange-700'
                            }`}>
                              #{employee.rank}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-700">#{employee.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={employee.profile_photo} alt={employee.name} />
                          <AvatarFallback>
                            {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{employee.department || 'General'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{employee.monthlyScore}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{employee.tasksCompleted}</div>
                      <div className="text-xs text-gray-500">inquiries</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              employee.consistency >= 90 ? 'bg-green-500' :
                              employee.consistency >= 70 ? 'bg-blue-500' :
                              employee.consistency >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${employee.consistency}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
                          {employee.consistency}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={badge.variant} className="gap-1">
                        <BadgeIcon className={`h-3 w-3 ${badge.color}`} />
                        {badge.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
