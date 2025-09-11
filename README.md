# SpendWiser - Personal Finance Tracker

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/hariharen9/spendwise/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Backend-orange)](https://firebase.google.com/)

A modern, responsive personal finance tracker built with React, TypeScript, and Firebase. SpendWiser helps you take control of your finances with beautiful visualizations, insightful analytics, and intuitive transaction management.

![SpendWiser Dashboard](./docs/dashboard.png)

## 🌟 Features

### 💰 Comprehensive Financial Tracking
- **Transaction Management**: Add, edit, and delete income and expense transactions
- **Multi-Account Support**: Track multiple bank accounts and credit cards
- **Budget Planning**: Set category-based budgets and monitor spending
- **Real-time Sync**: All data synced across devices with Firebase

### 📊 Powerful Analytics & Insights
- **Interactive Dashboards**: Drag-and-drop customizable widgets
- **Spending Visualization**: Charts showing spending patterns over time
- **Income vs Expense**: Compare your earnings and expenditures
- **Category Breakdown**: See where your money goes with detailed charts
- **Financial Metrics**: Key indicators like savings rate and emergency fund progress
- **Subscription Tracking**: Automatically identify recurring subscriptions
- **Achievements System**: Gamified financial goals to keep you motivated

### 📱 Responsive Design
- **Mobile-First Approach**: Optimized for all device sizes
- **Collapsible Filters**: Streamlined mobile transaction filtering
- **Card-Based Transactions**: Expandable transaction cards for mobile
- **Dark/Light Mode**: Automatic dark mode based on system preference

### 🛠️ Advanced Tools
- **CSV Import/Export**: Easily import transactions from your bank
- **Data Visualization**: Beautiful charts powered by Recharts
- **Animations**: Smooth transitions with Framer Motion
- **Customizable Widgets**: Rearrange dashboard components to your preference

## 🚀 Technology Stack

- **Frontend**: React 18 with TypeScript
- **State Management**: React Hooks and Context API
- **Styling**: Tailwind CSS for responsive design
- **Animations**: Framer Motion for smooth UI interactions
- **Charts**: Recharts for data visualization
- **Backend**: Firebase (Authentication & Firestore)
- **Build Tool**: Vite for fast development and production builds
- **Icons**: Lucide React

## 📸 Screenshots

### Dashboard
![Dashboard](./docs/dashboard.png)
*Fully customizable dashboard with drag-and-drop widgets*

### Transactions
![Transactions](./docs/transactions.png)
*Powerful transaction management with filtering and sorting*

### Mobile View
<p float="left">
  <img src="./docs/mobile-dashboard.png" width="30%" />
  <img src="./docs/mobile-transactions.png" width="30%" /> 
  <img src="./docs/mobile-filters.png" width="30%" />
</p>
*Mobile-optimized interface with collapsible components*

### Budgets
![Budgets](./docs/budgets.png)
*Category-based budget tracking with visual progress indicators*

## 🛠️ Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hariharen9/spendwise.git
cd spendwise
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Google Sign-In)
   - Create Firestore Database
   - Add your Firebase configuration to `src/firebaseConfig.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Budgets/          # Budget management components
│   ├── Common/           # Shared UI components
│   ├── CreditCards/      # Credit card tracking
│   ├── Dashboard/        # Dashboard widgets and pages
│   ├── Layout/           # Header, sidebar, and layout components
│   ├── Login/            # Authentication components
│   ├── Modals/           # Reusable modal dialogs
│   ├── Settings/         # User settings and preferences
│   └── Transactions/     # Transaction management
├── data/                 # Mock data and constants
├── hooks/                # Custom React hooks
├── types/                # TypeScript interfaces and types
├── App.tsx              # Main application component
├── index.css            # Global styles
└── main.tsx             # Application entry point
```

## 🔧 Key Components

### Dashboard Widgets
- **Account Balances**: Overview of all your accounts
- **Spending Chart**: Visualize your spending patterns
- **Income vs Expense**: Compare earnings and expenditures
- **Budget Summary**: Track your budget progress
- **Top Spending Categories**: See where you spend most
- **Days of Buffer**: Financial cushion metric
- **Future Balance Projection**: Predict future account balances
- **Cash Flow Forecast**: Projected income and expenses
- **Lifestyle Creep Indicator**: Track spending growth over time
- **Insights Engine**: Personalized financial recommendations
- **Subscription Tracker**: Identify recurring subscriptions
- **Achievements**: Gamified financial milestones

### Transactions
- **Advanced Filtering**: Search, category, type, and date filters
- **Mobile-Optimized**: Collapsible filters and card-based layout
- **Export to CSV**: Download transaction data
- **Import from CSV**: Bulk import transactions

### Budgets
- **Category-Based Budgets**: Set limits for spending categories
- **Progress Tracking**: Visual indicators for budget status
- **Spending Alerts**: Notifications when approaching limits

## 🎨 UI/UX Features

### Responsive Design
- Fully responsive layout that works on mobile, tablet, and desktop
- Mobile-specific optimizations:
  - Collapsible filter bar
  - Card-based transaction list with expandable details
  - Bottom navigation for easy access
  - Touch-friendly controls

### Dark Mode
- Automatic dark/light mode based on system preference
- Manual toggle in settings
- Consistent design across both themes

### Animations
- Smooth page transitions with Framer Motion
- Animated toast notifications
- Interactive hover effects
- Loading states and progress indicators

## 🔐 Authentication

SpendWiser uses Firebase Authentication for secure user login:
- Google Sign-In integration
- Secure session management
- Protected routes and data access

## 📤 Data Management

### CSV Import/Export
- **Export**: Download transactions as CSV files
- **Import**: Upload bank statements in CSV format
- **Validation**: Automatic data validation and error reporting
- **Mapping**: Smart column mapping for various CSV formats

### Data Sync
- Real-time synchronization with Firebase Firestore
- Offline support with automatic sync when reconnected
- Data persistence across sessions and devices

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Hariharen**

- Website: [hariharen9.site](https://hariharen9.site)
- GitHub: [@hariharen9](https://github.com/hariharen9)

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Firebase](https://firebase.google.com/) - Backend-as-a-Service platform
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - Charting library built with React
- [Framer Motion](https://www.framer.com/motion/) - Production-ready motion library
- [Lucide React](https://lucide.dev/) - Beautiful & consistent icon toolkit

---

<p align="center">
  Built with ❤️ by <a href="https://hariharen9.site">Hariharen</a>
</p>