import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import ProfileTabs from '../components/profile/ProfileTabs';

export default function ProfilePage() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [replies, setReplies] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      fetchAllData();
    }
  }, [userProfile]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchStats(),
        fetchReplies(),
        fetchLeaderboard()
      ]);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userProfile.id)
        .single();

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('replies')
        .select(`
          *,
          inquiry:inquiries(title, category, created_at)
        `)
        .eq('user_id', userProfile.id)
        .order('replied_at', { ascending: false });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('active', true)
        .order('total_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">User profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your personal information and view your performance
        </p>
      </div>

      {/* Profile Tabs */}
      <ProfileTabs
        userProfile={userProfile}
        stats={stats}
        replies={replies}
        leaderboard={leaderboard}
      />
    </div>
  );
}
