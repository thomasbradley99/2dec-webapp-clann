import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const userService = {
    async validateUser(email, password) {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        return response.data;
    },

    async createUser(email, password) {
        const response = await axios.post(`${API_URL}/auth/register`, { email, password });
        return response.data;
    }
};

export default userService;
