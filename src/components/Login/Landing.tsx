'use client'

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { buttonHoverVariants } from "../Common/AnimationVariants"
import {
  ArrowUp,
  TrendingUp,
  Shield,
  Smartphone,
  Zap,
  Globe,
  Star,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  Check,
  Github,
  Twitter,
  Linkedin,
  Rocket,
  Wallet,
  Hourglass,
  Crown,
} from "lucide-react"
import Footer from "../Footer/Footer";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// --- Self-Contained UI Components (Reimplemented and Theme-Aware) ---

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg dark:backdrop-blur-xl ${className}`}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={`text-2xl font-semibold leading-none tracking-tight text-slate-900 dark:text-white ${className}`} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={`text-sm text-slate-600 dark:text-white/60 ${className}`} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
))
CardContent.displayName = "CardContent"

const CtaButton = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <motion.button
    className={`group relative flex items-center justify-center gap-3 px-6 py-4 text-sm font-semibold text-gray-700 dark:text-[#F5F5F5] backdrop-blur-sm bg-white/90 dark:bg-[#242424]/90 border border-gray-200/60 dark:border-gray-700/60 rounded-xl hover:bg-white dark:hover:bg-[#242424] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] hover:-translate-y-0.5 ${className}`}
    variants={buttonHoverVariants}
    whileHover="hover"
    whileTap="tap"
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-red-500/10 to-green-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 via-red-400/20 to-green-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
    {children}
  </motion.button>
)

// --- Main Landing Page Component ---

