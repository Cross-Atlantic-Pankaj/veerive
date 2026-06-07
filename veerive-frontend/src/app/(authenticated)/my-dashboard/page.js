'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserCircle } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import toast, { Toaster } from 'react-hot-toast';
import SavedItems from './ProfileComponent/SavedItems';

export default function Profile() {
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState(''); // Fixed: Changed State to useState
  const [timeLeft, setTimeLeft] = useState(240);
  const router = useRouter();

  useEffect(() => {
    const userDataStr = localStorage.getItem('user');
    if (!userDataStr) {
      toast.error('Please login first to visit the dashboard');
      router.push('/login');
      return;
    }
    const user = JSON.parse(userDataStr);
    setUserData({
      name: user.name,
      email: user.email,
    });
  }, [router]);

  useEffect(() => {
    if ((showPasswordModal || showEmailModal) && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      toast.error('OTP has expired. Please try again.');
      handleCloseModal();
    }
  }, [showPasswordModal, showEmailModal, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleForgotPassword = async () => {
    setIsPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userData.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        return;
      }

      toast.success(`OTP sent to ${userData.email}`);
      setShowPasswordModal(true);
      setTimeLeft(240);
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    setIsEmailLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userData.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        return;
      }

      toast.success(`OTP sent to ${userData.email}`);
      setShowEmailModal(true);
      setTimeLeft(240);
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Please enter both OTP and new password');
      return;
    }

    setIsPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          otp,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        return;
      }

      toast.success('Password reset successfully');
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!otp || !newEmail) {
      toast.error('Please enter both OTP and new email');
      return;
    }

    setIsEmailLoading(true);
    try {
      const res = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentEmail: userData.email,
          otp,
          newEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        return;
      }

      const updatedUser = { ...JSON.parse(localStorage.getItem('user')), email: newEmail };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData((prev) => ({ ...prev, email: newEmail }));

      toast.success('Email updated successfully');
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setShowEmailModal(false);
    setOtp('');
    setNewPassword('');
    setNewEmail('');
    setTimeLeft(240);
  };

  return (
    <div className="p-3 sm:p-6 relative mb-64">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 bg-white rounded-xl shadow-base px-3 sm:px-4 py-4 max-w-2xl hover:shadow-xl transition-shadow duration-300 ml-0 sm:ml-6">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center ring-2 ring-white flex-shrink-0 mx-auto sm:mx-0">
          <span className="text-2xl font-medium text-white">
            {userData?.name?.[0]?.toUpperCase()}
          </span>
        </div>
        <div className="flex flex-col flex-grow w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center sm:text-left">
              {userData.name}
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={handleForgotPassword}
                disabled={isPasswordLoading}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 w-full sm:w-auto whitespace-nowrap"
              >
                {isPasswordLoading ? 'Sending OTP...' : 'Change Password'}
              </button>
              <button
                onClick={handleChangeEmail}
                disabled={isEmailLoading}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 w-full sm:w-auto whitespace-nowrap"
              >
                {isEmailLoading ? 'Sending OTP...' : 'Change Email'}
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-center sm:text-left mt-2 sm:mt-0 break-all sm:break-normal">{userData.email}</p>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-2 transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-4 sm:px-5 py-3 sm:py-2 border-b sticky top-0 bg-white">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                Reset Password
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <form
                onSubmit={handleResetPassword}
                className="space-y-4 sm:space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors duration-200 text-base"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  <div className="mt-2 flex items-center text-xs sm:text-sm text-gray-500">
                    <svg
                      className="w-4 h-4 mr-1.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Time remaining: {formatTime(timeLeft)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors duration-200 text-base"
                    placeholder="Enter new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {isPasswordLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-2 transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-4 sm:px-5 py-3 sm:py-2 border-b sticky top-0 bg-white">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                Change Email
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
              >
                <IoClose size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <form
                onSubmit={handleUpdateEmail}
                className="space-y-4 sm:space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors duration-200 text-base"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  <div className="mt-2 flex items-center text-xs sm:text-sm text-gray-500">
                    <svg
                      className="w-4 h-4 mr-1.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Time remaining: {formatTime(timeLeft)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Email
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors duration-200 text-base"
                    placeholder="Enter new email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isEmailLoading}
                  className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {isEmailLoading ? 'Updating Email...' : 'Update Email'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="sm:px-8">
        <SavedItems />
      </div>
    </div>
  );
}