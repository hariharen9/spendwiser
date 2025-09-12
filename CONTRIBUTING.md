# Contributing to SpendWiser 💸

Thank you for your interest in contributing to SpendWiser! We're excited to have you join our mission to help people achieve financial clarity.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**
- **Firebase** account (for backend services)

### First-time Contributors

1. **Fork the repository** on GitHub.
2. **Star the repository** ⭐ (it helps us grow!).
3. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/spendwise.git
   cd spendwise/new-spendwise
   ```

## 🛠️ Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `new-spendwise` root directory by copying the example file:
```bash
cp .env.example .env
```
Then, fill in the `.env` file with your own Firebase project credentials.

### 3. Start Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### 4. Additional Commands
```bash
# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Budgets/          # Budget management
│   ├── Common/           # Shared UI components
│   ├── CreditCards/      # Credit card tracking
│   ├── Dashboard/        # Dashboard widgets
│   ├── Layout/           # Header, sidebar, etc.
│   ├── Login/            # Authentication
│   ├── Modals/           # Modal dialogs
│   ├── Settings/         # User settings
│   └── Transactions/     # Transaction management
├── data/                 # Mock data and constants
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
├── App.tsx               # Main application component
└── main.tsx              # Application entry point
```

## 📝 Coding Standards

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Backend**: Firebase (Firestore, Auth)
- **Charts**: Recharts
- **Icons**: Lucide React

### Code Style Guidelines
- Use **strict TypeScript** with proper type annotations.
- Use **functional components** with hooks.
- Keep components focused on a single responsibility.
- Use the provided ESLint configuration to maintain code style.

## 🔄 Making Changes

### Branch Naming
- **Features**: `feature/description-of-feature`
- **Bug fixes**: `fix/description-of-bug`
- **Documentation**: `docs/description-of-changes`
- **Refactoring**: `refactor/description-of-changes`

### Commit Message Format
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

feat(dashboard): add new analytics widget
fix(auth): resolve google sign-in issue 
docs(readme): update setup instructions
```

## 📤 Submitting Changes

### Pull Request Process

1. **Ensure your PR**:
   - Has a clear, descriptive title.
   - Includes a detailed description of changes.
   - References relevant issues (`Fixes #123`).
   - Follows the project's coding standards.

2. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes made.

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement

   ## Related Issues
   Fixes #(issue number)
   ```

3. **Review Process**:
   - A maintainer will review your PR.
   - Address any feedback promptly.

## 🐛 Reporting Issues

### Before Reporting
1. **Search existing issues** to avoid duplicates.
2. **Update to the latest `main` branch** to see if the issue persists.

### Issue Template
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Step one
2. Step two

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome, Firefox]

**Screenshots**
Add screenshots if applicable.
```

---

**Happy Contributing!** 🎉
