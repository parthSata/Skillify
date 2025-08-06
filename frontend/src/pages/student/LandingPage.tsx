// LandingPage.tsx
import React from 'react';
import { Play, BookOpen, Users, Award, ArrowRight, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LandingPageProps { }

const LandingPage: React.FC<LandingPageProps> = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout(navigate);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
            {/* Header */}
            <header className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">EduPlatform</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                                >
                                    Get Started
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            Learn Without
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Limits</span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                            Join thousands of learners and educators in our comprehensive e-learning platform.
                            Create, teach, and learn with the best tools available.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                            >
                                <span>Start Learning</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 flex items-center space-x-2">
                                <Play className="w-5 h-5" />
                                <span>Watch Demo</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500/20 rounded-full animate-bounce"></div>
                <div className="absolute top-40 right-20 w-12 h-12 bg-purple-500/20 rounded-full animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-20 h-20 bg-pink-500/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose EduPlatform?</h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300">Everything you need for effective online learning</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Expert Instructors</h4>
                            <p className="text-gray-600 dark:text-gray-300">Learn from industry professionals and certified educators</p>
                        </div>

                        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Rich Content</h4>
                            <p className="text-gray-600 dark:text-gray-300">Access thousands of courses across multiple categories</p>
                        </div>

                        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Certificates</h4>
                            <p className="text-gray-600 dark:text-gray-300">Earn verified certificates upon course completion</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div className="p-6">
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
                            <div className="text-gray-600 dark:text-gray-300">Active Students</div>
                        </div>
                        <div className="p-6">
                            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">500+</div>
                            <div className="text-gray-600 dark:text-gray-300">Expert Tutors</div>
                        </div>
                        <div className="p-6">
                            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">1000+</div>
                            <div className="text-gray-600 dark:text-gray-300">Courses</div>
                        </div>
                        <div className="p-6">
                            <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">50+</div>
                            <div className="text-gray-600 dark:text-gray-300">Categories</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;