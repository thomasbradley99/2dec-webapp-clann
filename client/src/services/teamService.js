import api from './api';

const teamService = {
    async getUserTeams() {
        try {
            const response = await api.get('/teams/user');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to fetch teams');
        }
    },

    createTeam: async (name, teamCode) => {
        try {
            const response = await api.post('/teams/create', {
                name,
                team_code: teamCode
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || 'Failed to create team';
        }
    },

    joinTeam: async (teamCode) => {
        try {
            const response = await api.post('/teams/join', { 
                team_code: teamCode.trim().toUpperCase() 
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to join team');
        }
    },

    async getTeamMembers(teamId) {
        try {
            const response = await api.get(`/teams/${teamId}/members`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to fetch team members');
        }
    },

    async removeTeamMember(teamId, userId) {
        try {
            const response = await api.delete(`/teams/${teamId}/members/${userId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to remove team member');
        }
    },

    async toggleAdminStatus(teamId, userId, isAdmin) {
        try {
            const response = await api.patch(`/teams/${teamId}/members/${userId}/admin`, { isAdmin });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to update admin status');
        }
    },

    async deleteTeam(teamId) {
        try {
            const response = await api.delete(`/teams/${teamId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to delete team');
        }
    },

    leaveTeam: async (teamId) => {
        try {
            await api.post(`/teams/${teamId}/leave`);
        } catch (error) {
            throw error.response?.data?.error || 'Failed to leave team';
        }
    }
};

export default teamService;