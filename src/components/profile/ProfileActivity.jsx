import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { supabase } from '../../config/supabase';
import { formatDate, timeAgo } from '../../lib/utils';
import { Clock, MessageSquare, AlertTriangle, UserCheck, RefreshCw } from 'lucide-react';

export default function ProfileActivity({ userProfile }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      fetchActivities();
    }
  }, [userProfile]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*, inquiry:inquiries(title)')
        .eq('user_id', userProfile.id)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'replied':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'assigned':
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'escalated':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'reassigned':
        return <RefreshCw className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityVariant = (type) => {
    switch (type) {
      case 'replied':
        return 'success';
      case 'assigned':
        return 'default';
      case 'escalated':
        return 'destructive';
      case 'reassigned':
        return 'warning';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No activity recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {activity.message}
                    </p>
                    {activity.inquiry && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        Inquiry: {activity.inquiry.title}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {timeAgo(activity.timestamp)} · {formatDate(activity.timestamp)}
                    </p>
                  </div>
                  <Badge variant={getActivityVariant(activity.type)} className="flex-shrink-0">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <h4 className="font-medium text-gray-900 mb-3">Activity Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600">Total Activities</p>
              <p className="text-xl font-bold text-gray-900">{activities.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Replies</p>
              <p className="text-xl font-bold text-green-600">
                {activities.filter(a => a.type === 'replied').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Assignments</p>
              <p className="text-xl font-bold text-blue-600">
                {activities.filter(a => a.type === 'assigned').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Escalations</p>
              <p className="text-xl font-bold text-red-600">
                {activities.filter(a => a.type === 'escalated').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
