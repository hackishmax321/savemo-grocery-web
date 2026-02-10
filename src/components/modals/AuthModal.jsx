import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notify } from 'notiflix';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaMapMarkerAlt,
  FaUserPlus,
  FaSignInAlt,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaGithub,
  FaGoogle
} from 'react-icons/fa';
import { 
  MdOutlineRememberMe,
  MdCheckCircle
} from 'react-icons/md';
import userService from '../../services/User.service';

// Notiflix configuration
Notify.init({
  position: 'top-right',
  distance: '20px',
  borderRadius: '8px',
  timeout: 4000,
  clickToClose: true,
  cssAnimationStyle: 'from-right',
});

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      province: '',
      postalCode: '',
    },
  });

  // Reset forms when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setLoginForm({ email: '', password: '' });
      setRegisterForm({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        address: { street: '', city: '', province: '', postalCode: '' },
      });
    }
  }, [isOpen]);

  // Handle login form changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle register form changes
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setRegisterForm(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setRegisterForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Validate login form
  const validateLoginForm = () => {
    if (!loginForm.email.trim()) {
      Notify.failure('Please enter your email address');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      Notify.failure('Please enter a valid email address');
      return false;
    }
    
    if (!loginForm.password) {
      Notify.failure('Please enter your password');
      return false;
    }
    
    if (loginForm.password.length < 6) {
      Notify.failure('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  // Validate register form
  const validateRegisterForm = () => {
    // Name validation
    if (!registerForm.displayName.trim()) {
      Notify.failure('Please enter your full name');
      return false;
    }
    
    if (registerForm.displayName.trim().length < 2) {
      Notify.failure('Name must be at least 2 characters long');
      return false;
    }
    
    // Email validation
    if (!registerForm.email.trim()) {
      Notify.failure('Please enter your email address');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      Notify.failure('Please enter a valid email address');
      return false;
    }
    
    // Password validation
    if (!registerForm.password) {
      Notify.failure('Please enter a password');
      return false;
    }
    
    if (registerForm.password.length < 6) {
      Notify.failure('Password must be at least 6 characters long');
      return false;
    }
    
    // Confirm password
    if (registerForm.password !== registerForm.confirmPassword) {
      Notify.failure('Passwords do not match');
      return false;
    }
    
    // Phone validation (optional but validate format if provided)
    if (registerForm.phoneNumber && !/^[0-9+\-\s()]{10,}$/.test(registerForm.phoneNumber)) {
      Notify.failure('Please enter a valid phone number');
      return false;
    }
    
    return true;
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) return;
    
    setLoading(true);
    
    try {
      const result = await userService.login(loginForm.email, loginForm.password);
      
      if (result.success) {
        // Store user in sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(result.user));
        sessionStorage.setItem('isAuthenticated', 'true');
        
        Notify.success('Login successful! Redirecting...');
        
        // Close modal and redirect
        setTimeout(() => {
          onClose();
          window.location.href = '/';
        }, 1500);
      } else {
        Notify.failure(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      Notify.failure('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle register submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) return;
    
    setLoading(true);
    
    try {
      const result = await userService.register(
        registerForm.email,
        registerForm.password,
        {
          displayName: registerForm.displayName,
          phoneNumber: registerForm.phoneNumber,
          address: registerForm.address
        }
      );
      
      if (result.success) {
        Notify.success(
          'Registration successful! Please check your email for verification. ' +
          'You can now login with your credentials.'
        );
        
        // Reset form and switch to login
        setRegisterForm({
          displayName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phoneNumber: '',
          address: { street: '', city: '', province: '', postalCode: '' },
        });
        
        // Switch to login form after delay
        setTimeout(() => {
          setIsLogin(true);
        }, 2000);
      } else {
        Notify.failure(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      Notify.failure('An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!loginForm.email.trim()) {
      Notify.warning('Please enter your email address to reset password');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      Notify.failure('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await userService.resetPassword(loginForm.email);
      
      if (result.success) {
        Notify.info('Password reset email sent! Please check your inbox.');
      } else {
        Notify.failure(result.error || 'Failed to send reset email.');
      }
    } catch (error) {
      Notify.failure('An error occurred. Please try again.');
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Modal variants for animation
  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: -50
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  const formVariants = {
    hidden: { 
      opacity: 0,
      x: isLogin ? -100 : 100 
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0,
      x: isLogin ? 100 : -100,
      transition: {
        duration: 0.2
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaTimes size={24} />
        </button>

        {/* Left side - Blue image area */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 to-blue-800 p-8">
          <div className="flex flex-col justify-center items-center text-white w-full">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                {isLogin ? 'Welcome Back!' : 'Join Our Community'}
              </h2>
              <p className="text-blue-100">
                {isLogin 
                  ? 'Sign in to access your account and continue shopping'
                  : 'Create an account to enjoy exclusive features and benefits'
                }
              </p>
            </div>
            
            <div className="relative w-full h-48">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Authentication"
                className="w-full h-full object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent rounded-xl"></div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isLogin ? 'bg-white' : 'bg-white/30'}`}></div>
                <div className={`w-3 h-3 rounded-full ${!isLogin ? 'bg-white' : 'bg-white/30'}`}></div>
              </div>
              <p className="mt-4 text-blue-200 text-sm">
                {isLogin 
                  ? "Don't have an account? " 
                  : "Already have an account? "
                }
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold hover:underline"
                >
                  {isLogin ? 'Sign up here' : 'Sign in here'}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Form area */}
        <div className="flex-1 lg:w-3/5 max-h-[90vh] overflow-y-auto p-8">
          <div className="max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Login header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                      <FaSignInAlt className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Sign In to Your Account</h3>
                    <p className="text-gray-600 mt-2">Enter your credentials to continue</p>
                  </div>

                  {/* Login form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    {/* Email field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          value={loginForm.email}
                          onChange={handleLoginChange}
                          className="w-full text-black/80 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="you@example.com"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          disabled={loading}
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={loginForm.password}
                          onChange={handleLoginChange}
                          className="w-full text-black/80 pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="••••••••"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={loading}
                        >
                          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me checkbox */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={loading}
                      />
                      <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 flex items-center">
                        <MdOutlineRememberMe className="mr-1" />
                        Remember me
                      </label>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <FaSignInAlt className="w-5 h-5 mr-2" />
                          Sign In
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  {/* Social login buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={loading}
                      className="py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <FaGithub className="w-5 h-5 mr-2 text-gray-700" />
                      GitHub
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      className="py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <FaGoogle className="w-5 h-5 mr-2 text-red-600" />
                      Google
                    </button>
                  </div>

                  {/* Switch to register */}
                  <div className="text-center pt-4">
                    <p className="text-gray-600">
                      Don't have an account?{' '}
                      <button
                        onClick={() => setIsLogin(false)}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center justify-center mx-auto"
                        disabled={loading}
                      >
                        <FaUserPlus className="mr-2" />
                        Sign up now
                      </button>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Register header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                      <FaUserPlus className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Create Your Account</h3>
                    <p className="text-gray-600 mt-2">Join us today! It only takes a minute</p>
                  </div>

                  {/* Register form */}
                  <form onSubmit={handleRegisterSubmit} className="space-y-6">
                    {/* Display Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="displayName"
                          value={registerForm.displayName}
                          onChange={handleRegisterChange}
                          className="w-full text-black/80 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="John Doe"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          value={registerForm.email}
                          onChange={handleRegisterChange}
                          className="w-full text-black/80 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="you@example.com"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={registerForm.phoneNumber}
                          onChange={handleRegisterChange}
                          className="w-full text-black/80 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="071 234 5678"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={registerForm.password}
                          onChange={handleRegisterChange}
                          className="w-full text-black/80 pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="••••••••"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={loading}
                        >
                          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={registerForm.confirmPassword}
                          onChange={handleRegisterChange}
                          className="w-full text-black/80 pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="••••••••"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={loading}
                        >
                          {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FaMapMarkerAlt className="w-5 h-5 mr-2 text-blue-600" />
                        Address Information
                      </h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="address.street"
                          value={registerForm.address.street}
                          onChange={handleRegisterChange}
                          className="w-full text-black/80 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="123 Main Street"
                          disabled={loading}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            name="address.city"
                            value={registerForm.address.city}
                            onChange={handleRegisterChange}
                            className="w-full text-black/80 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Colombo"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Province
                          </label>
                          <select
                            name="address.province"
                            value={registerForm.address.province}
                            onChange={handleRegisterChange}
                            className="w-full text-black/80 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            disabled={loading}
                          >
                            <option value="">Select Province</option>
                            <option value="Western">Western</option>
                            <option value="Central">Central</option>
                            <option value="Southern">Southern</option>
                            <option value="Northern">Northern</option>
                            <option value="Eastern">Eastern</option>
                            <option value="North Western">North Western</option>
                            <option value="North Central">North Central</option>
                            <option value="Uva">Uva</option>
                            <option value="Sabaragamuwa">Sabaragamuwa</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="address.postalCode"
                          value={registerForm.address.postalCode}
                          onChange={handleRegisterChange}
                          className="w-full text-black/80 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="00100"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-blue-500"
                        disabled={loading}
                      />
                      <label htmlFor="terms" className="ml-2 text-sm text-gray-700 flex items-start">
                        <MdCheckCircle className="mt-0.5 mr-1 text-green-600 flex-shrink-0" />
                        I agree to the{' '}
                        <a href="/terms" className="text-blue-600 hover:text-blue-800 font-medium mx-1">
                          Terms and Conditions
                        </a>
                        {' '}and{' '}
                        <a href="/privacy" className="text-blue-600 hover:text-blue-800 font-medium mx-1">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="w-5 h-5 mr-2" />
                          Create Account
                        </>
                      )}
                    </button>
                  </form>

                  {/* Switch to login */}
                  <div className="text-center pt-4">
                    <p className="text-gray-600">
                      Already have an account?{' '}
                      <button
                        onClick={() => setIsLogin(true)}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center justify-center mx-auto"
                        disabled={loading}
                      >
                        <FaSignInAlt className="mr-2" />
                        Sign in here
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;