import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'coach@team.com' && password === 'coach123') {
      navigate('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        width: '400px', 
        padding: '40px',
        backgroundColor: '#333333',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img 
            src="/clann-logo.png" 
            alt="Clann Logo" 
            style={{ width: '200px', marginBottom: '20px' }}
          />
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px',
                marginBottom: '15px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #016F33',
                borderRadius: '4px',
                fontSize: '16px',
                color: '#ffffff',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '12px',
                marginBottom: '20px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #016F33',
                borderRadius: '4px',
                fontSize: '16px',
                color: '#ffffff',
                outline: 'none'
              }}
            />
          </div>
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '12px',
              background: '#016F33',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#015528'}
            onMouseOut={(e) => e.target.style.background = '#016F33'}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;