'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/app'

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setOtpSent(true)
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP')
      }

      // Success - redirect to app
      router.push(redirect)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError(null)
    await handleSendOTP(new Event('submit') as any)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black-pure px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-neon w-full max-w-md rounded-3xl border border-neon-cyan/30 p-8 shadow-neon-cyan"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl neon-gradient-green-blue mb-4 shadow-neon-green">
            <GraduationCap className="h-8 w-8 text-black-pure" />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Welcome to Vibe</h1>
          <p className="text-sm text-white/60">
            {step === 'email' ? 'Sign in with your .edu email' : 'Enter your verification code'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60">
                Student Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@university.edu"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black-deep/50 px-10 py-3 text-white placeholder:text-white/40 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/20"
                />
              </div>
              <p className="mt-2 text-xs text-white/40">
                Only .edu email addresses are accepted
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-xl neon-gradient-green-blue px-6 py-3 font-semibold text-black-pure shadow-neon-green transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  Send Verification Code
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label htmlFor="otp" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/60">
                Verification Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  maxLength={6}
                  className="w-full rounded-xl border border-white/10 bg-black-deep/50 px-10 py-3 text-center text-2xl font-mono tracking-widest text-white placeholder:text-white/20 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/20"
                />
              </div>
              <p className="mt-2 text-xs text-white/40">
                Check your email for the 6-digit code
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-xl neon-gradient-green-blue px-6 py-3 font-semibold text-black-pure shadow-neon-green transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-neon-cyan hover:text-neon-cyan/80 transition disabled:opacity-50"
              >
                Didn't receive code? Resend
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setOtp('')
                  setError(null)
                }}
                className="text-sm text-white/60 hover:text-white transition"
              >
                ← Change email
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-white/40">
          New to Vibe?{' '}
          <Link href="/sign-up" className="text-neon-cyan hover:text-neon-cyan/80 transition">
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

