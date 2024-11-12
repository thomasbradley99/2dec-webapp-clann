import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const getHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
        headers: {
            'user-id': user?.id
        }
    };
};

const authService = {
    deleteAccount: async () => {
        try {
            await axios.delete(`${API_URL}/auth/delete`, getHeaders());
        } catch (error) {
            throw error.response?.data?.error || 'Failed to delete account';
        }
    }
};

export default authService; 