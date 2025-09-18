
import React, { useState } from 'react';
import { User } from 'lucide-react';
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
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
    >
      <motion.h3
        className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6 flex items-center space-x-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <User className="h-5 w-5" />
        <span>Profile Settings</span>
      </motion.h3>

      <motion.div
        className="flex items-center space-x-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.img
          src={user.photoURL || "https://i.pinimg.com/474x/18/b9/ff/18b9ffb2a8a791d50213a9d595c4dd52.jpg"}
          alt={user.displayName}
          className="h-20 w-20 rounded-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-600 dark:text-[#888888] mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-600 dark:text-[#888888] mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue={user.email}
                disabled
                className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
              />
            </motion.div>
          </div>
          <motion.button
              onClick={() => onUpdateUser(displayName)}
              className="mt-4 px-4 py-2 bg-[#007BFF] text-white rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={!displayName.trim() || displayName === user.displayName}
            >
              Update Name
            </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileSettings;
