import React, { useState } from 'react';
import { BookOpen, Mail, Lock, User, ArrowLeft, Image } from 'lucide-react';
import axios from 'axios';

// Define the User type based on your backend User model
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'tutor' | 'student';
  avatar?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define the ApiResponse type based on your ApiResponse.js
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AuthPageProps {
  onAuth: (userType: 'admin' | 'tutor' | 'student') => void;
  onBack: () => void;
  isAdminRoute?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuth, onBack, isAdminRoute = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'admin' | 'tutor' | 'student'>(isAdminRoute ? 'admin' : 'student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    avatar: null as File | null,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files) {
      setFormData({ ...formData, avatar: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isLogin) {
        // Registration
        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('role', userType);
        if (formData.avatar) {
          data.append('profilePic', formData.avatar);
        }

        const response = await axios.post<ApiResponse<User>>(
          'http://localhost:3000/api/v1/users/register',
          data,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          onAuth(userType);
        } else {
          setError(response.data.message || 'Registration failed');
        }
      } else {
        // Login
        const response = await axios.post<ApiResponse<User>>(
          'http://localhost:3000/api/v1/users/login',
          {
            email: formData.email,
            password: formData.password,
          },
          { withCredentials: true }
        );

        if (response.data.success) {
          onAuth(userType);
        } else {
          setError(response.data.message || 'Login failed');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isAdminRoute
                ? (isLogin ? 'Admin Login' : 'Admin Registration')
                : (isLogin ? 'Welcome Back' : 'Join EduPlatform')
              }
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isAdminRoute
                ? (isLogin ? 'Access admin dashboard' : 'Create admin account')
                : (isLogin ? 'Sign in to your account' : 'Create your account to get started')
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {!isAdminRoute && !isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  I want to join as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['student', 'tutor'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserType(type)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                        userType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isAdminRoute && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                    Admin Access Only
                  </p>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  This area is restricted to authorized administrators only.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
            {!isAdminRoute && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Administrator?{' '}
                  <button
                    onClick={() => window.location.href = '/admin/login'}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Access Admin Portal
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};