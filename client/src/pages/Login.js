import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
        if (isLogin) {
            const response = await userService.validateUser(email, password);
            console.log('Login successful:', response);
            localStorage.setItem('user', JSON.stringify(response));
            
            // Redirect based on user role
            if (response.role === 'COMPANY_MEMBER') {
                navigate('/company');
            } else {
                navigate('/sessions');
            }
        } else {
            try {
                const response = await userService.createUser(email, password);
                console.log('Registration successful:', response);
                setIsLogin(true);
                setError('Registration successful! Please login.');
                setEmail('');
                setPassword('');
            } catch (err) {
                console.error('Registration error:', err);
                if (err.message && err.message.includes('duplicate')) {
                    setError('This email is already registered. Please login instead.');
                    setIsLogin(true);
                } else {
                    setError('Registration failed. Please try again.');
                }
            }
        }
    } catch (err) {
        console.error('Auth error:', err);
        setError(err.message || 'An error occurred');
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
        
        {/* Toggle Switch */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '20px',
          gap: '20px'
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              background: 'none',
              border: 'none',
              color: isLogin ? '#016F33' : '#888888',
              fontSize: '18px',
              cursor: 'pointer',
              borderBottom: isLogin ? '2px solid #016F33' : 'none',
              padding: '5px 10px'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              background: 'none',
              border: 'none',
              color: !isLogin ? '#016F33' : '#888888',
              fontSize: '18px',
              cursor: 'pointer',
              borderBottom: !isLogin ? '2px solid #016F33' : 'none',
              padding: '5px 10px'
            }}
          >
            Register
          </button>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{ 
              width: '100%', 
              marginBottom: '10px', 
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #555'
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ 
              width: '100%', 
              marginBottom: '20px', 
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #555'
            }}
          />
          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#016F33',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;