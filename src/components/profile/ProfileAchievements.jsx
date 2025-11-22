import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Zap, Target, Star, Award, TrendingUp, Clock, Users } from 'lucide-react';

export default function ProfileAchievements({ userProfile, stats }) {
  // Calculate achievements based on stats
  const achievements = [];

  // First Reply Achievement
  if (stats?.total_replied >= 1) {
    achievements.push({
      id: 'first-reply',
      title: 'First Steps',
      description: 'Completed your first reply',
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      unlocked: true
    });
  }

  // 10 Replies Achievement
  if (stats?.total_replied >= 10) {
    achievements.push({
      id: 'replies-10',
      title: 'Getting Started',
      description: 'Completed 10 replies',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      unlocked: true
    });
  }

  // 50 Replies Achievement
  if (stats?.total_replied >= 50) {
    achievements.push({
      id: 'replies-50',
      title: 'Rising Star',
      description: 'Completed 50 replies',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      unlocked: true
    });
  }

  // 100 Replies Achievement
  if (stats?.total_replied >= 100) {
    achievements.push({
      id: 'replies-100',
      title: 'Century Club',
      description: 'Completed 100 replies',
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      unlocked: true
    });
  }

  // Speed Demon Achievement (avg reply time under 30 minutes)
  if (stats?.avg_reply_time > 0 && stats?.avg_reply_time <= 30) {
    achievements.push({
      id: 'speed-demon',
      title: 'Speed Demon',
      description: 'Average reply time under 30 minutes',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      unlocked: true
    });
  }

  // High Scorer Achievement (total score > 100)
  if (stats?.total_score >= 100) {
    achievements.push({
      id: 'high-scorer',
      title: 'High Scorer',
      description: 'Earned 100+ total points',
      icon: Award,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      unlocked: true
    });
  }

  // Perfect Record Achievement (0 missed inquiries)
  if (stats?.total_replied > 0 && stats?.total_missed === 0) {
    achievements.push({
      id: 'perfect-record',
      title: 'Perfect Record',
      description: 'Zero missed inquiries',
      icon: Star,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      unlocked: true
    });
  }

  // Team Player Achievement (role-based)
  if (userProfile?.role === 'admin' || userProfile?.active) {
    achievements.push({
      id: 'team-player',
      title: 'Team Player',
      description: 'Active team member',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      unlocked: true
    });
  }

  // Locked achievements (not yet earned)
  const lockedAchievements = [
    {
      id: 'replies-200',
      title: 'Elite Performer',
      description: 'Complete 200 replies',
      icon: Trophy,
      locked: stats?.total_replied < 200,
      progress: stats?.total_replied || 0,
      goal: 200
    },
    {
      id: 'score-500',
      title: 'Score Master',
      description: 'Earn 500+ total points',
      icon: Award,
      locked: stats?.total_score < 500,
      progress: stats?.total_score || 0,
      goal: 500
    },
    {
      id: 'consistency-king',
      title: 'Consistency King',
      description: 'Maintain 90%+ success rate with 50+ replies',
      icon: TrendingUp,
      locked: !(stats?.total_replied >= 50 && ((stats?.total_replied / (stats?.total_replied + stats?.total_missed)) * 100) >= 90),
      progress: stats?.total_replied > 0 ? Math.round((stats?.total_replied / (stats?.total_replied + stats?.total_missed)) * 100) : 0,
      goal: 90
    }
  ];

  return (
    <div className="space-y-6">
      {/* Unlocked Achievements */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">
            Unlocked Achievements ({achievements.length})
          </h3>
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No achievements unlocked yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start completing inquiries to earn achievements!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors"
                  >
                    <div className={`flex-shrink-0 p-3 rounded-full ${achievement.bgColor}`}>
                      <Icon className={`h-6 w-6 ${achievement.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                      <Badge variant="success" className="mt-2">Unlocked</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Locked Achievements (In Progress) */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">In Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedAchievements.filter(a => a.locked).map((achievement) => {
              const Icon = achievement.icon;
              const progressPercent = (achievement.progress / achievement.goal) * 100;

              return (
                <div
                  key={achievement.id}
                  className="flex items-start gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg opacity-75"
                >
                  <div className="flex-shrink-0 p-3 rounded-full bg-gray-100">
                    <Icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">{achievement.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress} / {achievement.goal}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Achievement Stats</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600">Unlocked</p>
              <p className="text-2xl font-bold text-blue-600">{achievements.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">
                {lockedAchievements.filter(a => a.locked).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Completion</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round((achievements.length / (achievements.length + lockedAchievements.filter(a => a.locked).length)) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Points</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.total_score || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
