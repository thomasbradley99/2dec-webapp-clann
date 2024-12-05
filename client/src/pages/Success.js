import React from 'react';
import { useNavigate } from 'react-router-dom';

function Success() {
    const navigate = useNavigate();

    const handleProfileRedirect = () => {
        navigate('/profile'); // Redirect to the profile page
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Payment was successful!</h1>
            <button
                onClick={handleProfileRedirect}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
                Go to Profile
            </button>
        </div>
    );
}

export default Success; 