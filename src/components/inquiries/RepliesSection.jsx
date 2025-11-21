import { MessageCircle, User, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useInquiryReplies } from '@/hooks/useReplies';
import { formatDate } from '@/lib/utils';

export default function RepliesSection({ inquiryId }) {
  const { data: replies, isLoading, error } = useInquiryReplies(inquiryId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Replies History
          </CardTitle>
          <CardDescription>All submitted replies for this inquiry</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Replies History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Failed to load replies: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const hasReplies = replies && replies.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Replies History
          {hasReplies && (
            <Badge variant="outline" className="ml-auto">
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>All submitted replies for this inquiry</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasReplies ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No replies yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Replies will appear here once submitted
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {replies.map((reply) => (
              <div
                key={reply.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors"
              >
                {/* Reply Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {reply.user?.name || 'Unknown User'}
                    </span>
                    {reply.user?.email && (
                      <span className="text-gray-500">({reply.user.email})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(reply.replied_at)}
                  </div>
                </div>

                {/* Reply Content */}
                <div className="prose max-w-none">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {reply.reply_text}
                  </p>
                </div>

                {/* Score Breakdown */}
                {reply.total_score !== null && reply.total_score !== undefined && (
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-medium text-gray-700">
                        Total Score:
                      </span>
                      <Badge variant="default" className="text-xs">
                        {reply.total_score}
                      </Badge>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-600">
                      {reply.speed_score !== null && (
                        <span>Speed: {reply.speed_score}</span>
                      )}
                      {reply.quality_score !== null && (
                        <span>Quality: {reply.quality_score}</span>
                      )}
                      {reply.outcome_score !== null && (
                        <span>Outcome: {reply.outcome_score}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
