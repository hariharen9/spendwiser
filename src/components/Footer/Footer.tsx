import { motion } from 'framer-motion';
import { Github, Globe, DollarSign } from 'lucide-react';
import { FaPaypal, FaCoffee } from 'react-icons/fa';
import CurvedLoop from './CurvedLoop';

const Footer = () => {
  return (
    <footer className="text-black dark:text-white py-8 sm:py-16 px-6">
      <CurvedLoop 
        marqueeText="SpendWiser ✦ Your ✦ Ultimate ✦ Expense ✦ Tracker ✦"
        speed={1.8}
        curveAmount={700}
        direction="left"
        interactive={true}
        className="custom-text-style opacity-20 fill-black dark:fill-white text-[8rem] mx-auto"
      />
      <div className="max-w-6xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="sm:col-span-1 flex flex-col items-center md:items-start">
            <motion.div
              className="flex items-center mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <img src="/icon-money.svg" alt="SpendWiser Logo" className="h-10 w-10" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">SpendWiser</h1>
                </div>
              </div>
            </motion.div>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-3 sm:mb-6 max-w-md text-sm sm:text-base">
              The ultimate expense tracker that helps you manage your finances and achieve your financial goals.
            </p>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-3">
              Created by{' '}
              <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent font-semibold">
                Hariharen
              </span>
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <motion.a
                href="https://github.com/hariharen9"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-200 dark:bg-slate-800 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors"
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.9 }}
                title="GitHub Profile"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/in/hariharen9"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-200 dark:bg-slate-800 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors"
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.9 }}
                title="LinkedIn Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </motion.a>
              <motion.a
                href="https://hariharen9.site"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-200 dark:bg-slate-800 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors"
                whileHover={{ scale: 1.1, rotate: 2 }}
                whileTap={{ scale: 0.9 }}
                title="Personal Website"
              >
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-400">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: 'Source Code', url: 'https://github.com/hariharen9/spendwiser' },
                { name: 'Issues', url: 'https://github.com/hariharen9/spendwiser/issues' },
                { name: 'LICENSE', url: 'https://github.com/hariharen9/spendwiser/blob/main/LICENSE' },
                { name: 'Pull Requests', url: 'https://github.com/hariharen9/spendwiser/pulls' },
                { name: 'Discussions', url: 'https://github.com/hariharen9/spendwiser/discussions' },
                { name: 'Contributing', url: 'https://github.com/hariharen9/spendwiser/blob/main/CONTRIBUTING.md' },
                { name: 'Releases', url: 'https://github.com/hariharen9/spendwiser/releases' }
              ].map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-slate-300 hover:text-black dark:hover:text-gray-400 transition-colors block"
                    whileHover={{ x: 5 }}
                  >
                    {link.name}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-400">Impact</h4>
            <div className="space-y-3">
              {[
                { label: 'Financial Clarity', value: '+90%' },
                { label: 'Budget Adherence', value: '+75%' },
                { label: 'Stress Reduction', value: '-50%' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="flex justify-between items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-gray-600 dark:text-slate-300 text-sm">{stat.label}</span>
                  <span className="text-green-400 font-semibold">{stat.value}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl border border-slate-700">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                  💖 Love SpendWiser? Consider supporting the development!
                </p>
                <div className="flex justify-center gap-3">
                  <a 
                    href="https://www.buymeacoffee.com/hariharen" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform"
                  >
                    <FaCoffee className="w-3 h-3" />
                    <span className="text-xs">Buy Me a Coffee</span>
                  </a>
                  <a 
                    href="https://paypal.me/thisishariharen" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform"
                  >
                    <FaPaypal className="w-3 h-3" />
                    <span className="text-xs">PayPal</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="border-t border-slate-700 pt-8 mt-16 flex flex-col md:flex-row items-center justify-between text-center md:text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-500 dark:text-slate-400 mb-4 md:mb-0">
            © 2025 SpendWiser. Built with 💜 by{' '}
            <a 
              href="https://hariharen9.site" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              Hariharen
            </a>
          </p>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
           Clarity in finance, confidence in life.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;