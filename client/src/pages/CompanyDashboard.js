import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

function CompanyDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user || user.role !== 'COMPANY_MEMBER') {
            navigate('/');
        }
    }, [navigate]);

    return (
        <div style={{ 
            backgroundColor: '#1a1a1a', 
            minHeight: '100vh',
            color: '#ffffff',
            paddingBottom: '80px'
        }}>
            <div style={{ padding: '20px' }}>
                <h2>Company Dashboard</h2>
                <div style={{ 
                    backgroundColor: '#333333', 
                    padding: '20px', 
                    borderRadius: '8px',
                    marginTop: '20px'
                }}>
                    <h3>Pending Sessions</h3>
                    <p>Sessions will be displayed here</p>
                </div>
            </div>
            <NavBar />
        </div>
    );
}

export default CompanyDashboard; 