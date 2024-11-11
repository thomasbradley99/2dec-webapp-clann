import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

function Profile() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div style={{ 
      backgroundColor: '#1a1a1a', 
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      <div style={{ padding: '20px', paddingBottom: '80px' }}>
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
      <NavBar />
    </div>
  );
}

export default Profile;
