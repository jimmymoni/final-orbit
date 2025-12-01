import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, ExternalLink, Clock, User, Calendar, AlertCircle } from 'lucide-react';
import { formatDate, timeAgo, isOverdue } from '../lib/utils';
import SmartReplyPanel from '../components/inquiries/SmartReplyPanel';
import RepliesSection from '../components/inquiries/RepliesSection';
import { toast } from 'sonner';

export default function InquiryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [inquiry, setInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [suggestedApps, setSuggestedApps] = useState([]);

  useEffect(() => {
    fetchInquiry();
    fetchActivityLog();
  }, [id]);

  // Fetch apps only after inquiry is loaded
  useEffect(() => {
    if (inquiry) {
      fetchSuggestedApps();
    }
  }, [inquiry]);

  const fetchInquiry = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          assigned_user:users!inquiries_assigned_to_fkey(name, email, role)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setInquiry(data);
    } catch (error) {
      console.error('Error fetching inquiry:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*, user:users(name)')
        .eq('inquiry_id', id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setActivityLog(data || []);
    } catch (error) {
      console.error('Error fetching activity log:', error);
    }
  };

  const fetchSuggestedApps = async () => {
    try {
      // Fetch all active apps
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      // Wait for inquiry to be loaded
      if (!inquiry) {
        setSuggestedApps([]);
        return;
      }

      // Score each app based on relevance to inquiry
      const scoredApps = (data || []).map(app => {
        const score = calculateAppRelevance(app, inquiry);
        return { ...app, relevanceScore: score };
      });

      // Filter apps with relevance score > 30 (decent match)
      const relevantApps = scoredApps
        .filter(app => app.relevanceScore > 30)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3);

      setSuggestedApps(relevantApps);
    } catch (error) {
      console.error('Error fetching apps:', error);
    }
  };

  // Calculate how relevant an app is to the inquiry
  const calculateAppRelevance = (app, inquiry) => {
    let score = 0;
    const inquiryText = `${inquiry.title} ${inquiry.content}`.toLowerCase();
    const appText = `${app.name} ${app.description || ''}`.toLowerCase();
    const appFeatures = (app.features || []).join(' ').toLowerCase();

    // Check if app name appears in inquiry
    if (inquiryText.includes(app.name.toLowerCase())) {
      score += 50;
    }

    // Check if inquiry mentions app-related keywords
    const appKeywords = app.name.toLowerCase().split(' ');
    appKeywords.forEach(keyword => {
      if (keyword.length > 3 && inquiryText.includes(keyword)) {
        score += 15;
      }
    });

    // Check if app features match inquiry needs
    (app.features || []).forEach(feature => {
      if (inquiryText.includes(feature.toLowerCase())) {
        score += 20;
      }
    });

    // Check category match
    if (inquiry.category && app.name.toLowerCase().includes(inquiry.category.toLowerCase())) {
      score += 10;
    }

    // Check common problem keywords
    const problemKeywords = {
      'subscription': ['subscription', 'recurring', 'membership'],
      'shipping': ['shipping', 'delivery', 'tracking', 'fulfillment'],
      'discount': ['discount', 'coupon', 'sale', 'promo'],
      'upsell': ['upsell', 'cross-sell', 'recommend'],
      'email': ['email', 'newsletter', 'notification'],
      'inventory': ['inventory', 'stock', 'quantity'],
      'seo': ['seo', 'search', 'google', 'rank'],
    };

    Object.keys(problemKeywords).forEach(problem => {
      const keywords = problemKeywords[problem];
      const inquiryMentions = keywords.some(kw => inquiryText.includes(kw));
      const appSolves = keywords.some(kw => appText.includes(kw) || appFeatures.includes(kw));

      if (inquiryMentions && appSolves) {
        score += 25;
      }
    });

    return score;
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setSubmitting(true);

    try {
      // Insert reply
      const { data: reply, error: replyError } = await supabase
        .from('replies')
        .insert([
          {
            inquiry_id: id,
            user_id: userProfile.id,
            reply_text: replyText,
          },
        ])
        .select()
        .single();

      if (replyError) throw replyError;

      // Update inquiry status
      const { error: updateError } = await supabase
        .from('inquiries')
        .update({ status: 'replied' })
        .eq('id', id);

      if (updateError) throw updateError;

      // Calculate score
      const { error: scoreError } = await supabase.rpc('calculate_reply_score', {
        p_inquiry_id: id,
        p_reply_id: reply.id,
      });

      if (scoreError) {
        console.error('Score calculation error:', scoreError);
        toast.warning('Reply submitted but score calculation failed');
      }

      // Update user stats
      const { error: statsError } = await supabase.rpc('update_user_stats', {
        p_user_id: userProfile.id,
      });

      if (statsError) {
        console.error('Stats update error:', statsError);
      }

      // Log activity
      await supabase.from('activity_log').insert([
        {
          inquiry_id: id,
          user_id: userProfile.id,
          type: 'replied',
          message: `${userProfile.name} replied to this inquiry`,
        },
      ]);

      // Clear the reply text
      setReplyText('');

      // Refresh the inquiry data to show the new reply
      await fetchInquiry();

      // Show success message
      toast.success('Reply submitted successfully!');

    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Failed to submit reply: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignToMe = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({
          assigned_to: userProfile.id,
          status: 'assigned'
        })
        .eq('id', id);

      if (error) throw error;

      // Log activity
      await supabase.from('activity_log').insert([
        {
          inquiry_id: id,
          user_id: userProfile.id,
          type: 'reassigned',
          message: `${userProfile.name} assigned this inquiry to themselves`,
        },
      ]);

      // Refresh inquiry data
      await fetchInquiry();
      alert('Inquiry assigned to you successfully!');
    } catch (error) {
      console.error('Error assigning inquiry:', error);
      alert('Error assigning inquiry: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Inquiry not found</p>
      </div>
    );
  }

  const overdue = isOverdue(inquiry.deadline_at) && inquiry.status === 'assigned';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{inquiry.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                Assigned to: {inquiry.assigned_user?.name}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created {timeAgo(inquiry.created_at)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Deadline: {timeAgo(inquiry.deadline_at)}
              </div>
            </div>
          </div>
          <a
            href={inquiry.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4"
          >
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Original
            </Button>
          </a>
        </div>

        {overdue && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <p className="text-red-800 font-medium">This inquiry is overdue!</p>
              <p className="text-red-700 text-sm mt-1">
                Please respond as soon as possible to avoid escalation.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inquiry Content */}
          <Card>
            <CardHeader>
              <CardTitle>Inquiry Content</CardTitle>
              <div className="flex space-x-2">
                {inquiry.category && <Badge>{inquiry.category}</Badge>}
                <Badge variant={inquiry.status === 'replied' ? 'success' : 'default'}>
                  {inquiry.status}
                </Badge>
                <Badge variant={inquiry.priority === 'urgent' ? 'danger' : 'default'}>
                  {inquiry.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{inquiry.content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Replies History */}
          <RepliesSection inquiryId={id} />

          {/* Assign to Me Button - Shows when inquiry is not assigned to current user */}
          {inquiry.assigned_to !== userProfile?.id && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      This inquiry is {inquiry.assigned_to ? 'assigned to someone else' : 'not assigned'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Assign it to yourself to use the Smart Reply system and respond.
                    </p>
                  </div>
                  <Button
                    onClick={handleAssignToMe}
                    disabled={submitting}
                    size="lg"
                  >
                    {submitting ? 'Assigning...' : 'Assign to Me'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reply Section */}
          {inquiry.status === 'assigned' && inquiry.assigned_to === userProfile?.id && (
            <Card>
                <CardHeader>
                  <CardTitle>Your Reply</CardTitle>
                  <CardDescription>
                    Use AI to generate smart reply suggestions or write your own response.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* AI Smart Reply Panel */}
                  <SmartReplyPanel
                    inquiry={inquiry}
                    onUseReply={(reply) => setReplyText(reply)}
                  />

                  <Separator />

                  {/* Manual Reply Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Manual Reply</h4>
                    <Textarea
                      placeholder="Or enter your reply text here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitReply}
                        disabled={submitting || !replyText.trim()}
                      >
                        {submitting ? 'Submitting...' : 'Mark as Replied'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>History of all actions on this inquiry</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLog.length === 0 ? (
                <p className="text-gray-500 text-sm">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {activityLog.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 text-sm">
                      <div className="flex-1">
                        <p className="text-gray-900">{log.message}</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {formatDate(log.timestamp)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {log.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Inquiry Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Bandwidth</p>
                <p className="font-medium">{inquiry.bandwidth_minutes} minutes</p>
              </div>
              <div>
                <p className="text-gray-600">Escalation Count</p>
                <p className="font-medium">{inquiry.escalation_count}</p>
              </div>
              <div>
                <p className="text-gray-600">Created At</p>
                <p className="font-medium">{formatDate(inquiry.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-600">Deadline</p>
                <p className={`font-medium ${overdue ? 'text-red-600' : ''}`}>
                  {formatDate(inquiry.deadline_at)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Apps */}
          {suggestedApps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Suggested Apps</CardTitle>
                <CardDescription className="text-xs">
                  Apps that might solve this inquiry
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedApps.map((app) => (
                  <div
                    key={app.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/apps/${app.id}`)}
                  >
                    <p className="font-medium text-sm text-gray-900">{app.name}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {app.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Reply Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>✓ Be helpful and friendly</p>
              <p>✓ Reference our app naturally</p>
              <p>✓ Provide value first</p>
              <p>✓ Avoid spammy language</p>
              <p>✓ Include link if relevant</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
