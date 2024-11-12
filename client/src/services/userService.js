import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const userService = {
    async validateUser(email, password) {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            console.log('Login response:', response.data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Login failed';
            throw new Error(errorMessage);
        }
    },

    async createUser(email, password) {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, { email, password });
            console.log('Register response:', response.data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Registration failed';
            throw new Error(errorMessage);
        }
    }
};

export default userService;
