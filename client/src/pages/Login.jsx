import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { FiSun, FiMoon } from 'react-icons/fi';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/constants';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { loadUser } = useAuthStore();
  const { theme, setTheme, getCurrentTheme } = useThemeStore();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });

  const toggleTheme = () => {
    setTheme(getCurrentTheme() === 'dark' ? 'light' : 'dark');
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ email: '', username: '', password: '' });
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${API_URL}/api/auth/github`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Username validation (only for registration)
    if (!isLogin) {
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (formData.username.length > 20) {
        newErrors.username = 'Username must be less than 20 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores';
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (formData.password.length > 30) {
      newErrors.password = 'Password must be less than 30 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await api.post(endpoint, formData);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        await loadUser();
        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
        navigate('/');
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Authentication failed';
      
      // Check if error is field-specific
      if (error.response?.data?.field) {
        setErrors({ [error.response.data.field]: message });
      } else if (error.response?.data?.details) {
        // Handle multiple field errors from validation
        setErrors(error.response.data.details);
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/50 to-purple-50/50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 flex items-center justify-center p-4 relative transition-colors duration-500">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-400/20 dark:bg-primary-600/10 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-400/10 to-purple-400/10 dark:from-primary-600/5 dark:to-purple-600/5 rounded-full filter blur-3xl"></div>
      </div>

      {/* Theme Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:shadow-xl transition-all z-20"
      >
        <motion.div
          key={getCurrentTheme()}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {getCurrentTheme() === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </motion.div>
      </motion.button>

      <motion.div
        className="max-w-md w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            className="flex justify-center mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-4 rounded-2xl shadow-xl shadow-primary-500/30">
              <MessageCircle className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
          </motion.div>
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-primary-600 to-purple-600 dark:from-white dark:via-primary-400 dark:to-purple-400 bg-clip-text text-transparent mb-2"
            variants={itemVariants}
          >
            ChatApp
          </motion.h1>
          <motion.p
            className="text-gray-600 dark:text-gray-400 text-base"
            variants={itemVariants}
          >
            Connect and chat with anyone, anywhere
          </motion.p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl shadow-xl dark:shadow-dark-900/50 p-8 border border-gray-200/50 dark:border-gray-700/50"
          variants={itemVariants}
        >
          <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-dark-700 rounded-xl p-1">
            <button
              type="button"
              onClick={() => { if (!isLogin) switchMode(); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 ${isLogin
                  ? 'bg-white dark:bg-dark-600 text-primary-600 dark:text-primary-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { if (isLogin) switchMode(); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 ${!isLogin
                  ? 'bg-white dark:bg-dark-600 text-primary-600 dark:text-primary-400 shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className={`w-full pl-11 pr-4 py-3 border-2 ${errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500 dark:focus:ring-red-400' : 'focus:ring-primary-500 dark:focus:ring-primary-400'} focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500`}
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Username (Register only) */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative group"
                >
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors" size={20} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    className={`w-full pl-11 pr-4 py-3 border-2 ${errors.username ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 ${errors.username ? 'focus:ring-red-500 dark:focus:ring-red-400' : 'focus:ring-primary-500 dark:focus:ring-primary-400'} focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500`}
                  />
                  {errors.username && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1"
                    >
                      {errors.username}
                    </motion.p>
                  )}
                </motion.div>
              )}

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400 transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`w-full pl-11 pr-11 py-3 border-2 ${errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-600'} bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500 dark:focus:ring-red-400' : 'focus:ring-primary-500 dark:focus:ring-primary-400'} focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Processing...
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-dark-800 text-gray-500 dark:text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <motion.button
              onClick={handleGoogleLogin}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 font-medium shadow-sm hover:shadow-md bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-200"
            >
              <FcGoogle className="w-6 h-6" />
              <span>Continue with Google</span>
            </motion.button>

            <motion.button
              onClick={handleGithubLogin}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
            >
              <FaGithub className="w-6 h-6" />
              <span>Continue with GitHub</span>
            </motion.button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            By signing in, you agree to our{' '}
            <span className="text-primary-600 dark:text-primary-400 font-medium cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-primary-600 dark:text-primary-400 font-medium cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
