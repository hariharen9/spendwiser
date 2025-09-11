import React from 'react';
import { DollarSign } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { motion } from 'framer-motion';
import { pageVariants, buttonHoverVariants } from '../../components/Common/AnimationVariants';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
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

  return (
    <motion.div 
      className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-md w-full">
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
            className="text-4xl font-bold text-[#F5F5F5] mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            SpendWise
          </motion.h1>
          <motion.p 
            className="text-lg text-[#888888]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your Financial Command Center
          </motion.p>
        </motion.div>

        <motion.div 
          className="bg-[#242424] rounded-lg p-8 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-gray-900 py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center space-x-3"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign in with Google</span>
          </motion.button>

          <motion.div 
            className="mt-6 pt-6 border-t border-gray-600 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-[#888888]">
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
          <p className="text-sm text-[#888888]">
            Built with <span className="text-red-500">❤️</span> by <a href="https://hariharen9.site" target="_blank" rel="noopener noreferrer" className="text-[#007BFF] hover:underline">Hariharen</a>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoginPage;