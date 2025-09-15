'use client'

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
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

const CustomButton = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    className={`px-8 py-3 font-semibold rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-4 bg-[#007BFF] text-white hover:bg-[#0056b3] focus:ring-blue-300 shadow-lg hover:shadow-xl ${className}`}
    {...props}
  >
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
            <div className="w-8 h-8 bg-[#007BFF] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SW</span>
            </div>
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
            <CustomButton onClick={onCtaClick} className="hidden sm:flex">Get Started</CustomButton>
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
              <CustomButton onClick={onCtaClick}>Get Started</CustomButton>
            </nav>
          </div>
        )}
      </motion.header>

      <main className="relative z-10">
        {/* --- Hero Section --- */}
        <section id="hero" className="min-h-screen flex items-center justify-center text-center relative overflow-hidden pt-20 pb-24">
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-50 dark:from-[#1A1A1A] via-slate-50/80 dark:via-[#1A1A1A]/80 to-transparent"></div>
          <motion.div
            className="container mx-auto px-6 relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-500 dark:text-blue-400">Your All-in-One Financial Command Center</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              From Financial Chaos to <br />
              <span className="text-[#007BFF]">Crystal Clarity</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-slate-600 dark:text-white/70 mb-10 max-w-3xl mx-auto">
              From powerful loan simulators and automated budgeting to intelligent expense tracking, get the clarity you need to conquer your financial goals.
            </motion.p>
            <motion.div variants={itemVariants}>
              <CustomButton onClick={onCtaClick} className="px-10 py-5 text-xl group">
                Start Free Today
                <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
              </CustomButton>
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
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">A Smarter Way to Manage Your Money</h2>
              <p className="text-xl text-slate-600 dark:text-white/70 max-w-3xl mx-auto">SpendWiser is packed with powerful, intuitive tools designed to give you complete financial control.</p>
            </motion.div>
            
            <motion.div
              id="loan"
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32"
              variants={containerVariants}
            >
                <motion.div variants={itemVariants} className="lg:order-last">
                    <h3 className="text-3xl font-bold mb-4">Eliminate Debt, Faster Than Ever</h3>
                    <p className="text-lg text-slate-600 dark:text-white/70 mb-6 leading-relaxed">Don't just pay your loans; outsmart them. Our Loan Simulator is a powerful strategic tool that lets you visualize the impact of different payment strategies. See exactly how much you can save in interest and how quickly you can become debt-free.</p>
                    <ul className="space-y-4 text-lg"><li className="flex items-start gap-3"><Check className="h-6 w-6 text-[#007BFF] mt-1 flex-shrink-0" /><span>Map out your entire loan journey with detailed amortization schedules.</span></li><li className="flex items-start gap-3"><Check className="h-6 w-6 text-[#007BFF] mt-1 flex-shrink-0" /><span>Find the most efficient strategies to clear your debt and save money.</span></li></ul>
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
                    <h3 className="text-3xl font-bold mb-4">Put Your Finances on Autopilot</h3>
                    <p className="text-lg text-slate-600 dark:text-white/70 mb-6 leading-relaxed">Stop wasting time with manual entries. SpendWiser's intelligent automation handles the tedious work for you. Set up recurring bills and subscriptions once, and let our system track them automatically.</p>
                    <ul className="space-y-4 text-lg"><li className="flex items-start gap-3"><Check className="h-6 w-6 text-[#007BFF] mt-1 flex-shrink-0" /><span>Automate bills, subscriptions, and recurring income.</span></li><li className="flex items-start gap-3"><Check className="h-6 w-6 text-[#007BFF] mt-1 flex-shrink-0" /><span>Spend less time managing money and more time living.</span></li></ul>
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
                    <h3 className="text-3xl font-bold mb-4">Plan Your Future, Achieve Your Dreams</h3>
                    <p className="text-lg text-slate-600 dark:text-white/70 mb-6 leading-relaxed">Budgeting isn't about restriction; it's about empowerment. Create category-based or monthly budgets with visual progress bars that help you stay on track. Turn your financial dreams into actionable plans by setting and tracking savings goals.</p>
                    <ul className="space-y-4 text-lg"><li className="flex items-start gap-3"><Check className="h-6 w-6 text-[#007BFF] mt-1 flex-shrink-0" /><span>Get alerts before you overspend.</span></li><li className="flex items-start gap-3"><Check className="h-6 w-6 text-[#007BFF] mt-1 flex-shrink-0" /><span>Fund your goals and watch your savings grow.</span></li></ul>
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
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-slate-600 dark:text-white/70 max-w-3xl mx-auto">Start free and upgrade when you're ready. All plans include our core features.</p>
            </motion.div>
            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <Card className="relative h-full ring-1 ring-slate-200 dark:ring-white/10 hover:ring-slate-300 dark:hover:ring-white/20 transition-all duration-300">
                  <CardHeader><CardTitle>Free</CardTitle><div className="mt-4 flex items-baseline"><span className="text-5xl font-bold">$0</span><span className="text-lg text-slate-600 dark:text-white/70 ml-2">/month</span></div><CardDescription className="mt-4">Perfect for getting started with financial tracking.</CardDescription></CardHeader>
                  <CardContent>
                    <CustomButton onClick={onCtaClick} className="w-full mb-8 bg-transparent border border-[#007BFF] text-[#007BFF] hover:bg-blue-500/10">Get Started</CustomButton>
                    <ul className="space-y-4">{[ "Unlimited expense tracking", "Basic budgeting tools", "Mobile app access", "Data export (CSV)", "Email support", "All core features included" ].map(f => <li key={f} className="flex items-start gap-3"><Check className="h-5 w-5 text-[#007BFF] mt-0.5 flex-shrink-0" /><span className="text-slate-700 dark:text-white/80">{f}</span></li>)}</ul>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="relative h-full ring-2 ring-[#007BFF] scale-105">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="inline-flex items-center rounded-full bg-[#007BFF] px-4 py-1 text-sm font-medium text-white"><Star className="w-4 h-4 mr-1" />Most Popular</span></div>
                  <CardHeader><CardTitle>Pro</CardTitle><div className="mt-4 flex items-baseline"><span className="text-5xl font-bold">TBA</span></div><CardDescription className="mt-4">Advanced features for serious financial management.</CardDescription></CardHeader>
                  <CardContent>
                    <CustomButton className="w-full mb-8 opacity-50 cursor-not-allowed">Coming Soon</CustomButton>
                    <ul className="space-y-4">{[ "Everything in Free", "Advanced analytics & insights", "Custom categories & tags", "Goal tracking & forecasting", "Priority support", "Data backup & sync" ].map(f => <li key={f} className="flex items-start gap-3"><Check className="h-5 w-5 text-[#007BFF] mt-0.5 flex-shrink-0" /><span className="text-slate-700 dark:text-white/80">{f}</span></li>)}</ul>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* --- Testimonials Section --- */}
        <section id="testimonials" className="py-24 sm:py-32">
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
        </section>

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
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">Why Choose SpendWiser?</h2>
              <p className="text-xl text-slate-600 dark:text-white/70 max-w-3xl mx-auto">Built by financial experts and technology leaders to solve real money management challenges.</p>
            </motion.div>
            <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" variants={containerVariants}>
              <motion.div className="space-y-8" variants={containerVariants}>
                {[ { icon: Zap, title: "Real-time Insights", description: "Get instant updates on your spending and financial health, powered by fast and efficient data processing."}, { icon: Globe, title: "Cross-Platform Access", description: "Access your financial data securely from any device, anywhere, ensuring your money is always at your fingertips."}, { icon: Shield, title: "Your Data, Your Control", description: "We prioritize your privacy. Your data is yours, protected with robust security, and never shared without your consent."} ].map(item =>
                  <motion.div key={item.title} className="flex items-start gap-4" variants={itemVariants}>
                    <div className="w-12 h-12 rounded-xl bg-[#007BFF] flex items-center justify-center"><item.icon className="w-6 h-6 text-white" /></div>
                    <div><h3 className="text-xl font-bold mb-2">{item.title}</h3><p className="text-slate-600 dark:text-white/70 leading-relaxed">{item.description}</p></div>
                  </motion.div>)}
              </motion.div>
              <motion.div variants={itemVariants}><Card className="bg-blue-500/5 border-blue-500/20 p-8"><div className="text-center"><div className="w-16 h-16 bg-[#007BFF] rounded-2xl flex items-center justify-center mx-auto mb-6"><TrendingUp className="w-8 h-8 text-white" /></div><h3 className="text-2xl font-bold mb-4">Join Thousands of Users</h3><p className="text-slate-600 dark:text-white/70 mb-6 leading-relaxed">SpendWiser has helped thousands of people take control of their finances and build better money habits.</p><div className="grid grid-cols-3 gap-4 text-center"><div><div className="text-2xl font-bold text-[#007BFF]">10K+</div><div className="text-sm text-slate-600 dark:text-white/70">Active Users</div></div><div><div className="text-2xl font-bold text-[#007BFF]">$2M+</div><div className="text-sm text-slate-600 dark:text-white/70">Money Tracked</div></div><div><div className="text-2xl font-bold text-[#007BFF]">4.9★</div><div className="text-sm text-slate-600 dark:text-white/70">User Rating</div></div></div></div></Card>
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
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-bold mb-6">Ready to Transform Your Finances?</motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-slate-600 dark:text-white/70 mb-8 max-w-3xl mx-auto">Join thousands of users who have already taken control of their financial future with SpendWiser.</motion.p>
            <motion.div variants={itemVariants}><CustomButton onClick={onCtaClick} className="px-10 py-5 text-xl group">Start Your Free Account <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" /></CustomButton></motion.div>
            <motion.p variants={itemVariants} className="text-sm text-slate-500 dark:text-white/50 mt-6">No credit card required • Free forever • Cancel anytime </motion.p>
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