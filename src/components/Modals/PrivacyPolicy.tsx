import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Last Updated: January 01, 2026
      </div>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">1. Introduction</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Welcome to <strong>SpendWiser</strong>. I am <strong>Hariharen</strong>, a solo developer, and I built SpendWiser to help individuals track their personal finances. I am committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this policy, or my practices with regards to your personal information, please contact me.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">2. Information We Collect</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-2">SpendWiser collects information that you provide directly to us:</p>
        <ul className="list-disc list-outside ml-5 space-y-1 text-gray-700 dark:text-gray-300">
          <li><strong>Account Information:</strong> When you sign up via Google Authentication, we receive your email address, name, and profile picture.</li>
          <li><strong>Financial Data:</strong> We store the transaction details, budget limits, account names, loan details, and goals you explicitly enter into the application.</li>
          <li><strong>Usage Data:</strong> We collect anonymous usage statistics (e.g., number of transactions added, features used) to help improve the application.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">3. How We Use Your Information</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-2">We use your information solely to:</p>
        <ul className="list-disc list-outside ml-5 space-y-1 text-gray-700 dark:text-gray-300">
          <li>Provide, operate, and maintain the SpendWiser application.</li>
          <li>Authenticate your identity and secure your data.</li>
          <li>Calculate and display your financial insights (e.g., spending charts, net worth).</li>
          <li>Improve user experience and fix bugs.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">4. Data Storage and Security</h3>
        <ul className="list-disc list-outside ml-5 space-y-1 text-gray-700 dark:text-gray-300">
          <li><strong>Database:</strong> Your data is stored securely in <strong>Google Firebase's Firestore</strong> database.</li>
          <li><strong>Authentication:</strong> Authentication is handled by <strong>Google Firebase Auth</strong>. We do not store your passwords directly.</li>
          <li><strong>Security:</strong> We implement security measures designed to protect your data, including encryption in transit and at rest provided by Google Cloud Platform. However, please remember that no method of transmission over the internet is 100% secure.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">5. Sharing Your Information</h3>
        <ul className="list-disc list-outside ml-5 space-y-1 text-gray-700 dark:text-gray-300">
          <li><strong>No Sale of Data:</strong> I do <strong>not</strong> sell, trade, or rent your personal information to third parties.</li>
          <li><strong>Service Providers:</strong> We may share data with trusted third-party service providers (like Google Firebase) solely for the purpose of hosting and running the application.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">6. Your Rights</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-2">You have the right to:</p>
        <ul className="list-disc list-outside ml-5 space-y-1 text-gray-700 dark:text-gray-300">
          <li><strong>Access:</strong> View all your data within the application dashboard.</li>
          <li><strong>Edit:</strong> Modify any transaction or setting at any time.</li>
          <li><strong>Delete:</strong> You can delete your entire account and all associated data permanently via the "Settings" page. This action is <strong>irreversible</strong>.</li>
          <li><strong>Export:</strong> You can export your transaction data to CSV or PDF formats.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">7. Cookies and Local Storage</h3>
        <p className="text-gray-700 dark:text-gray-300">
          SpendWiser uses local storage to remember your preferences (like Dark Mode settings and Onboarding status). We do not use cookies for tracking purposes across other websites.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">8. Changes to This Policy</h3>
        <p className="text-gray-700 dark:text-gray-300">
          I may update this privacy policy from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">9. Contact</h3>
        <p className="text-gray-700 dark:text-gray-300">
          If you have questions about this policy, you can contact me via the links provided in the footer (GitHub/LinkedIn).
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
