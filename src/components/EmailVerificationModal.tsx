import React, { useState, useEffect } from 'react';
import { X, Mail, Clock, CheckCircle } from 'lucide-react';
import { supabase, SUPABASE_URL_EXPORT } from '../integrations/supabase/client';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  newEmail: string;
  onEmailVerified: (newEmail: string) => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  newEmail,
  onEmailVerified,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code');
      return;
    }

    setIsVerifying(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${SUPABASE_URL_EXPORT}/functions/v1/verify-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          verificationCode,
          newEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Verification failed');
      }

      // Success! Email has been updated
      onEmailVerified(newEmail);
      onClose();
      
      // Show success message
      alert('Email address updated successfully!');
    } catch (error: any) {
      console.error('Verification error:', error);
      setError(error.message || 'Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsResending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // We need the current password to resend - this would typically come from the parent component
      // For now, we'll ask the user to close and try again
      throw new Error('Please close this dialog and request a new verification code');
    } catch (error: any) {
      console.error('Resend error:', error);
      setError(error.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    setVerificationCode('');
    setError('');
    setTimeLeft(15 * 60);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Mail className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Verify New Email</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 mb-2">
              We've sent a 6-digit verification code to:
            </p>
            <p className="font-semibold text-gray-900 break-all">{newEmail}</p>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center mb-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              Code expires in: {formatTime(timeLeft)}
            </span>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                  setError('');
                }}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enter the 6-digit code sent to your new email address
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isVerifying || verificationCode.length !== 6 || timeLeft <= 0}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Verify Email
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Resend Option */}
          {timeLeft <= 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-3">Verification code has expired</p>
              <button
                onClick={handleResendCode}
                disabled={isResending}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
              >
                {isResending ? 'Requesting new code...' : 'Request new verification code'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
