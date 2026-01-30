import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer } from '../Common/AnimationVariants';
import Footer from '../Footer/Footer';
import {
  ProfileSettings,
  AppearanceSettings,
  FinancialSettings,
  DataManagement,
  AccountManagement,
  SecuritySettings,
  FeedbackAndSupport,
  ShortcutsSettings
} from './sections';
import OnboardingSettings from './sections/OnboardingSettings';
import NotificationSettings from './sections/NotificationSettings';
import { Account, Shortcut } from '../../types/types';

interface SettingsPageProps {
  user: any;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
  onUpdateCurrency: (currency: string) => void;
  defaultAccountId?: string | null;
  onSetDefaultAccount?: (accountId: string) => void;
  currency: string;
  categories: string[];
  onAddCategory: (category: string) => void;
  onEditCategory: (oldCategory: string, newCategory: string) => void;
  onDeleteCategory: (category: string) => void;
  onResetCategories: () => void;
  onUpdateCategories: (categories: string[]) => void;
  onLoadMockData?: () => void;
  onClearMockData?: () => void;
  onDeleteUserAccount?: () => void;
  onBackupData?: () => void;
  onRestoreData?: (data: any) => void;
  selectedFont: string;
  onUpdateFont: (font: string) => void;
  onUpdateUser: (name: string) => void;
  onOpenFeedbackModal: () => void;
  shortcuts: Shortcut[];
  onOpenShortcutModal: () => void;
  onEditShortcut: (shortcut: Shortcut) => void;
  onOpenShortcutHelp: () => void;
  userTimezone: string;
  onUpdateTimezone: (timezone: string) => void;
  hasCompletedOnboarding: boolean;
  onResetOnboarding: () => void;
  onTriggerOnboarding: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  onOpenMonthlyReport?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = (props) => {
  return (
    <>
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="space-y-8">
          <ProfileSettings user={props.user} onUpdateUser={props.onUpdateUser} />
          <AppearanceSettings
            darkMode={props.darkMode}
            onToggleDarkMode={props.onToggleDarkMode}
            selectedFont={props.selectedFont}
            onUpdateFont={props.onUpdateFont}
            userTimezone={props.userTimezone}
            onUpdateTimezone={props.onUpdateTimezone}
          />
          <FinancialSettings
            currency={props.currency}
            onUpdateCurrency={props.onUpdateCurrency}
            defaultAccountId={props.defaultAccountId}
            onSetDefaultAccount={props.onSetDefaultAccount}
            accounts={props.accounts}
            categories={props.categories}
            onAddCategory={props.onAddCategory}
            onEditCategory={props.onEditCategory}
            onDeleteCategory={props.onDeleteCategory}
            onResetCategories={props.onResetCategories}
            onUpdateCategories={props.onUpdateCategories}
          />
          <ShortcutsSettings
            shortcuts={props.shortcuts}
            onOpenShortcutModal={props.onOpenShortcutModal}
            onEditShortcut={props.onEditShortcut}
            onOpenHelp={props.onOpenShortcutHelp} // Add this new prop
          />
          <OnboardingSettings
            hasCompletedOnboarding={props.hasCompletedOnboarding}
            onResetOnboarding={props.onResetOnboarding}
            onTriggerOnboarding={props.onTriggerOnboarding}
          />
          <NotificationSettings
            userId={props.user?.uid || null}
            userTimezone={props.userTimezone}
            onShowToast={props.onShowToast}
          />
        </div>
        <div className="space-y-8">
          <AccountManagement
            accounts={props.accounts}
            onAddAccount={props.onAddAccount}
            onEditAccount={props.onEditAccount}
            onDeleteAccount={props.onDeleteAccount}
            currency={props.currency}
          />
          <DataManagement
            onBackupData={props.onBackupData}
            onRestoreData={props.onRestoreData}
            onLoadMockData={props.onLoadMockData}
            onClearMockData={props.onClearMockData}
            onOpenMonthlyReport={props.onOpenMonthlyReport}
          />
          <FeedbackAndSupport onOpenFeedbackModal={props.onOpenFeedbackModal} />
          <SecuritySettings onDeleteUserAccount={props.onDeleteUserAccount} />
        </div>
      </motion.div>
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        Version: {import.meta.env.VITE_APP_VERSION || 'development'}
      </div>
      <Footer />
    </>
  );
};

export default SettingsPage;