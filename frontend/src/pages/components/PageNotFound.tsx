import { useEffect } from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            document.getElementById("message")?.classList.add("opacity-100");
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center text-white">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-yellow-400 animate-bounce">
                    404
                </h1>
                <p
                    id="message"
                    className="text-2xl mt-4 opacity-0 transition-opacity duration-1000 ease-in-out"
                >
                    Oops! The page you’re looking for doesn’t exist.
                </p>
                <Link
                    to="/"
                    className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default PageNotFound;