import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Mail, Briefcase, Calendar, MapPin, Link as LinkIcon, Github, Linkedin, Twitter } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function ProfileOverview({ userProfile, stats }) {
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const skillTags = userProfile.skill_tags || [];
  const socialLinks = userProfile.social_links || {};

  return (
    <div className="space-y-6">
      {/* Cover Image & Profile Photo */}
      <Card>
        <div
          className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"
          style={{
            backgroundImage: userProfile.cover_image ? `url(${userProfile.cover_image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <CardContent className="relative pt-16 pb-6">
          <Avatar className="absolute -top-16 left-6 h-32 w-32 border-4 border-white shadow-lg">
            <AvatarImage src={userProfile.profile_photo} alt={userProfile.name} />
            <AvatarFallback className="text-2xl">
              {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="ml-40">
            <h2 className="text-2xl font-bold text-gray-900">{userProfile.name}</h2>
            <p className="text-gray-600 mt-1">{userProfile.department || 'General'} Department</p>
            <Badge className="mt-2" variant={userProfile.role === 'admin' ? 'default' : 'outline'}>
              {userProfile.role === 'admin' ? 'Administrator' : 'Team Member'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userProfile.bio ? (
            <p className="text-gray-700">{userProfile.bio}</p>
          ) : (
            <p className="text-gray-500 italic">No bio added yet. Click "Edit" to add one!</p>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-gray-700">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{userProfile.email}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Briefcase className="h-4 w-4 text-gray-500" />
            <span>{userProfile.department || 'General'} Department</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Joined {formatDate(userProfile.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      {skillTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skillTags.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      {Object.keys(socialLinks).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {socialLinks.github && (
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            )}
            {socialLinks.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </a>
            )}
            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Score</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.total_score || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Replies</p>
              <p className="text-2xl font-bold text-green-600">{stats?.total_replied || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.avg_reply_time || 0}m</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Missed</p>
              <p className="text-2xl font-bold text-red-600">{stats?.total_missed || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
