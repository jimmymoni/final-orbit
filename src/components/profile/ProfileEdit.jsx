import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { supabase } from '../../config/supabase';
import { toast } from 'sonner';
import { X, Plus } from 'lucide-react';

export default function ProfileEdit({ userProfile }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    department: '',
    coverImage: '',
    profilePhoto: '',
    skillTags: [],
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: ''
    }
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        bio: userProfile.bio || '',
        department: userProfile.department || '',
        coverImage: userProfile.cover_image || '',
        profilePhoto: userProfile.profile_photo || '',
        skillTags: userProfile.skill_tags || [],
        socialLinks: userProfile.social_links || {
          github: '',
          linkedin: '',
          twitter: ''
        }
      });
    }
  }, [userProfile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skillTags.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skillTags: [...prev.skillTags, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillTags: prev.skillTags.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          bio: formData.bio,
          department: formData.department,
          cover_image: formData.coverImage,
          profile_photo: formData.profilePhoto,
          skill_tags: formData.skillTags,
          social_links: formData.socialLinks,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');

      // Refresh the page to show updated profile
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <select
              id="department"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="General">General</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Support">Support</option>
              <option value="Dev">Development</option>
              <option value="Analytics">Analytics</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {formData.bio.length} / 500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Images */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profilePhoto">Profile Photo URL</Label>
            <Input
              id="profilePhoto"
              type="url"
              value={formData.profilePhoto}
              onChange={(e) => handleChange('profilePhoto', e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
            {formData.profilePhoto && (
              <img
                src={formData.profilePhoto}
                alt="Profile preview"
                className="mt-2 h-24 w-24 rounded-full object-cover border-2 border-gray-200"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              type="url"
              value={formData.coverImage}
              onChange={(e) => handleChange('coverImage', e.target.value)}
              placeholder="https://example.com/cover.jpg"
            />
            {formData.coverImage && (
              <img
                src={formData.coverImage}
                alt="Cover preview"
                className="mt-2 w-full h-32 rounded-lg object-cover border-2 border-gray-200"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Expertise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill (e.g., JavaScript)"
            />
            <Button type="button" onClick={addSkill} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.skillTags.length === 0 ? (
              <p className="text-sm text-gray-500">No skills added yet</p>
            ) : (
              formData.skillTags.map((skill, index) => (
                <Badge key={index} variant="outline" className="gap-1 pr-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              type="url"
              value={formData.socialLinks.github}
              onChange={(e) => handleSocialLinkChange('github', e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="url"
              value={formData.socialLinks.linkedin}
              onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              type="url"
              value={formData.socialLinks.twitter}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              placeholder="https://twitter.com/username"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
