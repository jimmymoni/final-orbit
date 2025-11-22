import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { User, TrendingUp, Activity as ActivityIcon, Award, Edit } from 'lucide-react';
import ProfileOverview from './ProfileOverview';
import MyPerformance from './MyPerformance';
import ProfileActivity from './ProfileActivity';
import ProfileAchievements from './ProfileAchievements';
import ProfileEdit from './ProfileEdit';

export default function ProfileTabs({ userProfile, stats, replies, leaderboard }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">My Performance</span>
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <ActivityIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Activity</span>
        </TabsTrigger>
        <TabsTrigger value="achievements" className="flex items-center gap-2">
          <Award className="h-4 w-4" />
          <span className="hidden sm:inline">Achievements</span>
        </TabsTrigger>
        <TabsTrigger value="edit" className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          <span className="hidden sm:inline">Edit</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <ProfileOverview userProfile={userProfile} stats={stats} />
      </TabsContent>

      <TabsContent value="performance" className="mt-6">
        <MyPerformance
          userProfile={userProfile}
          stats={stats}
          replies={replies}
          leaderboard={leaderboard}
        />
      </TabsContent>

      <TabsContent value="activity" className="mt-6">
        <ProfileActivity userProfile={userProfile} />
      </TabsContent>

      <TabsContent value="achievements" className="mt-6">
        <ProfileAchievements userProfile={userProfile} stats={stats} />
      </TabsContent>

      <TabsContent value="edit" className="mt-6">
        <ProfileEdit userProfile={userProfile} />
      </TabsContent>
    </Tabs>
  );
}
