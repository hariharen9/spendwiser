import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

interface EmailAuthFormProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 12,
    },
  },
};

const EmailAuthForm: React.FC<EmailAuthFormProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(true);

  const validatePassword = (pass: string) => {
    if (pass.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (!/[A-Za-z]/.test(pass)) {
      return "Must contain at least one letter.";
    }
    if (!/\d/.test(pass)) {
      return "Must contain at least one number.";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) {
      return "Must contain at least one symbol.";
    }
    return null;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setError(null); // Clear general error on new input
    setNotification(null);

    if (!isSigningIn && newPassword) {
      setPasswordError(validatePassword(newPassword));
    } else {
      setPasswordError(null);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setNotification(null);
    if (!email) {
      setError("Please enter your email to receive a reset link.");
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setNotification("Password reset email sent. Check your inbox (and spam folder).");
    } catch (err: any) {
      setNotification(null);
      switch (err.code) {
        case 'auth/user-not-found':
          setError("No account found with this email address.");
          break;
        case 'auth/invalid-email':
          setError("The email address is not valid.");
          break;
        default:
          setError("Failed to send reset email. Please try again later.");
          console.error("Password Reset Error:", err);
          break;
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotification(null);

    if (!isSigningIn) {
      const validationError = validatePassword(password);
      if (validationError) {
        setPasswordError(validationError);
        return;
      }
    }

    setIsLoading(true);
    try {
      const authAction = isSigningIn
        ? signInWithEmailAndPassword(auth, email, password)
        : createUserWithEmailAndPassword(auth, email, password);
        
      const userCredential = await authAction;
      
      if (onLogin) {
        onLogin(userCredential.user);
      }
    } catch (err: any) {
      // Reset password error as this is a server error
      setPasswordError(null);
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          setError("Invalid credentials. Check your email and password.");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password. Please try again.");
          break;
        case 'auth/email-already-in-use':
          setError("An account already exists with this email. Try signing in.");
          break;
        case 'auth/weak-password':
          setError("Password is too weak. Please choose a stronger one.");
          break;
        default:
          setError("An unexpected error occurred. Please try again.");
          console.error("Auth Error:", err);
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="w-full max-w-sm flex-shrink-0"
      variants={formContainerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-red-500/20 to-green-500/20 rounded-2xl blur-sm opacity-50 dark:opacity-30 animate-pulse"></div>
        <motion.div 
          className="relative backdrop-blur-xl bg-white/50 dark:bg-[#1A1A1A]/60 border border-white/20 rounded-2xl p-8 shadow-2xl"
        >
          <motion.button 
            onClick={onBack} 
            className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors z-10"
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9, rotate: 0 }}
            variants={formItemVariants}
          >
            <X size={24} />
          </motion.button>

          <form onSubmit={handleAuth} className="flex flex-col space-y-4">
            <motion.div variants={formItemVariants} className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                {isSigningIn ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                {isSigningIn ? 'Enter your credentials to continue' : 'Your financial journey starts here'}
              </p>
            </motion.div>
            
            <motion.div variants={formItemVariants} className="relative flex flex-col gap-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <motion.input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                    setNotification(null)
                  }}
                  required
                  whileFocus={{ scale: 1.02 }}
                  className="w-full pl-12 pr-4 py-3 text-slate-800 dark:text-white bg-white/50 dark:bg-black/30 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <motion.input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    whileFocus={{ scale: 1.02 }}
                    className="w-full pl-12 pr-4 py-3 text-slate-800 dark:text-white bg-white/50 dark:bg-black/30 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
                <AnimatePresence>
                  {!isSigningIn && passwordError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: '8px' }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="text-xs text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle size={14} />
                      <span>{passwordError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
               <AnimatePresence>
                {isSigningIn && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-right -mt-2"
                  >
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      disabled={isLoading || isResetting}
                      className="text-xs font-medium text-slate-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-50 flex items-center gap-1 justify-end"
                    >
                      {isResetting ? (
                        <>
                          <Loader size={12} className="animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        'Forgot Password?'
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {notification && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -5, height: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25, duration: 0.5 }}
                  className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 p-3 rounded-lg overflow-hidden"
                >
                  <CheckCircle size={16} className="flex-shrink-0" />
                  <span className="flex-1">{notification}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto', x: [-2, 2, -2, 2, 0] }}
                  exit={{ opacity: 0, y: -5, height: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25, duration: 0.5 }}
                  className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg overflow-hidden"
                >
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span className="flex-1">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={formItemVariants}>
              <motion.button
                type="submit"
                disabled={isLoading || isResetting || !email || !password || (!isSigningIn && !!passwordError)}
                className="w-full px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                whileHover={{ scale: 1.03, y: -3, boxShadow: '0px 12px 25px rgba(20, 184, 166, 0.3)' }}
                whileTap={{ scale: 0.98, y: 0 }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isLoading ? 'loading' : 'ready'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (isSigningIn ? 'Sign In' : 'Sign Up')}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </motion.div>
            
            <motion.div variants={formItemVariants} className="text-center text-sm">
              <button 
                type="button"
                onClick={() => {
                  setIsSigningIn(!isSigningIn);
                  setError(null);
                  setPasswordError(null);
                  setNotification(null);
                }} 
                className="text-slate-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors"
              >
                {isSigningIn ? (
                  <>
                    Don't have an account? <span className="font-semibold text-blue-500">Sign Up</span>
                  </>
                ) : (
                  <>
                    Already have an account? <span className="font-semibold text-blue-500">Sign In</span>
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EmailAuthForm;
