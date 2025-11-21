'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Sparkles, 
  Shield, 
  Clock, 
  MapPin, 
  Zap,
  ArrowRight,
  CheckCircle2,
  GraduationCap
} from 'lucide-react'
import AnimatedBackground from './AnimatedBackground'

const features = [
  {
    icon: MapPin,
    title: 'Now Rooms',
    description: 'Drop into hyperlocal rooms with realtime presence, proximity filters, and live chats.',
    gradient: 'from-neon-cyan to-neon-blue',
    iconColor: 'text-neon-cyan',
    borderColor: 'border-neon-cyan/30',
  },
  {
    icon: Shield,
    title: 'Dual Identity',
    description: 'Protect your privacy with studio aliases while building your verified professional self.',
    gradient: 'from-neon-pink to-neon-purple',
    iconColor: 'text-neon-pink',
    borderColor: 'border-neon-pink/30',
  },
  {
    icon: Clock,
    title: 'Timecapsules',
    description: 'Capture campus moments that unlock across semesters to keep traditions alive.',
    gradient: 'from-neon-yellow to-neon-green',
    iconColor: 'text-neon-yellow',
    borderColor: 'border-neon-yellow/30',
  },
]

const benefits = [
  'Campus-verified community',
  'Real-time connections',
  'Privacy-first design',
  'Ephemeral content',
]

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black-pure">
      {/* Full-page animated background */}
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Navigation */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="border-b border-white/10 bg-black-deep/50 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl neon-gradient-green-blue shadow-neon-green"
              >
                <GraduationCap className="h-6 w-6 text-black-pure" />
              </motion.div>
              <span className="text-lg font-bold gradient-text">Vibe</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="hidden rounded-xl border border-white/20 bg-black-deep/50 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-neon-cyan/50 hover:text-white sm:inline-flex"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-xl neon-gradient-green-blue px-5 py-2 text-sm font-semibold text-black-pure shadow-neon-green transition hover:opacity-90"
              >
                Get Started
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-12 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-2 backdrop-blur-xl"
            >
              <Sparkles className="h-4 w-4 text-neon-cyan" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neon-cyan">
                Campus Network
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-6 text-5xl font-black leading-tight tracking-tight text-white md:text-6xl lg:text-7xl"
            >
              Hyperlocal connections for{' '}
              <span className="gradient-text">ambitious</span> campus communities
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-10 text-xl leading-relaxed text-white/70 md:text-2xl"
            >
              Discover Now Rooms, unlock timecapsules, and build dual-identity profiles designed for Gen Z.{' '}
              <span className="text-white/90">Swipe, chat, and connect with purpose</span>—all verified by your campus.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/sign-up"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl neon-gradient-green-blue px-8 py-4 text-base font-bold text-black-pure shadow-neon-green transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,106,0.6)]"
              >
                <span>Join your campus waitlist</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/20 bg-black-deep/80 px-8 py-4 text-base font-semibold text-white backdrop-blur-xl transition-all hover:border-neon-cyan/50 hover:bg-black-deep"
              >
                Already verified? Sign in
              </Link>
            </motion.div>

            {/* Benefits List */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-neon-green" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Everything you need to{' '}
              <span className="gradient-text">vibe on campus</span>
            </h2>
            <p className="text-lg text-white/60">
              Three powerful features designed for the next generation of campus networking
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ y: 40, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                  className="group relative overflow-hidden rounded-3xl border bg-black-deep/60 p-8 backdrop-blur-xl transition-all hover:scale-105"
                  style={{
                    borderColor: `rgba(${index === 0 ? '0, 255, 240' : index === 1 ? '255, 46, 196' : '255, 235, 59'}, 0.3)`,
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-10`}
                  />
                  
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border bg-black-deep/80 backdrop-blur-xl transition-all"
                    style={{
                      borderColor: `rgba(${index === 0 ? '0, 255, 240' : index === 1 ? '255, 46, 196' : '255, 235, 59'}, 0.3)`,
                    }}
                  >
                    <Icon className={`h-8 w-8 ${feature.iconColor} transition-transform group-hover:scale-110`} />
                  </motion.div>

                  {/* Content */}
                  <h3 className="mb-3 text-2xl font-bold text-white">{feature.title}</h3>
                  <p className="leading-relaxed text-white/70">{feature.description}</p>

                  {/* Decorative element */}
                  <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${feature.gradient} opacity-5 blur-2xl transition-opacity group-hover:opacity-20`} />
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Stats/Trust Section */}
        <motion.section
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-t border-white/10 bg-black-deep/30 backdrop-blur-xl"
        >
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-12">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { value: '100%', label: 'Campus Verified', gradient: 'gradient-text' },
                { value: '24/7', label: 'Active Rooms', gradient: 'gradient-text-pink' },
                { value: 'Gen Z', label: 'Built For You', gradient: 'gradient-text-yellow' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className={`mb-2 text-4xl font-bold ${stat.gradient}`}>{stat.value}</div>
                  <div className="text-sm uppercase tracking-wider text-white/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl px-6 py-20 md:px-12"
        >
          <div className="relative overflow-hidden rounded-3xl border border-neon-cyan/30 bg-gradient-to-br from-black-deep to-black-pure p-12 text-center backdrop-blur-xl">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-purple/10 to-neon-green/10 opacity-50" />
            
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Zap className="mx-auto mb-6 h-12 w-12 text-neon-yellow" />
              </motion.div>
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                Ready to transform your campus experience?
              </h2>
              <p className="mb-8 text-lg text-white/70">
                Join thousands of students already connecting on Vibe
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-2xl neon-gradient-pink-purple px-8 py-4 text-base font-bold text-black-pure shadow-neon-pink transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,46,196,0.6)]"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black-deep/50 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-12">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl neon-gradient-green-blue">
                  <GraduationCap className="h-5 w-5 text-black-pure" />
                </div>
                <span className="text-sm font-semibold gradient-text">Vibe Campus Network</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-white/60">
                <Link href="/sign-in" className="transition hover:text-neon-cyan">
                  Sign In
                </Link>
                <Link href="/sign-up" className="transition hover:text-neon-cyan">
                  Sign Up
                </Link>
              </div>
            </div>
            <div className="mt-6 text-center text-xs text-white/40">
              © {new Date().getFullYear()} Vibe. Built for ambitious campus communities.
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}

