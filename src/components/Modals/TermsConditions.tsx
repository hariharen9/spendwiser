import React from 'react';

const TermsConditions = () => {
  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Last Updated: January 01, 2026
      </div>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">1. Agreement to Terms</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          By accessing and using <strong>SpendWiser</strong>, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you are prohibited from using this service.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">2. Nature of Service (Disclaimer)</h3>
        <ul className="list-disc list-outside ml-5 space-y-1 text-gray-700 dark:text-gray-300">
          <li><strong>Not Financial Advice:</strong> SpendWiser is a tool for tracking and visualization purposes only. I am a developer, not a financial advisor. The insights, charts, and calculations provided by the app should <strong>not</strong> be considered professional financial advice.</li>
          <li><strong>Accuracy:</strong> While I strive for accuracy, I cannot guarantee that all calculations or data representations are error-free. You should verify any critical financial figures independently.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">3. User Accounts</h3>
        <ul className="list-disc list-outside ml-5 space-y-1 text-gray-700 dark:text-gray-300">
          <li>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</li>
          <li>You agree to provide accurate and complete information when using the service.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">4. Intellectual Property</h3>
        <p className="text-gray-700 dark:text-gray-300">
          The source code, design, and functionality of SpendWiser are the intellectual property of <strong>Hariharen</strong>, unless otherwise noted (e.g., open-source libraries used). You may not reproduce or distribute the core application without permission, though the project is open-source on GitHub for educational and contribution purposes under its specific license.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">5. Termination</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          I reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          You may terminate your account at any time by using the <strong>"Delete Account"</strong> feature in Settings.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">6. Limitation of Liability</h3>
        <p className="text-gray-700 dark:text-gray-300">
          In no event shall Hariharen or SpendWiser be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">7. "As Is" and "As Available" Disclaimer</h3>
        <p className="text-gray-700 dark:text-gray-300">
          The Service is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">8. Governing Law</h3>
        <p className="text-gray-700 dark:text-gray-300">
          These Terms shall be governed and construed in accordance with the laws of <strong>India</strong>, without regard to its conflict of law provisions.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">9. Changes</h3>
        <p className="text-gray-700 dark:text-gray-300">
          I reserve the right, at my sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
        </p>
      </section>
    </div>
  );
};

export default TermsConditions;
