import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('sessions');
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'sessions':
        return (
          <div>
            <h2>Sessions</h2>
            <p>Your game footage and analysis will appear here.</p>
          </div>
        );
      case 'profile':
        return (
          <div style={{ padding: '20px' }}>
            <h2>Profile</h2>
            <div style={{ 
              backgroundColor: '#333333', 
              padding: '20px', 
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <p style={{ color: '#888888' }}>Email</p>
              <p style={{ marginTop: '5px' }}>coach@team.com</p>
              
              <p style={{ color: '#888888', marginTop: '20px' }}>Role</p>
              <p style={{ marginTop: '5px' }}>Team Admin</p>

              <button 
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #016F33',
                  color: '#016F33',
                  borderRadius: '4px',
                  marginTop: '30px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#016F33';
                  e.target.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#1a1a1a';
                  e.target.style.color = '#016F33';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      {/* Content */}
      <div style={{ padding: '20px', paddingBottom: '80px' }}>
        {renderContent()}
      </div>

      {/* Navigation Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#333333',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 40px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.2)'
      }}>
        <button
          onClick={() => setActiveTab('sessions')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'sessions' ? '#016F33' : '#888888',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0 20px',
            height: '100%',
            transition: 'color 0.2s'
          }}
        >
          Sessions
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'profile' ? '#016F33' : '#888888',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0 20px',
            height: '100%',
            transition: 'color 0.2s'
          }}
        >
          Profile
        </button>
      </div>
    </div>
  );
}

export default Dashboard;