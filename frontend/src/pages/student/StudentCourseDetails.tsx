// src/pages/StudentCourseDetails.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { PlayCircle, Award, DollarSign, Users } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Define the interface for a lecture
interface Lecture {
    _id: string;
    title: string;
    duration: string;
    description: string;
}

// Define the interface for the course object
interface CourseDetails {
    _id: string;
    title: string;
    description: string;
    tutor: {
        _id: string;
        name: string;
    };
    price: number;
    thumbnail: string;
    lectures: Lecture[];
    rating: number;
    students: number;
}

// Define the API response structure
interface APIResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

const StudentCourseDetails: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const fetchCourseDetails = async () => {
        if (!courseId) return;

        try {
            setLoading(true);
            const response = await axios.get<APIResponse<CourseDetails>>(`${API_BASE_URL}/courses/${courseId}`);

            if (response.data.success) {
                const fetchedCourse = {
                    ...response.data.data,
                    rating: 4.8,
                    students: 1250,
                };
                setCourse(fetchedCourse);

                // Check enrollment status (you'll need a backend endpoint for this)
                // For now, it's mocked as false
                setIsEnrolled(false);
            } else {
                toast.error(response.data.message || 'Failed to fetch course details.');
            }
        } catch (err: any) {
            console.error('Failed to fetch course details:', err);
            toast.error(err.response?.data?.message || 'Failed to fetch course details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const handleEnrollment = async () => {
        if (!course || !course._id) return;
        console.log(`Razorpay Key ID: ${import.meta.env.VITE_RAZORPAY_KEY_ID}`);

        try {
            const orderResponse = await axios.post<APIResponse<any>>(`${API_BASE_URL}/payments/razorpay/order/${course._id}`);
            console.log("🚀 ~ handleEnrollment ~ orderResponse:", orderResponse)
            const order = orderResponse.data.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Corrected to use VITE_ prefix
                amount: order.amount,
                currency: order.currency,
                name: "Skillify Course Enrollment",
                description: course.title,
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        const verifyResponse = await axios.post<APIResponse<any>>(`${API_BASE_URL}/payments/razorpay/verify`, {
                            razorpay_order_id: order.id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            courseId: course._id,
                        });

                        if (verifyResponse.data.success) {
                            toast.success("Enrollment successful!");
                            setIsEnrolled(true);
                        } else {
                            toast.error(verifyResponse.data.message || "Payment verification failed.");
                        }
                    } catch (err) {
                        toast.error("An error occurred during payment verification.");
                    }
                },
                prefill: {
                    name: "Student Name",
                    email: "student@example.com",
                },
                theme: {
                    color: "#3B82F6",
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to initiate payment.");
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading course details...</div>;
    }

    if (!course) {
        return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Course not found.</div>;
    }

    return (
        <div className="p-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="relative">
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <h1 className="text-4xl font-bold">{course.title}</h1>
                        <p className="mt-2 text-xl font-medium">by {course.tutor.name}</p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400 mb-6">
                        <div className="flex items-center space-x-2">
                            <Award className="w-5 h-5" />
                            <span>{course.rating} Rating</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5" />
                            <span>{course.students} Students</span>
                        </div>
                        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 font-semibold">
                            <DollarSign className="w-5 h-5" />
                            <span>{course.price}</span>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Course Description</h2>
                    <p className="text-gray-600 dark:text-gray-400">{course.description}</p>

                    {/* Conditional rendering for lectures or enrollment */}
                    {!isEnrolled ? (
                        <div className="mt-8">
                            <button
                                onClick={handleEnrollment}
                                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <DollarSign className="w-5 h-5" />
                                <span>Buy Now for ${course.price}</span>
                            </button>
                        </div>
                    ) : (
                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Course Lectures</h2>
                            <div className="space-y-4">
                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-80 overflow-y-auto">
                                    {course.lectures.length > 0 ? (
                                        course.lectures.map((lecture, index) => (
                                            <div
                                                key={lecture._id}
                                                className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <PlayCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                    <div className="truncate">
                                                        <h4 className="font-medium text-gray-900 dark:text-white">{`${index + 1}. ${lecture.title}`}</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{lecture.description}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4">{lecture.duration}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="p-4 text-center text-gray-500 dark:text-gray-400">No lectures found for this course.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentCourseDetails;