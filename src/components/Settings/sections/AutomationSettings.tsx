import React, { useState, useEffect } from 'react';
import { Smartphone, Copy, RefreshCw, Trash2, Key, ShieldCheck, Github, Zap, Eye, EyeOff, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInVariants, buttonHoverVariants } from '../../Common/AnimationVariants';
import { User } from '../../../types/types';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

interface AutomationSettingsProps {
  user: User;
  listenerApiKey?: string;
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const generateUUID = () => crypto.randomUUID();

const AutomationSettings: React.FC<AutomationSettingsProps> = ({ user, listenerApiKey, onShowToast }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState('');
  const [savedGeminiKey, setSavedGeminiKey] = useState<string | undefined>(undefined);
  const [isSavingGeminiKey, setIsSavingGeminiKey] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchKey = async () => {
      try {
        const snap = await getDoc(doc(db, 'spenders', user.uid));
        if (snap.exists()) {
          const key = snap.data().geminiApiKey;
          setSavedGeminiKey(key);
          if (key) setGeminiApiKeyInput(key);
        }
      } catch (err) {
        console.error("Failed to fetch API key:", err);
      }
    };
    fetchKey();
  }, [user?.uid]);

  const handleSaveGeminiKey = async () => {
    if (!user || !user.uid) return;
    setIsSavingGeminiKey(true);
    try {
      const userRef = doc(db, 'spenders', user.uid);
      await updateDoc(userRef, {
        geminiApiKey: geminiApiKeyInput || null,
      });
      setSavedGeminiKey(geminiApiKeyInput || undefined);
      onShowToast('Gemini API Key saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving Gemini API key:', error);
      onShowToast('Failed to save Gemini API Key.', 'error');
    } finally {
      setIsSavingGeminiKey(false);
    }
  };

  const handleClearGeminiKey = async () => {
    if (!user || !user.uid) return;
    if (!window.confirm('Are you sure you want to clear your Gemini API Key? Automation will fall back to basic Regex.')) return;
    setGeminiApiKeyInput('');
    setIsSavingGeminiKey(true);
    try {
      const userRef = doc(db, 'spenders', user.uid);
      await updateDoc(userRef, {
        geminiApiKey: null,
      });
      setSavedGeminiKey(undefined);
      onShowToast('Gemini API Key cleared.', 'info');
    } catch (error) {
      console.error('Error clearing Gemini API key:', error);
      onShowToast('Failed to clear Gemini API Key.', 'error');
    } finally {
      setIsSavingGeminiKey(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!user || !user.uid) return;
    setIsGenerating(true);
    try {
      const newKey = generateUUID();
      const userRef = doc(db, 'spenders', user.uid);
      await updateDoc(userRef, {
        listenerApiKey: newKey,
      });
      onShowToast('New API Key generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating API key:', error);
      onShowToast('Failed to generate API Key.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeKey = async () => {
    if (!user || !user.uid) return;
    if (!window.confirm('Are you sure you want to revoke this key? The companion app will stop working.')) return;
    try {
      const userRef = doc(db, 'spenders', user.uid);
      await updateDoc(userRef, {
        listenerApiKey: null,
      });
      onShowToast('API Key revoked successfully.', 'info');
    } catch (error) {
      console.error('Error revoking API key:', error);
      onShowToast('Failed to revoke API Key.', 'error');
    }
  };

  const handleCopyKey = () => {
    if (listenerApiKey) {
      navigator.clipboard.writeText(listenerApiKey);
      onShowToast('API Key copied to clipboard!', 'success');
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
    >
      <motion.h3
        className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4 flex items-center space-x-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Smartphone className="h-5 w-5 text-indigo-500" />
        <span>SMS Automation</span>
      </motion.h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Generate an API key to link your Android Companion App. This enables zero-touch SMS transaction tracking.
      </p>

      <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 flex items-center space-x-2 mb-2">
          <Zap className="h-4 w-4 text-indigo-500" />
          <span>For the Tech-Savvy Spender 🤓</span>
        </h4>
        <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-3 leading-relaxed">
          Why pay for premium finance apps that force shady bank integrations? By sideloading an Android Listener communicating with our fast <strong>serverless</strong> backend, you get a <strong>zero-cost, completely safe, and 100% free</strong> automation pipeline. 
        </p>
        <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-3 leading-relaxed">
          It's a completely transparent, open way to do this. Simply put: the best way to handle private financial automation.
        </p>
        <div className="flex items-center space-x-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Privacy first. Your texts, your database.</span>
        </div>
        <div className="border-t border-indigo-200/50 dark:border-indigo-800/30 pt-4">
          <a 
            href="https://github.com/hariharen9/spendwiser-listener" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 w-full py-2.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800/50 dark:hover:bg-indigo-700 text-indigo-800 dark:text-indigo-200 rounded-lg transition-colors text-sm font-semibold"
          >
            <Github className="h-4 w-4" />
            <span>View README & Get the App</span>
          </a>
        </div>
      </div>

      {listenerApiKey ? (
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-[#1a1a1a] p-3 rounded-lg flex items-center justify-between border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 overflow-hidden">
              <Key className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <span className="text-sm font-mono text-gray-800 dark:text-gray-300 truncate select-all">
                {listenerApiKey}
              </span>
            </div>
            <motion.button
              onClick={handleCopyKey}
              className="p-2 text-gray-500 hover:text-indigo-500 transition-colors"
              title="Copy to clipboard"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Copy className="h-4 w-4" />
            </motion.button>
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              onClick={handleGenerateKey}
              disabled={isGenerating}
              className="flex-1 flex items-center justify-center space-x-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate Key</span>
            </motion.button>
            <motion.button
              onClick={handleRevokeKey}
              className="flex items-center justify-center space-x-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-4 py-2 rounded-lg font-medium text-sm"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Trash2 className="h-4 w-4" />
              <span>Revoke</span>
            </motion.button>
          </div>
        </div>
      ) : (
        <motion.button
          onClick={handleGenerateKey}
          disabled={isGenerating}
          className="w-full flex items-center justify-center space-x-2 bg-indigo-500 text-white px-4 py-3 rounded-lg font-medium text-sm hover:bg-indigo-600 transition-colors disabled:opacity-50"
          variants={buttonHoverVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Key className="h-4 w-4" />
          <span>{isGenerating ? 'Generating...' : 'Generate Listener API Key'}</span>
        </motion.button>
      )}

      {/* BYOK Section */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-[#F5F5F5] mb-2 flex items-center space-x-2">
          <Key className="h-4 w-4 text-emerald-500" />
          <span>Personal Gemini API Key (BYOK)</span>
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
          Provide your own Google Gemini API key to enable instant, high-accuracy SMS parsing. This guarantees you never hit our global limits. If left blank, parsing will fall back to a basic text matcher.
        </p>

        <div className="space-y-3">
          <div className="relative">
            <input
              type={isKeyVisible ? "text" : "password"}
              value={geminiApiKeyInput}
              onChange={(e) => setGeminiApiKeyInput(e.target.value)}
              placeholder="AIzaSyB..."
              className="w-full bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-[#f5f5f5] text-sm rounded-lg pr-10 pl-3 py-2.5 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setIsKeyVisible(!isKeyVisible)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              onClick={handleSaveGeminiKey}
              disabled={isSavingGeminiKey || geminiApiKeyInput === savedGeminiKey}
              className="flex-1 flex items-center justify-center space-x-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
              variants={buttonHoverVariants}
              whileHover={isSavingGeminiKey || geminiApiKeyInput === savedGeminiKey ? "initial" : "hover"}
              whileTap={isSavingGeminiKey || geminiApiKeyInput === savedGeminiKey ? "initial" : "tap"}
            >
              <Save className={`h-4 w-4 flex-shrink-0 ${isSavingGeminiKey ? 'animate-pulse' : ''}`} />
              <span>{isSavingGeminiKey ? 'Saving...' : 'Save Key'}</span>
            </motion.button>

            {savedGeminiKey && (
              <motion.button
                onClick={handleClearGeminiKey}
                disabled={isSavingGeminiKey}
                className="flex items-center justify-center space-x-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AutomationSettings;