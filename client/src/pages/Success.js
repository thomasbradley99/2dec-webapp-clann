import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import teamService from '../services/teamService';

function Success() {
    const navigate = useNavigate();

    useEffect(() => {
        // Wait a few seconds for the webhook to process
        const timer = setTimeout(() => {
            handleProfileRedirect();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleProfileRedirect = () => {
        navigate('/profile');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Payment was successful!</h1>
            <p className="text-gray-400 mb-8">Updating your subscription status...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <button
                onClick={handleProfileRedirect}
                className="mt-8 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
                Go to Profile
            </button>
        </div>
    );
}

export default Success; 