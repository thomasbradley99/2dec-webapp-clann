import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Success() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/profile'); // Redirect to profile after 5 seconds
        }, 5000);

        return () => clearTimeout(timer); // Cleanup the timer
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <h1 className="text-3xl font-bold">Payment Successful!</h1>
            <p className="mt-4">Thank you for upgrading your team to premium.</p>
            <button
                onClick={() => navigate('/profile')}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
            >
                Go to Profile
            </button>
        </div>
    );
}

export default Success; 