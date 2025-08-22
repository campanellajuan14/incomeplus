import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import LoadingSpinner from '../components/LoadingSpinner';
import { Eye, EyeOff, User, Mail, Phone, Building, FileText, Bell, Smartphone, Save, Clock, Check, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  company: string;
  bio: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

const Profile: React.FC = () => {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    phone: '',
    company: '',
    bio: '',
    email_notifications: true,
    sms_notifications: false
  });

  // Enhanced email change state
  const [emailChange, setEmailChange] = useState({
    step: 0, // 0: initial, 1: enter details, 2: code sent, 3: verify code, 4: success
    newEmail: '',
    currentPassword: '',
    verificationCode: '',
    isLoading: false,
    expiresAt: null as string | null,
    timeRemaining: 0,
    isSuccess: false
  });

  // Current email display state for animation
  const [currentDisplayEmail, setCurrentDisplayEmail] = useState('');

  const [showPasswords, setShowPasswords] = useState({
    current: false
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          toast.error('Failed to load profile data');
          return;
        }
        
        if (data) {
          setProfile({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || '',
            company: data.company || '',
            bio: data.bio || '',
            email_notifications: data.email_notifications ?? true,
            sms_notifications: data.sms_notifications ?? false
          });
        } else {
          // Create basic profile using user metadata if no profile exists
          setProfile(prev => ({
            ...prev,
            first_name: user.user_metadata?.first_name || user.user_metadata?.name?.split(' ')[0] || '',
            last_name: user.user_metadata?.last_name || user.user_metadata?.name?.split(' ')[1] || ''
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Initialize current display email
  useEffect(() => {
    if (user?.email) {
      setCurrentDisplayEmail(user.email);
    }
  }, [user?.email]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const profileData = {
        user_id: user.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        company: profile.company,
        bio: profile.bio,
        email_notifications: profile.email_notifications,
        sms_notifications: profile.sms_notifications
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { 
          onConflict: 'user_id'
        });
      
      if (error) throw error;
      
      // Track activity
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'profile_updated',
          activity_data: { updated_fields: Object.keys(profileData) }
        });
      
      toast.success('Profile updated successfully!');
      
      // Trigger a page reload to refresh the header
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Enhanced email change functions
  const handleSendVerificationCode = async () => {
    if (!emailChange.newEmail || !emailChange.currentPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (emailChange.newEmail === user?.email) {
      toast.error('New email cannot be the same as current email');
      return;
    }

    try {
      setEmailChange(prev => ({ ...prev, isLoading: true }));
      
      // Get the auth token for the edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Authentication required');
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          newEmail: emailChange.newEmail,
          currentPassword: emailChange.currentPassword
        }
      });

      if (error) {
        toast.error(error.message || 'Failed to send verification code');
        return;
      }

      const expiresAt = data.expiresAt;
      setEmailChange(prev => ({ 
        ...prev, 
        step: 2, 
        expiresAt,
        timeRemaining: 15 * 60, // 15 minutes
        currentPassword: '' // Clear password for security
      }));

      toast.success('Verification code sent! Please check your new email address.');
      
      // Start countdown timer
      startCountdown(expiresAt);

    } catch (error: any) {
      console.error('Error sending verification code:', error);
      toast.error('An error occurred while sending verification code');
    } finally {
      setEmailChange(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!emailChange.verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      setEmailChange(prev => ({ ...prev, isLoading: true }));

      // Get current session to include authorization header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Authentication required');
        return;
      }

      const { error } = await supabase.functions.invoke('verify-email-change', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          verificationCode: emailChange.verificationCode,
          newEmail: emailChange.newEmail
        }
      });

      if (error) {
        toast.error(error.message || 'Invalid verification code');
        return;
      }

      // Set success state and animate email change
      setEmailChange(prev => ({ ...prev, step: 4, isSuccess: true }));
      
      // Start email animation
      setTimeout(() => {
        setCurrentDisplayEmail(emailChange.newEmail);
      }, 500);

      toast.success('Email address updated successfully!');

    } catch (error: any) {
      console.error('Error verifying email change:', error);
      toast.error('An error occurred while verifying code');
    } finally {
      setEmailChange(prev => ({ ...prev, isLoading: false }));
    }
  };

  const startCountdown = (expiresAt: string) => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const timeLeft = Math.max(0, Math.floor((expiry - now) / 1000));
      
      setEmailChange(prev => ({ ...prev, timeRemaining: timeLeft }));
      
      if (timeLeft <= 0) {
        clearInterval(interval);
        toast.error('Verification code has expired. Please request a new one.');
      }
    }, 1000);
  };

  const resetEmailChange = () => {
    setEmailChange({
      step: 0,
      newEmail: '',
      currentPassword: '',
      verificationCode: '',
      isLoading: false,
      expiresAt: null,
      timeRemaining: 0,
      isSuccess: false
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner isVisible={true} />
      </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <User className="h-6 w-6 text-gray-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.input
                        key={currentDisplayEmail}
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: -90 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        type="email"
                        value={currentDisplayEmail}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </AnimatePresence>
                    {emailChange.isSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.3 }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </motion.div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailChange(prev => ({ ...prev, step: 1 }))}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                    disabled={emailChange.step > 0}
                  >
                    Change Email
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline h-4 w-4 mr-1" />
                    Company
                  </label>
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                        <p className="text-xs text-gray-500">Receive updates via email</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.email_notifications}
                        onChange={(e) => setProfile({ ...profile, email_notifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                        <p className="text-xs text-gray-500">Receive updates via text message</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.sms_notifications}
                        onChange={(e) => setProfile({ ...profile, sms_notifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner isVisible={true} />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Enhanced Email Change Modal */}
      <AnimatePresence>
        {emailChange.step > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
            {/* Progress indicator */}
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-2">
                <motion.div 
                  animate={{ 
                    backgroundColor: emailChange.step >= 1 ? '#2563eb' : '#d1d5db',
                    color: emailChange.step >= 1 ? '#ffffff' : '#6b7280'
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                >
                  {emailChange.step >= 4 ? <Check className="h-4 w-4" /> : '1'}
                </motion.div>
                <motion.div 
                  animate={{ backgroundColor: emailChange.step >= 2 ? '#2563eb' : '#d1d5db' }}
                  className="w-12 h-0.5"
                />
                <motion.div 
                  animate={{ 
                    backgroundColor: emailChange.step >= 2 ? '#2563eb' : '#d1d5db',
                    color: emailChange.step >= 2 ? '#ffffff' : '#6b7280'
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                >
                  {emailChange.step >= 4 ? <Check className="h-4 w-4" /> : '2'}
                </motion.div>
                <motion.div 
                  animate={{ backgroundColor: emailChange.step >= 3 ? '#2563eb' : '#d1d5db' }}
                  className="w-12 h-0.5"
                />
                <motion.div 
                  animate={{ 
                    backgroundColor: emailChange.step >= 3 ? '#2563eb' : '#d1d5db',
                    color: emailChange.step >= 3 ? '#ffffff' : '#6b7280'
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                >
                  {emailChange.step >= 4 ? <Check className="h-4 w-4" /> : '3'}
                </motion.div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Enter details */}
              {emailChange.step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Change Email Address
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Email Address
                      </label>
                      <input
                        type="email"
                        value={emailChange.newEmail}
                        onChange={(e) => setEmailChange(prev => ({ ...prev, newEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your new email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={emailChange.currentPassword}
                          onChange={(e) => setEmailChange(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <div className="flex">
                        <Mail className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                        <div className="text-sm text-blue-700">
                          <p>We'll send a 6-digit verification code to your new email address. The code will be valid for 15 minutes.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={resetEmailChange}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={emailChange.isLoading || !emailChange.newEmail || !emailChange.currentPassword}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {emailChange.isLoading ? (
                        <>
                        <LoadingSpinner isVisible={true} />
                        <span className="ml-2">Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Verification Code
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Code sent */}
              {emailChange.step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Verification Code Sent
                  </h3>
                  
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    
                    <div>
                      <p className="text-gray-600 mb-2">
                        We've sent a 6-digit verification code to:
                      </p>
                      <p className="font-medium text-gray-900">{emailChange.newEmail}</p>
                    </div>
                    
                    {emailChange.timeRemaining > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <div className="flex items-center justify-center">
                          <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm text-yellow-700">
                            Code expires in: <span className="font-mono font-medium">{formatTime(emailChange.timeRemaining)}</span>
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-500">
                      Please check your email and click "Enter Code" when you receive it.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={resetEmailChange}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailChange(prev => ({ ...prev, step: 3 }))}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Enter Code
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Verify code */}
              {emailChange.step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Enter Verification Code
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        value={emailChange.verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setEmailChange(prev => ({ ...prev, verificationCode: value }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Code sent to: <span className="font-medium">{emailChange.newEmail}</span>
                      </p>
                      
                      {emailChange.timeRemaining > 0 ? (
                        <div className="flex items-center justify-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Expires in: <span className="font-mono">{formatTime(emailChange.timeRemaining)}</span></span>
                        </div>
                      ) : (
                        <p className="text-sm text-red-600">Code has expired</p>
                      )}
                    </div>
                    
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setEmailChange(prev => ({ ...prev, step: 1, currentPassword: '', verificationCode: '' }))}
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        Didn't receive the code? Send a new one
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setEmailChange(prev => ({ ...prev, step: 2 }))}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyEmailChange}
                      disabled={emailChange.isLoading || emailChange.verificationCode.length !== 6 || emailChange.timeRemaining <= 0}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {emailChange.isLoading ? (
                        <>
                          <LoadingSpinner isVisible={true} />
                          <span className="ml-2">Verifying...</span>
                        </>
                      ) : (
                        'Verify & Update Email'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {emailChange.step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                    >
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Email Updated Successfully!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Your email address has been changed to:
                      </p>
                      <motion.div
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="bg-green-50 border border-green-200 rounded-lg p-4"
                      >
                        <p className="font-medium text-green-800">{emailChange.newEmail}</p>
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="flex justify-center"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          resetEmailChange();
                          // Refresh user session to update the email in the context
                          window.location.reload();
                        }}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                      >
                        Continue
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;