export default function Landing({ onCtaClick }: { onCtaClick: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(false)

  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!targetRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = targetRef.current
      const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100
      setShowScrollTop(scrollPercent > 10)
      setIsHeaderVisible(scrollTop > 50)
    }

    const currentRef = targetRef.current
    currentRef?.addEventListener("scroll", handleScroll)

    return () => {
      currentRef?.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    section?.scrollIntoView({ behavior: "smooth", block: "start" })
    setIsMenuOpen(false)
  }

  const scrollToTop = () => {
    targetRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }

  const navLinks = [
    { name: "Features", id: "features" },
    { name: "Pricing", id: "pricing" },
    { name: "About", id: "about" },
  ]

  return (
    <div ref={targetRef} className="h-full w-full overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-[#1A1A1A] text-slate-800 dark:text-white scroll-smooth">
      {/* --- Header --- */}
      <motion.header
        initial={{ y: "-100%" }}
        animate={{ y: isHeaderVisible ? 0 : "-100%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`fixed top-0 left-0 right-0 z-50 bg-slate-50/50 dark:bg-[#1A1A1A]/50 backdrop-blur-lg border-b border-slate-200/50 dark:border-white/10`}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/icon-money.svg" alt="SpendWiser Logo" className="w-8 h-8" />
            <span className="text-xl font-bold">SpendWiser</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button key={link.id} onClick={() => scrollToSection(link.id)} className="text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors">
                {link.name}
              </button>
            ))}
          </nav>
          <div className="flex items-center space-x-2">
            <CtaButton onClick={onCtaClick} className="hidden sm:flex"><Rocket className="mr-2 h-4 w-4" />Embark on Your Journey</CtaButton>
            <button className="p-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-slate-50 dark:bg-[#1A1A1A] py-4">
            <nav className="flex flex-col items-center space-y-4">
              {navLinks.map((link) => (
                <button key={link.id} onClick={() => scrollToSection(link.id)} className="text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {link.name}
                </button>
              ))}
              <CtaButton onClick={onCtaClick}><Rocket className="mr-2 h-4 w-4" />Embark on Your Journey</CtaButton>
            </nav>
          </div>
        )}
      </motion.header>

      <main className="relative z-10">
        {/* --- Hero Section --- */}
        <section id="hero" className="min-h-screen flex items-center justify-center text-center relative overflow-hidden pt-20 pb-36">
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-50 dark:from-[#1A1A1A] via-slate-50/80 dark:via-[#1A1A1A]/80 to-transparent"></div>
          <motion.div
            className="container mx-auto px-6 relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-500 dark:text-blue-400">The Ultimate Financial Command Center.</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              From Financial Chaos to <br />
              <span className="text-[#007BFF]">Crystal Clarity</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-slate-600 dark:text-white/70 mb-10 max-w-3xl mx-auto">
              Stop guessing, start knowing. SpendWiser gives you the power to see your entire financial picture in one place, with intelligent tools for budgeting, debt management, and goal achievement. It's time to take control.
            </motion.p>
            <motion.div variants={itemVariants}>
              <CtaButton onClick={onCtaClick} className="px-10 py-5 text-xl group w-fit mx-auto">
              <Zap className="mr-2 h-6 w-6" />Unlock Your Financial Superpowers
              <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
            </CtaButton>
            </motion.div>
            <motion.div variants={itemVariants} className="relative max-w-6xl mx-auto mt-16">
                <div className="absolute -inset-8 bg-blue-500/25 rounded-3xl blur-3xl"></div>
                <img src="https://placehold.co/1200x800/e2e8f0/1e293b?text=SpendWiser+Dashboard" alt="SpendWiser Dashboard Preview" className="relative w-full h-auto rounded-2xl shadow-lg border-2 border-slate-200 dark:border-white/10" />
            </motion.div>
          </motion.div>
        </section>

        {/* --- Features Section --- */}
        <section id="features" className="py-24 sm:py-32">
          <motion.div
            className="container mx-auto px-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={itemVariants} className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">All Your Finances, Intelligently Managed.</h2>
              <p className="text-xl text-slate-600 dark:text-white/70 max-w-3xl mx-auto">SpendWiser is more than just an expense tracker. It's a powerful suite of integrated tools designed to bring you financial peace of mind.</p>
            </motion.div>
            
            <motion.div
              id="loan"
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32"
              variants={containerVariants}
            >
                <motion.div variants={itemVariants} className="lg:order-last">
                    <h3 className="text-3xl font-bold mb-4">Outsmart Your Debt.</h3>
                    <p className="text-lg text-slate-600 dark:text-white/70 mb-6 leading-relaxed">Don't just pay your loans; conquer them. Our interactive Loan Simulator is your strategic partner in becoming debt-free. Model different repayment strategies, see the impact of extra payments in real-time, and discover the fastest path to financial freedom. Know exactly how much interest you'll save and when you'll make your last payment.</p>
                    <ul className="space-y-4 text-lg"><li className="flex items-start gap-3"><Check className="h-6 w-6 text-[#007BFF] mt-1 flex-shrink-0" /><span>Visualize your complete loan amortization schedule.</span></li><li className="flex items-start gap-3"><Check className="h-6 w-6 text-[#007BFF] mt-1 flex-shrink-0" /><span>Strategize with prepayments and extra EMIs to save thousands.</span></li></ul>
                </motion.div>
                <motion.div variants={itemVariants} className="relative group"><div className="absolute -inset-4 bg-blue-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div><img src="https://placehold.co/800x600/e2e8f0/1e293b?text=Loan+Simulator" alt="Loan Simulator" className="relative w-full h-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10" />
                </motion.div>
            </motion.div>

            <motion.div
              id="automation"
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32"
              variants={containerVariants}
            >
                <motion.div variants={itemVariants}>
                    <h3 className="text-3xl font-bold mb-4">Automate Your Financial Life.</h3>
                    <p className="text-lg text-slate-600 dark:text-white/70 mb-6 leading-relaxed">Reclaim your time and eliminate manual entry. SpendWiser's intelligent automation effortlessly tracks your recurring bills, subscriptions, and income. Set it up once and let the app do the heavy lifting, so you can focus on living your life.</p>
                    <ul className="space-y-4 text-lg"><li className="flex items-start gap-3"><Check className="h-6 w-6 text-[#007BFF] mt-1 flex-shrink-0" /><span>Never miss a payment with automated bill and subscription tracking.</span></li><li className="flex items-start gap-3"><Check className="h-6 w-6 text-[#007BFF] mt-1 flex-shrink-0" /><span>Effortlessly monitor your cash flow with recurring income.</span></li></ul>
                </motion.div>
                <motion.div variants={itemVariants} className="relative group"><div className="absolute -inset-4 bg-purple-500/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div><img src="https://placehold.co/800x600/e2e8f0/1e293b?text=Automation" alt="Automated Transactions" className="relative w-full h-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10" />
                </motion.div>
            </motion.div>

            <motion.div
              id="goals"
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
              variants={containerVariants}
            >
                <motion.div variants={itemVariants} className="lg:order-last">
                    <h3 className="text-3xl font-bold mb-4">Budget with Purpose, Achieve Your Dreams.</h3>
                    <p className="text-lg text-slate-600 dark:text-white/70 mb-6 leading-relaxed">Budgeting isn't about restriction; it's about empowerment. Create flexible, category-based budgets that align with your life. With visual progress bars and intelligent alerts, you'll always know where you stand. Turn your financial dreams—from a dream vacation to a down payment—into actionable goals and watch your savings grow.</p>
                    <ul className="space-y-4 text-lg"><li className="flex items-start gap-3"><Check className="h-6 w-6 text-[#007BFF] mt-1 flex-shrink-0" /><span>Get smart alerts before you overspend.</span></li><li className="flex items-start gap-3"><Check className="h-6 w-6 text-[#007BFF] mt-1 flex-shrink-0" /><span>Fund your goals directly and track your progress.</span></li></ul>
                </motion.div>
                <motion.div variants={itemVariants} className="relative group"><div className="absolute -inset-4 bg-green-500/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div><img src="https://placehold.co/800x600/e2e8f0/1e293b?text=Goals+%26+Budgets" alt="Goals and Budgets" className="relative w-full h-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10" />
                </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* --- Pricing Section --- */}
        <section id="pricing" className="py-24 sm:py-32 bg-slate-100 dark:bg-black/20">
          <motion.div
            className="container mx-auto px-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">Get Started for Free. Upgrade for More Power.</h2>
              <p className="text-xl text-slate-600 dark:text-white/70 max-w-3xl mx-auto">All the core features you need to take control of your finances are free, forever. When you're ready to unlock advanced insights, upgrade to Pro.</p>
            </motion.div>
            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <Card className="relative h-full ring-2 ring-[#007BFF] scale-105">
                  <CardHeader><CardTitle>Free</CardTitle><div className="mt-4 flex items-baseline"><span className="text-5xl font-bold">$0</span><span className="text-lg text-slate-600 dark:text-white/70 ml-2">/month</span></div><CardDescription className="mt-4">The perfect starting point for anyone serious about their financial health.</CardDescription></CardHeader>
                  <CardContent>
                    <CtaButton onClick={onCtaClick} className="w-full mb-8 bg-transparent border border-[#007BFF] text-[#007BFF] hover:bg-blue-500/10"><Wallet className="mr-2 h-4 w-4" />Claim Your Financial Freedom</CtaButton>
                    <ul className="space-y-4">{[ "Unlimited Transaction Tracking", "Intuitive Budgeting & Expense Management", "Multi-Account Support (Checking, Savings, Credit Cards)", "Basic Loan & Goal Tracking", "Automated Recurring Transactions", "CSV Data Export" ].map(f => <li key={f} className="flex items-start gap-3"><Check className="h-5 w-5 text-[#007BFF] mt-0.5 flex-shrink-0" /><span className="text-slate-700 dark:text-white/80">{f}</span></li>)}</ul>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="relative h-full ring-1 ring-slate-200 dark:ring-white/10 hover:ring-slate-300 dark:hover:ring-white/20 transition-all duration-300">
                  <CardHeader><CardTitle>Pro</CardTitle><div className="mt-4 flex items-baseline"><span className="text-5xl font-bold">TBA</span></div><CardDescription className="mt-4">For the power user who wants to master every aspect of their financial life.</CardDescription></CardHeader>
                  <CardContent>
                    <CtaButton className="w-full mb-8 opacity-50 cursor-not-allowed"><Hourglass className="mr-2 h-4 w-4" />Coming Soon</CtaButton>
                    <ul className="space-y-4">{[ "Everything in Free", "Advanced Financial Analytics & Personalized Insights", "Comprehensive Goal Forecasting & Progress Tracking", "Secure Data Backup & Restore (JSON)", "Professional PDF Statement Export", "Priority Customer Support" ].map(f => <li key={f} className="flex items-start gap-3"><Check className="h-5 w-5 text-[#007BFF] mt-0.5 flex-shrink-0" /><span className="text-slate-700 dark:text-white/80">{f}</span></li>)}</ul>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* --- Testimonials Section --- */}
        {/* <section id="testimonials" className="py-24 sm:py-32">
          <motion.div
            className="container mx-auto px-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-lg font-semibold tracking-tight text-[#007BFF]">Testimonials</h2>
              <p className="text-4xl sm:text-5xl font-bold">Loved by thousands of users</p>
            </motion.div>
            <motion.div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto" variants={containerVariants}>
              <motion.div variants={itemVariants}><Card><CardContent className="p-6"><div className="flex gap-x-1 text-yellow-400 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}</div><blockquote className="text-slate-700 dark:text-white/90 mb-6"><p>"SpendWiser transformed how I manage both personal and business finances. The analytics are incredible!"</p></blockquote><div className="flex items-center gap-x-4"><div className="h-12 w-12 rounded-full bg-[#007BFF] flex items-center justify-center font-bold text-white">SC</div><div><div className="font-semibold">Sarah Chen</div><div className="text-sm text-slate-500 dark:text-white/50">Small Business Owner</div></div></div></CardContent></Card></motion.div>
              <motion.div variants={itemVariants}><Card><CardContent className="p-6"><div className="flex gap-x-1 text-yellow-400 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}</div><blockquote className="text-slate-700 dark:text-white/90 mb-6"><p>"Finally, a financial app that actually makes sense. The budgeting features helped me save $3,000 this year."</p></blockquote><div className="flex items-center gap-x-4"><div className="h-12 w-12 rounded-full bg-[#007BFF] flex items-center justify-center font-bold text-white">MR</div><div><div className="font-semibold">Michael Rodriguez</div><div className="text-sm text-slate-500 dark:text-white/50">Software Engineer</div></div></div></CardContent></Card></motion.div>
              <motion.div variants={itemVariants}><Card><CardContent className="p-6"><div className="flex gap-x-1 text-yellow-400 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}</div><blockquote className="text-slate-700 dark:text-white/90 mb-6"><p>"The mobile experience is flawless. I can track expenses on the go and the insights keep me motivated."</p></blockquote><div className="flex items-center gap-x-4"><div className="h-12 w-12 rounded-full bg-[#007BFF] flex items-center justify-center font-bold text-white">EJ</div><div><div className="font-semibold">Emily Johnson</div><div className="text-sm text-slate-500 dark:text-white/50">Marketing Manager</div></div></div></CardContent></Card></motion.div>
            </motion.div>
          </motion.div>
        </section> */}

        {/* --- About Section --- */}
        <section id="about" className="py-24 sm:py-32">
          <motion.div
            className="container mx-auto px-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">The SpendWiser Advantage.</h2>
              <p className="text-xl text-slate-600 dark:text-white/70 max-w-3xl mx-auto">SpendWiser was built from the ground up to be the most comprehensive, intuitive, and secure financial management tool on the market.</p>
            </motion.div>
            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" variants={containerVariants}>
              <motion.div className="space-y-8" variants={containerVariants}>
                {[ { icon: Zap, title: "Real-time Insights", description: "Your financial data is always up-to-date, giving you a real-time view of your spending, budgets, and net worth."}, { icon: Globe, title: "Cross-Platform Access", description: "Access your complete financial picture from any device, anywhere in the world. Your data is always in sync."}, { icon: Shield, title: "Your Data, Your Control", description: "We believe your data is yours. Period. It's protected with bank-level security, and you have full control to export or delete it at any time."} ].map(item =>
                  <motion.div key={item.title} className="flex items-start gap-4" variants={itemVariants}>
                    <div className="w-12 h-12 rounded-xl bg-[#007BFF] flex items-center justify-center"><item.icon className="w-6 h-6 text-white" /></div>
                    <div><h3 className="text-xl font-bold mb-2">{item.title}</h3><p className="text-slate-600 dark:text-white/70 leading-relaxed">{item.description}</p></div>
                  </motion.div>)}
              </motion.div>
              <motion.div variants={itemVariants}><Card className="bg-blue-500/5 border-blue-500/20 p-8"><div className="text-center"><div className="w-16 h-16 bg-[#007BFF] rounded-2xl flex items-center justify-center mx-auto mb-6"><TrendingUp className="w-8 h-8 text-white" /></div><h3 className="text-2xl font-bold mb-4">Join a Thriving Community</h3><p className="text-slate-600 dark:text-white/70 mb-6 leading-relaxed">You're not alone. Join thousands of users who are using SpendWiser to build a better financial future.</p><div className="grid grid-cols-3 gap-4 text-center"><div><div className="text-2xl font-bold text-[#007BFF]">1K+</div><div className="text-sm text-slate-600 dark:text-white/70">Active Users</div></div><div><div className="text-2xl font-bold text-[#007BFF]">$100k+</div><div className="text-sm text-slate-600 dark:text-white/70">Money Tracked</div></div><div><div className="text-2xl font-bold text-[#007BFF]">4.9★</div><div className="text-sm text-slate-600 dark:text-white/70">User Rating</div></div></div></div></Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* --- Contact/CTA Section --- */}
        <section id="contact" className="py-24 sm:py-32 bg-blue-500/5 dark:bg-blue-900/20">
          <motion.div
            className="container mx-auto px-6 text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold mb-6">Ready to Achieve Financial Clarity?</motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-slate-600 dark:text-white/70 mb-8 max-w-3xl mx-auto">It takes just a few clicks to start your journey. Sign up for free and see what you've been missing.</motion.p>
            <motion.div variants={itemVariants}><CtaButton onClick={onCtaClick} className="px-10 py-5 text-xl group w-fit mx-auto"><Crown className="mr-2 h-6 w-6" />Seize Your Financial Destiny <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" /></CtaButton></motion.div>
            <motion.p variants={itemVariants} className="text-sm text-slate-500 dark:text-white/50 mt-6">No credit card required • 😉  </motion.p>
          </motion.div>
        </section>

        {/* --- Footer --- */}
        <Footer />
      </main>

      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-[#007BFF] hover:bg-[#0056b3] text-white shadow-lg flex items-center justify-center">
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  )
}
  
