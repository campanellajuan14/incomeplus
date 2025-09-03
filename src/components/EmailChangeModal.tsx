import React, { useState } from 'react';
import { Mail, Key, CheckCircle, X } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

interface EmailChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

const EmailChangeModal: React.FC<EmailChangeModalProps> = ({ isOpen, onClose, currentEmail }) => {
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: '',
    verificationCode: '',
    step: 'input' as 'input' | 'verify'
  });
  const [isEmailChanging, setIsEmailChanging] = useState(false);

  const handleSendVerificationCode = async () => {
    if (!emailForm.newEmail || !emailForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsEmailChanging(true);

    try {
      // Get fresh session to ensure we have a valid token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session');
      }

      // Send verification code to the CURRENT email address
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          newEmail: emailForm.newEmail,
          password: emailForm.password
        },
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setEmailForm(prev => ({ ...prev, step: 'verify' }));
      toast.success('Verification code sent to your current email address');
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setIsEmailChanging(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailForm.verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsEmailChanging(true);

    try {
      // Get fresh session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session');
      }

      // Verify the email change
      const { data, error } = await supabase.functions.invoke('verify-email-change', {
        body: {
          verificationCode: emailForm.verificationCode
        },
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      // Reset form and close modal
      setEmailForm({
        newEmail: '',
        password: '',
        verificationCode: '',
        step: 'input'
      });

      onClose();
      toast.success('Email address updated successfully!');
      
      // Refresh user session and force reload to update all components
      await supabase.auth.refreshSession();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error verifying email:', error);
      toast.error(error.message || 'Failed to verify email change');
    } finally {
      setIsEmailChanging(false);
    }
  };

  const handleClose = () => {
    setEmailForm({
      newEmail: '',
      password: '',
      verificationCode: '',
      step: 'input'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <Mail className="h-6 w-6 text-gray-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Change Email Address</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {emailForm.step === 'input' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Enter your new email and current password. A verification code will be sent to your current email address.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Email Address
                </label>
                <input
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your new email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your current password"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isEmailChanging || !emailForm.newEmail || !emailForm.password}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  <Mail size={16} className="mr-2" />
                  {isEmailChanging ? 'Sending...' : 'Send Verification Code'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-blue-800">
                    A verification code has been sent to your current email address: <strong>{currentEmail}</strong>
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={emailForm.verificationCode}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, verificationCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the 6-digit code"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setEmailForm(prev => ({ ...prev, step: 'input', verificationCode: '' }))}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={isEmailChanging || !emailForm.verificationCode}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  <Key size={16} className="mr-2" />
                  {isEmailChanging ? 'Verifying...' : 'Verify & Update Email'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailChangeModal;