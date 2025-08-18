import React from "react";
import { CourseForm } from "@/components/index";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000/api/v1";

const TutorCreateCourseView: React.FC = () => {
    const navigate = useNavigate();

    const handleCreateCourse = async (courseData: FormData) => {
        try {
            // The API endpoint for a tutor to create a course has been updated
            const response = await axios.post(`${API_BASE_URL}/tutor/courses`, courseData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data) {
                toast.success("Course created successfully!");
                navigate("/tutor/courses"); // Redirect to the tutor's courses page
            } else {
                console.error("Failed to create course.", response);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create course.");
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Course</h1>
            <CourseForm onSubmit={handleCreateCourse} onCancel={() => navigate("/tutor/courses")} />
        </div>
    );
};

export default TutorCreateCourseView;