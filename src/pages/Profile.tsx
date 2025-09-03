import React, { useState, useEffect } from 'react';
import { User, Save, Edit } from 'lucide-react';
import { UserProfile } from '../types/dashboard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import LoadingSpinner from '../components/LoadingSpinner';
import EmailChangeModal from '../components/EmailChangeModal';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { user, userProfile, loading, refetchProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  
  // Profile form state
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    user_id: '',
    username: '',
    phone: '',
    company: '',
    bio: '',
    email_notifications: true,
    sms_notifications: false,
    created_at: '',
    updated_at: ''
  });

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
      setIsLoading(false);
    } else if (!loading && user) {
      // If user exists but no profile, create empty profile structure
      setProfile(prev => ({
        ...prev,
        user_id: user.id,
        username: user.user_metadata?.username || ''
      }));
      setIsLoading(false);
    }
  }, [userProfile, user, loading]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          username: profile.username || '',
          phone: profile.phone,
          company: profile.company,
          bio: profile.bio,
          email_notifications: profile.email_notifications,
          sms_notifications: profile.sms_notifications,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Refetch the profile to get the updated data
      await refetchProfile();
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error saving profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <LoadingSpinner 
        isVisible={true}
        message="Loading your profile..."
        variant="overlay"
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information</p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <User className="h-6 w-6 text-gray-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={profile.username || ''}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your username"
                />
              </div>

              <div className="flex items-center space-x-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Email Address
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit size={16} className="mr-2" />
                  Change
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={profile.company || ''}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  <Save size={16} className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <EmailChangeModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          currentEmail={user?.email || ''}
        />
      </div>
    </div>
  );
};

export default Profile; 