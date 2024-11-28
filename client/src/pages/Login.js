import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import userService from '../services/userService';
import activityImg from '../assets/images/activity.jpeg';
import heatmapImg from '../assets/images/heatmap.jpeg';
import sprintsImg from '../assets/images/sprints.jpeg';
import clannLogo from '../assets/images/clann-logo.png';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Login flow
        const response = await userService.validateUser(email, password);
        localStorage.setItem('user', JSON.stringify(response));
        navigate(response.role === 'COMPANY_MEMBER' ? '/company' : '/sessions');
      } else {
        // Registration flow
        const response = await userService.createUser(email, password);
        localStorage.setItem('user', JSON.stringify(response));
        navigate('/sessions'); // New users always go to sessions page
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-600/20 to-gray-900/95" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Left side - Title */}
            <div className="text-center lg:text-left lg:max-w-2xl">
              <img src={clannLogo} alt="Clann" className="h-20 mx-auto lg:mx-0 mb-8" />
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                AI-Powered Sports Analytics
              </h1>
              <p className="text-xl text-gray-300">
                Transform your game footage into actionable insights with our advanced AI analysis platform
              </p>
            </div>

            {/* Right side - Login Form */}
            <div className="mt-12 lg:mt-0 lg:ml-8 max-w-md w-full mx-auto lg:mx-0">
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50">
                <div className="flex justify-center gap-8 mb-8">
                  <button 
                    onClick={() => setIsLogin(true)}
                    className={`text-lg font-medium transition-colors ${
                      isLogin ? 'text-green-500' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setIsLogin(false)}
                    className={`text-lg font-medium transition-colors ${
                      !isLogin ? 'text-green-500' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 
                             text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 
                             text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                  <button 
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 
                             rounded-lg transition-colors focus:outline-none focus:ring-2 
                             focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    {isLogin ? 'Login' : 'Register'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Performance Tracking',
              description: 'Track team momentum and performance metrics in real-time',
              image: activityImg,
              icon: '📈'
            },
            {
              title: 'Heat Mapping',
              description: 'Visualize player positioning and movement patterns',
              image: heatmapImg,
              icon: '🔥'
            },
            {
              title: 'Sprint Analysis',
              description: 'Automatically detect key sprints and player movements',
              image: sprintsImg,
              icon: '⚡️'
            }
          ].map(feature => (
            <div key={feature.title} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 
                                              hover:border-green-500/30 transition-all transform hover:-translate-y-1">
              <img 
                src={feature.image} 
                alt={feature.title}
                className="w-full aspect-video rounded-lg object-cover mb-6"
              />
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{feature.icon}</span>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              </div>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Section */}
      <div className="max-w-5xl mx-auto px-4 pb-24">
        <div className="bg-gray-800/50 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-3xl">🚀</span>
              <h2 className="text-3xl font-bold text-white">AI Sprint Analysis Demo</h2>
              <span className="text-3xl">🚀</span>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Watch AI automatically identify and track player movements, measuring top speeds, 
              sprint distances, and acceleration patterns in real-time
            </p>
          </div>
          
          {/* Video Container */}
          <div className="w-full bg-black">
            <div className="max-w-4xl mx-auto">
              <div className="relative pt-[56.25%]">
                <ReactPlayer
                  url="https://youtu.be/3TD7m0i7KDQ"
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                  muted={true}
                  playsinline
                  light={true}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  config={{
                    youtube: {
                      playerVars: {
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                        color: 'white',
                        iv_load_policy: 3,
                        origin: window.location.origin
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;