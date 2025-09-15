"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
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
} from "lucide-react"

// A self-contained, from-scratch reimplementation of a landing page.
// All components, animations, and logic are in this single file as requested.

// --- Reimplemented UI Components ---

const CustomButton = ({
  children,
  className = "",
  variant = "primary",
  ...props
}: {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "secondary"
  [key: string]: any
}) => {
  const baseClasses =
    "px-6 py-3 font-semibold rounded-lg transition-all duration-300 transform focus:outline-none focus:ring-4"
  const variantClasses = {
    primary:
      "bg-[#007BFF] text-white hover:bg-[#0056b3] focus:ring-blue-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5",
    secondary:
      "bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm focus:ring-white/30",
  }
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

const FeatureCard = ({
  icon,
  title,
  children,
  index = 0,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  index?: number
}) => {
  const Icon = icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, amount: 0.5 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl"
    >
      <div className="w-14 h-14 bg-[#007BFF] rounded-xl flex items-center justify-center mb-6">
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-white/70 leading-relaxed">{children}</p>
    </motion.div>
  )
}

const TestimonialCard = ({
  name,
  role,
  content,
  index = 0,
}: {
  name: string
  role: string
  content: string
  index?: number
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true, amount: 0.5 }}
    className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl h-full flex flex-col"
  >
    <div className="flex gap-x-1 text-yellow-400 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-5 w-5 fill-current" />
      ))}
    </div>
    <blockquote className="text-white/90 mb-6 flex-grow">
      <p className="leading-relaxed">"{content}"</p>
    </blockquote>
    <div className="flex items-center gap-x-4">
      <div className="h-12 w-12 rounded-full bg-[#007BFF] flex items-center justify-center font-bold text-white">
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </div>
      <div>
        <div className="font-semibold text-white">{name}</div>
        <div className="text-white/50 text-sm">{role}</div>
      </div>
    </div>
  </motion.div>
)

