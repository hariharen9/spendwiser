import React, { useState, useEffect } from 'react';
import { DollarSign, Sun, Moon } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { motion } from 'framer-motion';
import { pageVariants, buttonHoverVariants } from '../../components/Common/AnimationVariants';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC04"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save theme preference
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (onLogin) {
        onLogin(user);
      }
      console.log('User signed in: ', user);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <motion.div 
      className="min-h-screen bg-slate-50 dark:bg-[#1A1A1A] flex items-center justify-center px-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-md w-full">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white dark:bg-[#242424] shadow-md hover:shadow-lg transition-shadow"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>

        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-[#007BFF] rounded-full mb-4"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <DollarSign className="h-8 w-8 text-white" />
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold text-slate-900 dark:text-[#F5F5F5] mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            SpendWiser
          </motion.h1>
          <motion.p 
            className="text-lg text-slate-600 dark:text-[#888888]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your Financial Command Center
          </motion.p>
        </motion.div>

        <motion.div 
          className="bg-white/80 dark:bg-[#242424]/80 rounded-lg p-8 border border-gray-200/50 dark:border-gray-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative">
            {/* Background gradient blur effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 via-red-500/30 to-green-500/30 rounded-xl blur-sm opacity-60 dark:opacity-40 animate-pulse"></div>
            
            <motion.button
              onClick={handleGoogleSignIn}
              className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 text-sm font-semibold text-gray-700 dark:text-[#F5F5F5] backdrop-blur-sm bg-white/90 dark:bg-[#242424]/90 border border-gray-200/60 dark:border-gray-700/60 rounded-xl hover:bg-white dark:hover:bg-[#242424] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] hover:-translate-y-0.5"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-red-500/10 to-green-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Enhanced glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 via-red-400/20 to-green-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              
              <GoogleIcon />
              <span className="relative z-10">Continue with Google</span>
            </motion.button>
          </div>

          <motion.div 
            className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-slate-600 dark:text-[#888888]">
              Secure, fast, and intuitive financial management
            </p>
          </motion.div>
        </motion.div>
        
        {/* Footer with attribution */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-sm text-slate-600 dark:text-[#888888]">
            Built with <span className="text-red-500">❤️</span> by <a href="https://hariharen9.site" target="_blank" rel="noopener noreferrer" className="text-[#007BFF] hover:underline dark:text-[#007BFF]">Hariharen</a> © 2025
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoginPage;