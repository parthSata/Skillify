// src/pages/StudentCourseDetails.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CourseCard, CourseDetailModal } from '@/components/index';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Define the interface for a lecture
interface Lecture {
    _id: string;
    title: string;
    duration: string;
    description: string;
    videoUrl: string; // Add videoUrl to match the modal's Lecture interface
    isCompleted?: boolean;
    isLocked?: boolean;
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
    isEnrolled?: boolean;
    duration: string;
    category: string;
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
    // @ts-ignore
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // State for the modal

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
                    duration: '2h 30m', // Added to match the modal's Course interface
                    category: 'Development' // Added to match the modal's Course interface
                };

                // Check for enrollment status (you'll need to implement this check on your backend)
                // For now, it's mocked or based on a simple check
                const isUserEnrolled = false; // Replace with actual enrollment check
                fetchedCourse.isEnrolled = isUserEnrolled;

                setCourse(fetchedCourse);
                setIsEnrolled(isUserEnrolled);
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

    const handleEnrollment = async (courseId: string) => {
        if (!courseId) return;
        console.log(`Razorpay Key ID: ${import.meta.env.VITE_RAZORPAY_KEY_ID}`);

        try {
            const orderResponse = await axios.post<APIResponse<any>>(`${API_BASE_URL}/payments/razorpay/order/${courseId}`);
            console.log("🚀 ~ handleEnrollment ~ orderResponse:", orderResponse);
            const order = orderResponse.data.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Skillify Course Enrollment",
                description: course?.title,
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        const verifyResponse = await axios.post<APIResponse<any>>(`${API_BASE_URL}/payments/razorpay/verify`, {
                            razorpay_order_id: order.id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            courseId: courseId,
                        });

                        if (verifyResponse.data.success) {
                            toast.success("Enrollment successful!");
                            setIsEnrolled(true);
                            setIsModalOpen(true); // Open modal to show lectures
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
            <CourseCard
                course={{ ...course, _id: course._id }} // Use course._id
                onCourseClick={() => setIsModalOpen(true)}
            />

            <CourseDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                course={{
                    ...course,
                    id: course._id, // Map _id to id
                    tutor: course.tutor.name, // Convert tutor object to string to match modal interface
                    lectures: course.lectures.map(l => ({ ...l, id: l._id })) // Map _id to id
                }}
                onEnroll={handleEnrollment} // Changed from handleEnrollment to onEnroll
            />
        </div>
    );
};

export default StudentCourseDetails;