'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [timeLeft, setTimeLeft] = useState(240);
  const [errors, setErrors] = useState({
    email: '',
    otp: '',
    newPassword: '',
    general: '',
  });

  useEffect(() => {
    if (showOtpForm && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      toast.error('OTP has expired. Please try again.');
      setShowOtpForm(false);
      setTimeLeft(240);
    }
  }, [showOtpForm, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: '', general: '' }));
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    setErrors((prev) => ({ ...prev, otp: '', general: '' }));
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    setErrors((prev) => ({ ...prev, newPassword: '', general: '' }));
  };

  const validateEmailForm = () => {
    let isValid = true;
    const newErrors = { email: '', otp: '', newPassword: '', general: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateResetForm = () => {
    let isValid = true;
    const newErrors = { email: '', otp: '', newPassword: '', general: '' };

    if (!otp) {
      newErrors.otp = 'OTP is required';
      isValid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmailForm()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          general: data.error || 'Something went wrong',
        }));
        return;
      }

      toast.success('OTP sent to your email');
      setShowOtpForm(true);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || 'An unexpected error occurred. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateResetForm()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          general: data.error || 'Something went wrong',
        }));
        return;
      }

      toast.success('Password reset successfully');
      router.push('/login');
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || 'An unexpected error occurred. Please try again.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex flex-col justify-center py-4 sm:py-6 lg:py-8 overflow-hidden">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-[90%] xs:max-w-[340px] sm:max-w-md px-2 sm:px-4">
        <div className="bg-white/10 backdrop-blur-lg py-4 sm:py-6 px-3 sm:px-6 shadow-2xl rounded-2xl w-full overflow-y-auto max-h-[90vh]">
          <div className="mb-4 sm:mb-6 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 sm:h-10 sm:w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-white">
              {showOtpForm ? 'Reset Password' : 'Forgot Password'}
            </h2>
          </div>

          {errors.general && (
            <div className="mb-3 sm:mb-4 flex items-center space-x-1.5 bg-pink-500/20 text-pink-300 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md animate-fade-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>{errors.general}</p>
            </div>
          )}

          {!showOtpForm ? (
            <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-6">
              <div>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white/10 border ${
                      errors.email ? 'border-pink-400' : 'border-white/20'
                    } rounded-lg text-white placeholder-white/60 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200`}
                    placeholder="Email ID"
                  />
                  <span className="absolute left-2 sm:left-3 top-2 sm:top-2.5 text-white/60">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                </div>
                {errors.email && (
                  <div className="mt-1 sm:mt-1.5 flex items-center space-x-1.5 bg-pink-500/20 text-pink-300 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md animate-fade-in">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p>{errors.email}</p>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium text-sm sm:text-base hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-6">
              <div>
                <div className="relative">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white/10 border ${
                      errors.otp ? 'border-pink-400' : 'border-white/20'
                    } rounded-lg text-white placeholder-white/60 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200`}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  <span className="absolute left-2 sm:left-3 top-2 sm:top-2.5 text-white/60">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </span>
                </div>
                {errors.otp && (
                  <div className="mt-1 sm:mt-1.5 flex items-center space-x-1.5 bg-pink-500/20 text-pink-300 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md animate-fade-in">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p>{errors.otp}</p>
                  </div>
                )}
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/60 text-center">
                  OTP expires in:{' '}
                  <span className="font-medium text-white">{formatTime(timeLeft)}</span>
                </p>
              </div>

              <div>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white/10 border ${
                      errors.newPassword ? 'border-pink-400' : 'border-white/20'
                    } rounded-lg text-white placeholder-white/60 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200`}
                    placeholder="New Password"
                  />
                  <span className="absolute left-2 sm:left-3 top-2 sm:top-2.5 text-white/60">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </span>
                </div>
                {errors.newPassword && (
                  <div className="mt-1 sm:mt-1.5 flex items-center space-x-1.5 bg-pink-500/20 text-pink-300 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md animate-fade-in">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p>{errors.newPassword}</p>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium text-sm sm:text-base hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-white/60 text-xs sm:text-sm">
              Remember your password?{' '}
              <Link href="/login" className="text-white font-medium hover:text-purple-200">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}