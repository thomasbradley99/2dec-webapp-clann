import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import userService from '../services/userService';
import activityImg from '../static/team_0_activity.png';
import heatmapImg from '../static/heatmap_team_0.png';
import sprintsImg from '../static/sprint_diagram_team_0_distance.png';
import clannLogo from '../assets/images/luke-logo.png';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        if (!termsAccepted) {
          setError('You must accept the Terms & Conditions to register');
          return;
        }
        const response = await userService.createUser(email, password, termsAccepted);
        localStorage.setItem('user', JSON.stringify(response));
        navigate('/sessions');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="relative min-h-screen">
        {/* Content that scrolls over the video */}
        <div className="relative z-10">
          {/* Hero Video Background - Fixed Position */}
          <div className="fixed inset-0 w-full h-full -z-10">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            >
              <source src="/videos/hero-video.mp4" type="video/mp4" />
            </video>

            {/* Gradient Overlay - More subtle and fixed */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, rgba(17,24,39,0.3) 0%, rgba(17,24,39,0.2) 50%, rgba(17,24,39,0.8) 100%)'
              }}
            />
          </div>

          {/* Existing Hero Content */}
          <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* Left side - Title */}
              <div className="text-center lg:text-left lg:max-w-2xl">
                <img
                  src={clannLogo}
                  alt="Clann"
                  className="h-24 mx-auto lg:mx-0 mb-8 transform hover:scale-105 transition-transform"
                />
                <h1 className="text-4xl md:text-6xl font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-blue-500 mb-6">
                  AI Player Tracking
                </h1>
                <p className="text-xl font-medium font-sans tracking-wide text-gray-200 mt-6">
                  Professional Analysis. For Everyone.
                </p>
              </div>

              {/* Right side - Login Form */}
              <div className="mt-12 lg:mt-0 lg:ml-8 max-w-md w-full mx-auto lg:mx-0">
                <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50">
                  <div className="flex justify-center gap-8 mb-8">
                    <button
                      onClick={() => setIsLogin(true)}
                      className={`text-lg font-medium transition-colors ${isLogin ? 'text-green-500' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setIsLogin(false)}
                      className={`text-lg font-medium transition-colors ${!isLogin ? 'text-green-500' : 'text-gray-400 hover:text-white'
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

                  <form
                    id="register-form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 
                               text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 
                                 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 
                               rounded-lg transition-colors focus:outline-none focus:ring-2 
                               focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      {isLogin ? 'Login' : 'Register'}
                    </button>
                  </form>

                  {!isLogin && (
                    <div className="mt-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-1 rounded border-gray-600 bg-gray-700 text-green-500"
                        />
                        <span className="text-sm text-gray-300">
                          I accept the <a href="/terms" className="text-green-500 hover:underline" target="_blank">Terms & Conditions</a> and
                          <a href="/privacy" className="text-green-500 hover:underline" target="_blank"> Privacy Policy</a>
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics Section */}
          <div className="max-w-7xl mx-auto px-4 pt-4 pb-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📏</span>
                  <h3 className="text-sm text-gray-300">Total Distance</h3>
                </div>
                <div className="text-2xl font-bold text-white">78.2 km</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⚡️</span>
                  <h3 className="text-sm text-gray-300">Sprint Distance</h3>
                </div>
                <div className="text-2xl font-bold text-white">1047 m</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🏃</span>
                  <h3 className="text-sm text-gray-300">Total Sprints</h3>
                </div>
                <div className="text-2xl font-bold text-white">83</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🚀</span>
                  <h3 className="text-sm text-gray-300">Top Sprint Speed</h3>
                </div>
                <div className="text-2xl font-bold text-white">7.7 m/s</div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-7xl mx-auto px-4 pt-8 sm:px-6 lg:px-8">
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
                    className="w-full h-auto object-contain rounded-lg bg-black/30"
                  />
                  <div className="flex items-center gap-3 mb-4 mt-4">
                    <span className="text-2xl">{feature.icon}</span>
                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing/CTA Section */}
          <div className="max-w-3xl mx-auto px-4 pt-24 pb-24 text-center">
            <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50">
              {/* Free Trial */}
              <div className="mb-8">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  Free Trial
                </div>
                <ul className="text-gray-300 space-y-2 mb-4">
                  <li>✓ First Game Analysis</li>
                  <li>✓ Create Team</li>
                  <li>✓ Full Feature Access</li>
                </ul>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    const registerForm = document.querySelector('#register-form');
                    if (registerForm) {
                      registerForm.scrollIntoView({ behavior: 'smooth' });
                      const emailInput = registerForm.querySelector('input[type="email"]');
                      if (emailInput) {
                        emailInput.focus();
                      }
                    }
                  }}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white text-xl font-medium rounded-lg transition-colors"
                >
                  Start Free Trial
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700 my-8" />

              {/* Premium */}
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  £75/month
                </div>
                <ul className="text-gray-300 space-y-2 mb-4">
                  <li>✓ Unlimited Games</li>
                  <li>✓ Priority Analysis</li>
                  <li>✓ Multiple Teams</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Demo video section temporarily disabled */}
          {/*
          <div className="max-w-5xl mx-auto px-4 pb-24">
            <div className="bg-gray-800/50 rounded-xl overflow-hidden">
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

              <div className="w-full bg-black">
                <div className="max-w-4xl mx-auto">
                  <div className="relative pt-[56.25%]">
                    <ReactPlayer
                      url="https://youtu.be/2ARfzK1vjZI"
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
          */}
        </div>
      </div>
    </div>
  );
}

export default Login;