// --- Main Landing Page Component ---

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(false)

  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  })

  // Parallax effect for the hero background
  const scale = useTransform(scrollYProgress, [0, 1], [1, 2.5])
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [1, 0.5, 0.1, 0])

  useEffect(() => {
    const handleScroll = () => {
      if (!targetRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = targetRef.current
      const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100
      setShowScrollTop(scrollPercent > 20)
      setIsHeaderVisible(scrollTop > 10)
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
    { name: "Testimonials", id: "testimonials" },
    { name: "About", id: "about" },
  ]

  return (
    <div
      ref={targetRef}
      className="h-full w-full overflow-y-auto overflow-x-hidden bg-[#111] text-white scroll-smooth"
    >
      {/* --- Header --- */}
      <motion.header
        initial={{ y: "-100%" }}
        animate={{ y: isHeaderVisible ? 0 : "-100%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`${isHeaderVisible ? 'fixed' : 'absolute'} top-0 left-0 right-0 z-50 bg-[#111]/50 backdrop-blur-lg border-b border-white/10`}
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
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-white/70 hover:text-white transition-colors"
              >
                {link.name}
              </button>
            ))}
          </nav>
          <div className="flex items-center space-x-2">
            <CustomButton variant="primary" className="hidden sm:flex">
              Get Started
            </CustomButton>
            <button
              className="p-2 rounded-full hover:bg-white/10 transition-colors md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-[#111] py-4">
            <nav className="flex flex-col items-center space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {link.name}
                </button>
              ))}
              <CustomButton variant="primary">Get Started</CustomButton>
            </nav>
          </div>
        )}
      </motion.header>

      <main className="relative z-10">
        {/* --- Hero Section --- */}
        <section
          id="hero"
          className="min-h-screen flex items-center justify-center text-center relative overflow-hidden pt-20"
        >
          <motion.div
            style={{ scale, opacity }}
            className="absolute inset-0 z-0"
          >
            <img
              src="https://placehold.co/1920x1080/111111/007BFF?text=."
              alt="Hero Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 p-6"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-[#007BFF] mr-2" />
              <span className="text-sm font-medium text-white/80">
                Your All-in-One Financial Command Center
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              From Financial Chaos to <br />
              <span className="text-[#007BFF]">Crystal Clarity</span>
            </h1>
            <p className="text-xl text-white/70 mb-10 max-w-3xl mx-auto">
              Powerful tools for loan simulation, automated budgeting, and
              intelligent expense tracking. Conquer your financial goals.
            </p>
            <CustomButton className="px-8 py-4 text-lg group">
              Start Free Today
              <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
            </CustomButton>
          </motion.div>
        </section>

        {/* --- Dashboard Preview --- */}
        <section className="container mx-auto px-6 -mt-32 md:-mt-48 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
            className="relative"
          >
            <div className="absolute -inset-2 md:-inset-4 bg-blue-500/30 rounded-3xl blur-2xl"></div>
            <img
              src="https://placehold.co/1200x800/1f2937/ffffff?text=SpendWiser+Dashboard"
              alt="SpendWiser Dashboard"
              className="relative w-full rounded-2xl shadow-2xl border-2 border-white/10"
            />
          </motion.div>
        </section>

        {/* --- Features Section --- */}
        <section id="features" className="py-24 sm:py-32">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                A Smarter Way to Manage Money
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                SpendWiser is packed with powerful, intuitive tools designed to
                give you complete financial control.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard icon={TrendingUp} title="Debt-Free Faster">
                Our interactive Loan Simulator is a strategic tool to conquer
                debt. Model prepayments and see how much interest you'll save.
              </FeatureCard>
              <FeatureCard icon={Zap} title="Finance on Autopilot">
                Set up recurring bills and subscriptions once. Our smart
                categorization learns your habits to sort transactions for you.
              </FeatureCard>
              <FeatureCard icon={Shield} title="Intelligent Budgeting">
                Create category-based or monthly budgets with visual progress
                bars that help you stay on track and get alerts before you
                overspend.
              </FeatureCard>
              <FeatureCard icon={Smartphone} title="Truly Yours">
                Make it yours with automatic dark/light themes, multiple font
                choices, and full currency support.
              </FeatureCard>
              <FeatureCard icon={Globe} title="Cross-Platform Access">
                Access your financial data securely from any device, anywhere,
                ensuring your money is always at your fingertips.
              </FeatureCard>
              <FeatureCard icon={Sparkles} title="Modern UI">
                 Our fluid, animated interface makes managing money a pleasure,
                not a chore.
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* --- Testimonials Section --- */}
        <section id="testimonials" className="py-24 sm:py-32 bg-white/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Loved by thousands of users
              </h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <TestimonialCard
                name="Sarah Chen"
                role="Small Business Owner"
                content="SpendWiser transformed how I manage both personal and business finances. The analytics are incredible!"
              />
              <TestimonialCard
                name="Michael Rodriguez"
                role="Software Engineer"
                content="Finally, a financial app that actually makes sense. The budgeting features helped me save $3,000 this year."
                index={1}
              />
              <TestimonialCard
                name="Emily Johnson"
                role="Marketing Manager"
                content="The mobile experience is flawless. I can track expenses on the go and the insights keep me motivated."
                index={2}
              />
            </div>
          </div>
        </section>

        {/* --- Final CTA Section --- */}
        <section id="about" className="py-32 text-center">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Finances?
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-3xl mx-auto">
              Join thousands of users who have already taken control of their
              financial future with SpendWiser.
            </p>
            <CustomButton className="px-10 py-5 text-xl group">
              Start Your Free Account
              <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
            </CustomButton>
            <p className="text-sm text-white/50 mt-6">
              No credit card required • Free forever
            </p>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-black/30 border-t border-white/10 py-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-white/50">
            Built with ❤️ by{" "}
            <a
              href="https://hariharen9.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#007BFF] hover:underline"
            >
              Hariharen
            </a>
          </p>
          <p className="text-xs text-white/30 mt-2">
            &copy; 2025 SpendWiser. All rights reserved.
          </p>
        </div>
      </footer>

      {/* --- Scroll to Top Button --- */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-[#007BFF] hover:bg-[#0056b3] text-white shadow-lg flex items-center justify-center"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  )
}
