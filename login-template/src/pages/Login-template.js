import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { signIn, signUp, resetPassword, confirmResetPassword, confirmSignUp, resendSignUpCode, signOut } from 'aws-amplify/auth';
import ReactPlayer from 'react-player';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [registrationStep, setRegistrationStep] = useState('form');
  const [verificationCode, setVerificationCode] = useState('');
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
        if (isLogin) {
            try {
                await signOut();
            } catch (signOutError) {
                console.log('Sign out error (can be ignored):', signOutError);
            }

            try {
                const signInResponse = await signIn({ 
                    username: email, 
                    password 
                });
                console.log('Sign in response:', signInResponse);
                navigate('/sessions');
            } catch (err) {
                if (err.message === 'User is not confirmed.') {
                    setError('Email not verified. Please verify your email.');
                    setIsLogin(false);
                    setRegistrationStep('verification');
                } else {
                    setError(err.message);
                }
            }
        } else {
            await signUp({
                username: email,
                password: password,
                attributes: {
                    email: email,
                }
            });
            setRegistrationStep('verification');
        }
    } catch (err) {
        console.error('Auth error:', err);
        setError(err.message || 'An error occurred');
    }
  };

  const handleVerification = async () => {
    try {
        await confirmSignUp({
            username: email,
            confirmationCode: verificationCode
        });
        const signInResponse = await signIn({
            username: email,
            password
        });
        console.log('Sign in response:', signInResponse);
        navigate('/sessions');
    } catch (err) {
        setError(err.message);
    }
  };

  return (
    <div style={{
      backgroundColor: '#111',
      minHeight: '100vh',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '40px'
    }}>
      {/* Top Features Grid */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '30px'
      }}>
        {/* Performance Tracking */}
        <div style={{
          backgroundColor: 'rgba(34, 34, 34, 0.6)',
          padding: '25px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <img 
            src="/login-media/activity.jpeg" 
            alt="Performance Tracking"
            style={{
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: '8px',
              marginBottom: '20px',
              objectFit: 'cover'
            }}
          />
          <span style={{ fontSize: '24px', marginBottom: '15px', display: 'block' }}>📈</span>
          <h3 style={{ 
            color: '#fff', 
            fontSize: '18px', 
            marginBottom: '10px'
          }}>Performance Tracking</h3>
          <p style={{ 
            color: '#fff', 
            opacity: 0.7, 
            fontSize: '14px'
          }}>Track team momentum and performance metrics in real-time</p>
        </div>

        {/* Heat Mapping */}
        <div style={{
          backgroundColor: 'rgba(34, 34, 34, 0.6)',
          padding: '25px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <img 
            src="/login-media/heatmap.jpeg" 
            alt="Heat Mapping"
            style={{
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: '8px',
              marginBottom: '20px',
              objectFit: 'cover'
            }}
          />
          <span style={{ fontSize: '24px', marginBottom: '15px', display: 'block' }}>🔥</span>
          <h3 style={{ 
            color: '#fff', 
            fontSize: '18px', 
            marginBottom: '10px'
          }}>Heat Mapping</h3>
          <p style={{ 
            color: '#fff', 
            opacity: 0.7, 
            fontSize: '14px'
          }}>Visualize player positioning and movement patterns</p>
        </div>

        {/* Sprint Analysis */}
        <div style={{
          backgroundColor: 'rgba(34, 34, 34, 0.6)',
          padding: '25px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <img 
            src="/login-media/sprints.jpeg" 
            alt="Sprint Analysis"
            style={{
              width: '100%',
              aspectRatio: '16/9',
              borderRadius: '8px',
              marginBottom: '20px',
              objectFit: 'cover'
            }}
          />
          <span style={{ fontSize: '24px', marginBottom: '15px', display: 'block' }}>⚡️</span>
          <h3 style={{ 
            color: '#fff', 
            fontSize: '18px', 
            marginBottom: '10px'
          }}>Sprint Analysis</h3>
          <p style={{ 
            color: '#fff', 
            opacity: 0.7, 
            fontSize: '14px'
          }}>Automatically detect key sprints and player movements</p>
        </div>
      </div>

      {/* Middle Login Section */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        backgroundColor: '#222',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <img src="/clann-logo.png" alt="Clann" style={{ 
          width: '150px', 
          marginBottom: '20px',
          display: 'block',
          margin: '0 auto'
        }}/>

        {/* Login/Register Tabs */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <span 
            onClick={() => {
                setIsLogin(true);
                setRegistrationStep('form');
            }} 
            style={{ 
              color: isLogin ? '#016F33' : '#ffffff',
              marginRight: '20px',
              cursor: 'pointer'
            }}
          >
            Login
          </span>
          <span 
            onClick={() => {
                setIsLogin(false);
                setRegistrationStep('form');
            }}
            style={{ 
              color: !isLogin ? '#016F33' : '#ffffff',
              cursor: 'pointer'
            }}
          >
            Register
          </span>
        </div>

        {error && (
          <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</p>
        )}

        {!isLogin && registrationStep === 'verification' ? (
          <div>
            <p style={{ color: '#ffffff', marginBottom: '15px', textAlign: 'center' }}>
              Verification code sent to {email}
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
              style={{ 
                width: '100%', 
                marginBottom: '15px', 
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #555'
              }}
            />
            <button 
              onClick={handleVerification}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#016F33',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                marginBottom: '10px',
                cursor: 'pointer'
              }}
            >
              Verify & Login
            </button>
            <button 
              onClick={async () => {
                try {
                  await resendSignUpCode({ username: email });
                  setError('New code sent!');
                } catch (err) {
                  setError(err.message);
                }
              }}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'transparent',
                color: '#016F33',
                border: '1px solid #016F33',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Resend Code
            </button>
          </div>
        ) : (
          // Regular registration form (what you see now)
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={{ 
                width: '100%', 
                marginBottom: '15px', 
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #333',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontSize: '14px'
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
                padding: '12px',
                backgroundColor: '#016F33',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                ':hover': {
                  backgroundColor: '#015528'
                }
              }}
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        )}
      </div>

      {/* Bottom Video Section */}
      <div style={{
        width: '100%',
        maxWidth: '1000px',
        backgroundColor: '#222',
        borderRadius: '12px',
        overflow: 'hidden',
        padding: '25px',
      }}>
        <div style={{
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            color: '#fff', 
            fontSize: '28px',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <span>🚀</span>
            AI Sprint Analysis Demo
            <span>🚀</span>
          </h2>
          <p style={{ 
            color: '#fff', 
            opacity: 0.7, 
            fontSize: '16px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Watch AI automatically identify and track player movements, 
            measuring top speeds, sprint distances, and acceleration patterns in real-time
          </p>
        </div>
        <div style={{
          position: 'relative',
          paddingTop: '56.25%', // This creates a 16:9 aspect ratio
          width: '100%',
          backgroundColor: '#000' // Black background while loading
        }}>
          <ReactPlayer
            url="https://youtu.be/3TD7m0i7KDQ"
            controls
            width="100%"
            height="100%"
            playing={false}
            muted={true}
            playsinline
            light={true}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            config={{
              youtube: {
                playerVars: {
                  modestbranding: 1,
                  rel: 0,
                  showinfo: 0,
                  color: 'white',
                  // Add these to minimize ads
                  iv_load_policy: 3, // Disable video annotations
                  origin: window.location.origin
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;