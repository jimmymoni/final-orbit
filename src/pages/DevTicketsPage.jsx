import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import {
  Bug,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DevTicketsPage() {
  const { isAdmin } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState('open');

  useEffect(() => {
    fetchTickets();
    fetchInquiries();

    // Real-time subscription for tickets
    const subscription = supabase
      .channel('dev_tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dev_tickets' }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('dev_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };

  const analyzeIssues = () => {
    // Group inquiries by similar content/title
    const issueGroups = {};

    inquiries.forEach((inquiry) => {
      // Extract key phrases (simplified - in production use NLP)
      const words = inquiry.title.toLowerCase().split(' ').filter((w) => w.length > 4);
      const key = words.slice(0, 3).join(' ') || inquiry.category || 'uncategorized';

      if (!issueGroups[key]) {
        issueGroups[key] = {
          key,
          inquiries: [],
          count: 0,
        };
      }

      issueGroups[key].inquiries.push(inquiry);
      issueGroups[key].count++;
    });

    // Filter groups with 3+ occurrences
    return Object.values(issueGroups).filter((g) => g.count >= 3);
  };

  const generateTickets = async () => {
    setGenerating(true);
    try {
      const issueGroups = analyzeIssues();
      let createdCount = 0;

      for (const group of issueGroups) {
        // Check if ticket already exists for this issue
        const { data: existing } = await supabase
          .from('dev_tickets')
          .select('id')
          .eq('issue_pattern', group.key)
          .single();

        if (existing) {
          continue; // Skip if ticket already exists
        }

        // Extract examples and logs
        const examples = group.inquiries.slice(0, 5).map((inq) => ({
          title: inq.title,
          link: inq.link,
          created_at: inq.created_at,
        }));

        // Calculate severity based on frequency and priority
        const urgentCount = group.inquiries.filter((i) => i.priority === 'urgent').length;
        const highCount = group.inquiries.filter((i) => i.priority === 'high').length;

        let severity = 'medium';
        if (urgentCount >= 2 || group.count >= 10) {
          severity = 'critical';
        } else if (highCount >= 3 || group.count >= 7) {
          severity = 'high';
        } else if (group.count >= 5) {
          severity = 'medium';
        } else {
          severity = 'low';
        }

        // Create ticket
        const { error } = await supabase.from('dev_tickets').insert({
          title: `Recurring Issue: ${group.inquiries[0].title.substring(0, 100)}`,
          description: `This issue has been reported ${group.count} times in recent inquiries.`,
          issue_pattern: group.key,
          severity,
          status: 'open',
          occurrence_count: group.count,
          examples: JSON.stringify(examples),
          affected_inquiries: group.inquiries.map((i) => i.id),
        });

        if (!error) {
          createdCount++;
        }
      }

      toast.success(`Generated ${createdCount} new dev ticket(s)`);
      fetchTickets();
    } catch (error) {
      console.error('Error generating tickets:', error);
      toast.error('Failed to generate tickets');
    } finally {
      setGenerating(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const { error } = await supabase
        .from('dev_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;
      toast.success('Ticket status updated');
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'open').length,
    inProgress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    critical: tickets.filter((t) => t.severity === 'critical').length,
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      critical: 'danger',
      high: 'warning',
      medium: 'default',
      low: 'outline',
    };
    return <Badge variant={variants[severity]}>{severity}</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: 'default',
      in_progress: 'warning',
      resolved: 'success',
    };
    const labels = {
      open: 'Open',
      in_progress: 'In Progress',
      resolved: 'Resolved',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dev tickets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dev Ticket Board</h1>
          <p className="text-gray-600 mt-2">
            Auto-generated tickets for recurring issues in the Shopify Community
          </p>
        </div>

        {isAdmin && (
          <Button onClick={generateTickets} disabled={generating}>
            {generating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Tickets
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-finalapps-blue">{stats.open}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-finalapps-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <Bug className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Board</CardTitle>
          <CardDescription>View and manage auto-generated development tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                filter === 'all'
                  ? 'bg-finalapps-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                filter === 'open'
                  ? 'bg-finalapps-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                filter === 'in_progress'
                  ? 'bg-finalapps-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                filter === 'resolved'
                  ? 'bg-finalapps-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Resolved
            </button>
          </div>

          {/* Tickets List */}
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No tickets found. {isAdmin && 'Click "Generate Tickets" to analyze recurring issues.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="border-l-4" style={{
                  borderLeftColor:
                    ticket.severity === 'critical' ? '#EF4444' :
                    ticket.severity === 'high' ? '#F59E0B' :
                    ticket.severity === 'medium' ? '#3B82F6' : '#9CA3AF'
                }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getSeverityBadge(ticket.severity)}
                          {getStatusBadge(ticket.status)}
                          <Badge variant="outline">
                            {ticket.occurrence_count} occurrences
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{ticket.title}</CardTitle>
                        <CardDescription className="mt-1">{ticket.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Examples */}
                    {ticket.examples && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Example Inquiries:
                        </h4>
                        <div className="space-y-2">
                          {JSON.parse(ticket.examples).slice(0, 3).map((example, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                            >
                              <span className="text-gray-700">{example.title}</span>
                              <a
                                href={example.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-finalapps-blue hover:text-blue-700"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-3 border-t">
                      {ticket.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                        >
                          Start Working
                        </Button>
                      )}
                      {ticket.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                        >
                          Mark Resolved
                        </Button>
                      )}
                      {ticket.status === 'resolved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTicketStatus(ticket.id, 'open')}
                        >
                          Reopen
                        </Button>
                      )}
                      <p className="text-xs text-gray-500 ml-auto">
                        Created {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
