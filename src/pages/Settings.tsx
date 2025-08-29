import React, { useState, useEffect } from 'react';
import { Bell, Lock, Eye, EyeOff, Mail, User } from 'lucide-react';
import { NotificationSettings } from '../types/dashboard';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmailVerificationModal from '../components/EmailVerificationModal';
import { supabase, SUPABASE_URL_EXPORT } from '../integrations/supabase/client';

const Settings: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'notifications' | 'security' | 'account'>('account');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Notification settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    id: '',
    user_id: '',
    email_new_properties: true,
    email_price_changes: true,
    email_inquiry_responses: true,
    email_weekly_digest: true,
    sms_urgent_updates: false,
    created_at: '',
    updated_at: ''
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Email change state
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: ''
  });
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [pendingNewEmail, setPendingNewEmail] = useState('');

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      if (user) {
        setNotifications(prev => ({
          ...prev,
          user_id: user.id
        }));
      }
      setIsLoading(false);
    }, 1000);
  }, [user]);

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // TODO: Implement API call to save notifications
      console.log('Saving notifications:', notifications);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Notification settings updated successfully!');
    } catch (error) {
      console.error('Error saving notifications:', error);
      alert('Error saving notification settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    setIsSaving(true);
    
    try {
      // TODO: Implement password change API call
      console.log('Changing password');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailForm.newEmail || !emailForm.currentPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (emailForm.newEmail === user?.email) {
      alert('New email address must be different from current email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSaving(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${SUPABASE_URL_EXPORT}/functions/v1/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          currentPassword: emailForm.currentPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send verification email');
      }

      // Success! Show verification modal
      setPendingNewEmail(emailForm.newEmail);
      setShowEmailVerificationModal(true);
      
      // Clear the form
      setEmailForm({
        newEmail: '',
        currentPassword: ''
      });
      
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      alert(error.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailVerified = (newEmail: string) => {
    // The email has been successfully updated
    // The user object will be updated automatically by Supabase
    alert(`Email address successfully updated to ${newEmail}!`);
    setPendingNewEmail('');
  };

  if (loading || isLoading) {
    return (
      <LoadingSpinner 
        isVisible={true}
        message="Loading your settings..."
        variant="overlay"
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to access your settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and security</p>
        </div>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('account')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === 'account'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User size={16} className="inline mr-2" />
              Account
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === 'notifications'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bell size={16} className="inline mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === 'security'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lock size={16} className="inline mr-2" />
              Security
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            {activeTab === 'account' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
                
                {/* Current Email Display */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Mail className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium text-gray-900">Current Email Address</span>
                  </div>
                  <p className="text-gray-700 ml-7">{user?.email}</p>
                </div>

                {/* Email Change Form */}
                <form onSubmit={handleChangeEmail} className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Change Email Address</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Email Address
                        </label>
                        <input
                          type="email"
                          value={emailForm.newEmail}
                          onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                          placeholder="Enter your new email address"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={emailForm.currentPassword}
                          onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                          placeholder="Enter your current password to confirm"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          We need your current password to verify your identity before changing your email address.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-blue-900 mb-1">Email Verification Process</h5>
                        <p className="text-sm text-blue-800">
                          After submitting this form, we'll send a 6-digit verification code to your new email address. 
                          You'll need to enter this code to complete the email change process. The code will expire in 15 minutes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving || !emailForm.newEmail || !emailForm.currentPassword}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                      <Mail size={16} className="mr-2" />
                      {isSaving ? 'Sending Verification...' : 'Send Verification Code'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                <form onSubmit={handleSaveNotifications} className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Email Notifications</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'email_new_properties', label: 'New properties matching your searches', description: 'Get notified when new properties match your saved search criteria' },
                        { key: 'email_price_changes', label: 'Price changes on saved properties', description: 'Be informed when prices change on properties you\'ve saved' },
                        { key: 'email_inquiry_responses', label: 'Responses to your inquiries', description: 'Receive notifications when agents respond to your inquiries' },
                        { key: 'email_weekly_digest', label: 'Weekly market digest', description: 'Get a summary of market trends and new listings' }
                      ].map(({ key, label, description }) => (
                        <div key={key} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              checked={notifications[key as keyof NotificationSettings] as boolean}
                              onChange={(e) => setNotifications({ 
                                ...notifications, 
                                [key]: e.target.checked 
                              })}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>
                          <div className="ml-3">
                            <label className="text-sm font-medium text-gray-700">{label}</label>
                            <p className="text-xs text-gray-500">{description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">SMS Notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={notifications.sms_urgent_updates}
                            onChange={(e) => setNotifications({ 
                              ...notifications, 
                              sms_urgent_updates: e.target.checked 
                            })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3">
                          <label className="text-sm font-medium text-gray-700">Urgent updates</label>
                          <p className="text-xs text-gray-500">Receive SMS for time-sensitive notifications</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                      <Bell size={16} className="mr-2" />
                      {isSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                      <Lock size={16} className="mr-2" />
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        newEmail={pendingNewEmail}
        onEmailVerified={handleEmailVerified}
      />
    </div>
  );
};

export default Settings; 