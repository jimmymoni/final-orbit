import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Clock, ExternalLink, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import { formatDate, timeAgo, isOverdue } from '../lib/utils';

export default function InquiryDashboard() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('assigned');
  const [search, setSearch] = useState('');
  const { userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInquiries();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('inquiries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, () => {
        fetchInquiries();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filter, userProfile]);

  const fetchInquiries = async () => {
    try {
      let query = supabase
        .from('inquiries')
        .select(`
          *,
          assigned_user:users!inquiries_assigned_to_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      // Filter based on user role
      if (!isAdmin && filter === 'assigned') {
        query = query.eq('assigned_to', userProfile?.id);
      }

      if (filter === 'replied') {
        query = query.eq('status', 'replied');
      } else if (filter === 'escalated') {
        query = query.eq('status', 'escalated');
      } else if (filter === 'missed') {
        query = query.eq('status', 'missed');
      }

      const { data, error } = await query;

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (inquiry) => {
    if (inquiry.status === 'replied') {
      return <Badge variant="success">Replied</Badge>;
    }
    if (inquiry.status === 'escalated') {
      return <Badge variant="warning">Escalated</Badge>;
    }
    if (inquiry.status === 'missed') {
      return <Badge variant="danger">Missed</Badge>;
    }
    if (isOverdue(inquiry.deadline_at)) {
      return <Badge variant="danger">Overdue</Badge>;
    }
    return <Badge variant="default">Assigned</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      urgent: 'danger',
      high: 'warning',
      normal: 'default',
      low: 'outline',
    };
    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  const filteredInquiries = inquiries.filter((inquiry) =>
    inquiry.title.toLowerCase().includes(search.toLowerCase()) ||
    inquiry.category?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: inquiries.length,
    assigned: inquiries.filter(i => i.status === 'assigned').length,
    replied: inquiries.filter(i => i.status === 'replied').length,
    overdue: inquiries.filter(i => isOverdue(i.deadline_at) && i.status === 'assigned').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inquiry Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage and respond to Shopify Community inquiries
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <LayoutDashboard className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-finalapps-blue">{stats.assigned}</p>
              </div>
              <Clock className="h-8 w-8 text-finalapps-blue" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Replied</p>
                <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Inquiries</CardTitle>
              <CardDescription>Click on any inquiry to view details and reply</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Buttons */}
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <button
              onClick={() => setFilter('assigned')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                filter === 'assigned'
                  ? 'bg-finalapps-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              My Assigned
            </button>
            {isAdmin && (
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
            )}
            <button
              onClick={() => setFilter('replied')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                filter === 'replied'
                  ? 'bg-finalapps-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Replied
            </button>
            <button
              onClick={() => setFilter('escalated')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                filter === 'escalated'
                  ? 'bg-finalapps-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Escalated
            </button>
          </div>

          {/* Search */}
          <Input
            placeholder="Search inquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          {/* Table */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No inquiries found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                    <th className="pb-3 font-medium w-[35%]">Title</th>
                    <th className="pb-3 font-medium w-[12%]">Category</th>
                    <th className="pb-3 font-medium w-[12%]">Assigned To</th>
                    <th className="pb-3 font-medium w-[10%]">Status</th>
                    <th className="pb-3 font-medium w-[8%]">Priority</th>
                    <th className="pb-3 font-medium w-[10%]">Deadline</th>
                    <th className="pb-3 font-medium w-[10%]">Created</th>
                    <th className="pb-3 font-medium w-[3%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      onClick={() => navigate(`/inquiry/${inquiry.id}`)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 pr-4 font-medium text-gray-900 truncate">
                        {inquiry.title}
                      </td>
                      <td className="py-4 px-2 text-gray-600 text-sm">
                        {inquiry.category || '-'}
                      </td>
                      <td className="py-4 px-2 text-gray-600 text-sm truncate">
                        {inquiry.assigned_user?.name || 'Unassigned'}
                      </td>
                      <td className="py-4 px-2">
                        {getStatusBadge(inquiry)}
                      </td>
                      <td className="py-4 px-2">
                        {getPriorityBadge(inquiry.priority)}
                      </td>
                      <td className="py-4 px-2 text-sm whitespace-nowrap">
                        <span className={isOverdue(inquiry.deadline_at) && inquiry.status === 'assigned' ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {timeAgo(inquiry.deadline_at)}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-gray-600 text-sm whitespace-nowrap">
                        {timeAgo(inquiry.created_at)}
                      </td>
                      <td className="py-4 pl-2 text-center">
                        <a
                          href={inquiry.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-finalapps-blue hover:text-blue-700 inline-block"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
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

function LayoutDashboard({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
