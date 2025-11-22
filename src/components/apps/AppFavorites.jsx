import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Star, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function AppFavorites({ currentAppId = null, compact = false }) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      fetchFavorites();
      if (currentAppId) {
        checkIsFavorite();
      }
    }
  }, [userProfile, currentAppId]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('user_app_favorites')
        .select(`
          *,
          app:apps(*)
        `)
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIsFavorite = async () => {
    try {
      const { data, error } = await supabase
        .from('user_app_favorites')
        .select('id')
        .eq('user_id', userProfile.id)
        .eq('app_id', currentAppId)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // Not a favorite
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    if (!currentAppId) return;

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_app_favorites')
          .delete()
          .eq('user_id', userProfile.id)
          .eq('app_id', currentAppId);

        if (error) throw error;

        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_app_favorites')
          .insert({
            user_id: userProfile.id,
            app_id: currentAppId
          });

        if (error) throw error;

        setIsFavorite(true);
        toast.success('Added to favorites');
      }

      // Refresh favorites list
      fetchFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  // Compact view for app detail page (just toggle button)
  if (compact) {
    return (
      <Button
        variant={isFavorite ? 'default' : 'outline'}
        size="sm"
        onClick={toggleFavorite}
        className="gap-2"
      >
        <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        {isFavorite ? 'Favorited' : 'Add to Favorites'}
      </Button>
    );
  }

  // Full favorites widget
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">Loading favorites...</p>
        </CardContent>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4 text-yellow-600" />
            My Favorites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No favorites yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Star apps to quick access them here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-4 w-4 text-yellow-600" />
          My Favorites
          <Badge variant="outline">{favorites.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {favorites.map(({ app }) => (
          <div
            key={app.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={() => navigate(`/apps/${app.id}`)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {app.logo_url && (
                <img
                  src={app.logo_url}
                  alt={app.name}
                  className="h-8 w-8 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {app.name}
                </p>
                {app.category && (
                  <p className="text-xs text-gray-500">{app.category}</p>
                )}
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
