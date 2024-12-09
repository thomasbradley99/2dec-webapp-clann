import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import teamService from '../services/teamService';

function Success() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const teamId = user?.teamId;

                if (!teamId) {
                    console.error('No team ID found');
                    return;
                }

                const response = await teamService.getTeamDetails(teamId);
                if (response.data.is_premium) {
                    navigate('/profile');
                }
            } catch (error) {
                console.error('Error checking team status:', error);
            }
        };

        const interval = setInterval(checkStatus, 1000);
        return () => clearInterval(interval);
    }, [navigate]);

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