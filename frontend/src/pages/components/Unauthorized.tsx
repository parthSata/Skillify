import { useEffect } from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
    useEffect(() => {
        const elements = document.querySelectorAll(".spin");
        elements.forEach((el) => {
            el.classList.add("animate-spin");
        });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center text-white">
            <div className="text-center">
                <h1 className="text-7xl font-bold text-red-400 spin">
                    Access Denied
                </h1>
                <p className="text-xl mt-4">
                    Sorry, you don’t have permission to view this page.
                </p>
                <Link
                    to="/"
                    className="mt-6 inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all animate-pulse"
                >
                    Go to Home
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;