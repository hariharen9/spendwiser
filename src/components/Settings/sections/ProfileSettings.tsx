import React, { useState } from 'react';
import { User, Camera, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInVariants, buttonHoverVariants } from '../../Common/AnimationVariants';

interface ProfileSettingsProps {
  user: any;
  onUpdateUser: (name: string) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdateUser }) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');

  return (
    <motion.div
      className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden"
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
    >
      {/* Decorative Background Blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <motion.h3
        className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3 relative z-10"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
          <User size={20} />
        </div>
        <span>Profile & Identity</span>
      </motion.h3>

      <div className="flex flex-col md:flex-row gap-8 relative z-10">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-600">
              <motion.img
                src={user.photoURL || "https://i.pinimg.com/474x/18/b9/ff/18b9ffb2a8a791d50213a9d595c4dd52.jpg"}
                alt={user.displayName}
                className="w-full h-full rounded-full object-cover border-4 border-white dark:border-[#1A1A1A]"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </div>
            <div className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={14} />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avatar</p>
        </div>

        {/* Form Section */}
        <div className="flex-1 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow font-medium"
              placeholder="Enter your name"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                defaultValue={user.email}
                disabled
                className="w-full pl-11 pr-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed font-medium"
              />
            </div>
          </motion.div>

          <div className="pt-2 flex justify-end">
            <motion.button
              onClick={() => onUpdateUser(displayName)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={!displayName.trim() || displayName === user.displayName}
            >
              Save Changes
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSettings;