'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Mail, Lock, Sparkles, Users, MapPin, Calendar, Briefcase, User, Image } from 'lucide-react'

interface OnboardingProps {
  onComplete: () => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [alias, setAlias] = useState('')
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState('')
  const [skills, setSkills] = useState('')
  const [intent, setIntent] = useState('')

  const steps = [
    {
      title: 'Welcome to Vibe',
      subtitle: 'Verified · Hyperlocal · Privacy-First · Mood-Aware',
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto mb-4 neon-gradient-green-blue rounded-2xl flex items-center justify-center shadow-neon-green">
            <Sparkles className="w-10 h-10 text-black-pure" />
          </div>
          <h2 className="text-3xl font-bold gradient-text">Build Your Campus Network</h2>
          <p className="text-white/70 text-lg">
            Connect with peers, discover events, and join hyperlocal rooms in your verified campus community
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { icon: Users, label: 'Network', color: 'neon-green' },
              { icon: MapPin, label: 'Locations', color: 'neon-blue' },
              { icon: Calendar, label: 'Events', color: 'neon-pink' }
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-neon p-6 rounded-xl text-center border border-neon-cyan/30"
                >
                  <div className={`w-12 h-12 mx-auto mb-2 bg-${item.color}/20 rounded-lg flex items-center justify-center border border-${item.color}/30`}>
                    <Icon className={`w-6 h-6 text-${item.color}`} />
                  </div>
                  <p className="text-xs text-white/70 font-medium">{item.label}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      ),
    },
    {
      title: 'Verify Your Campus',
      subtitle: 'Join your community safely',
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass-neon p-6 rounded-xl border border-neon-green/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-neon-green/20 rounded-lg flex items-center justify-center border border-neon-green/30">
                <Mail className="w-6 h-6 text-neon-green" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Campus Email Verification</h3>
                <p className="text-sm text-white/60">Verify with your .edu email address</p>
              </div>
            </div>
            <input
              type="email"
              placeholder="your.name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-neon-cyan/30 bg-black-deep/50 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan"
            />
          </div>
          <div className="glass-neon p-6 rounded-xl border border-neon-blue/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-neon-blue/20 rounded-lg flex items-center justify-center border border-neon-blue/30">
                <Lock className="w-6 h-6 text-neon-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Enterprise Security</h3>
                <p className="text-sm text-white/60">Your data is encrypted and protected</p>
              </div>
            </div>
            <p className="text-sm text-white/60">
              We use campus verification to ensure a safe, authentic community
            </p>
          </div>
        </motion.div>
      ),
    },
    {
      title: 'Set Up Your Profile',
      subtitle: 'Choose username, avatar, and bio',
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass-neon p-6 rounded-2xl border border-neon-pink/30">
            <label className="block font-semibold mb-3 text-white">Choose Your Username</label>
            <input
              type="text"
              placeholder="cool_username_123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-neon-cyan/30 bg-black-deep/50 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-neon-pink"
            />
          </div>
          
          <div className="glass-neon p-6 rounded-2xl border border-neon-purple/30">
            <label className="block font-semibold mb-3 text-white">Choose Avatar</label>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {['🦄', '👾', '🤖', '🎭', '👽', '🔥', '⚡', '💫'].map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => setAvatar(emoji)}
                  className={`w-16 h-16 rounded-xl border-2 text-2xl flex items-center justify-center transition ${
                    avatar === emoji
                      ? 'border-neon-purple bg-neon-purple/20 shadow-neon-purple'
                      : 'border-white/10 bg-black-deep/30 hover:border-neon-purple/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/60">Or upload a real photo</p>
          </div>
          
          <div className="glass-neon p-6 rounded-xl border border-neon-cyan/30">
            <label className="block font-semibold mb-3 text-white">Bio</label>
            <textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-neon-cyan/30 bg-black-deep/50 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan"
            />
          </div>
        </motion.div>
      ),
    },
    {
      title: 'Interests & Intent',
      subtitle: 'Help us match you better',
      content: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass-neon p-6 rounded-2xl border border-neon-green/30">
            <label className="block font-semibold mb-3 text-white">Interests</label>
            <input
              type="text"
              placeholder="Coding, Design, Music..."
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-neon-cyan/30 bg-black-deep/50 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green"
            />
          </div>
          
          <div className="glass-neon p-6 rounded-2xl border border-neon-blue/30">
            <label className="block font-semibold mb-3 text-white">Skills</label>
            <input
              type="text"
              placeholder="React, Python, Design..."
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-neon-cyan/30 bg-black-deep/50 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-neon-blue"
            />
          </div>
          
          <div className="glass-neon p-6 rounded-xl border border-neon-yellow/30">
            <label className="block font-semibold mb-3 text-white">Current Intent</label>
            <select
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-neon-cyan/30 bg-black-deep/50 text-white focus:outline-none focus:ring-2 focus:ring-neon-yellow focus:border-neon-yellow"
            >
              <option value="">Select intent...</option>
              <option value="study">Study Partner</option>
              <option value="club">Club Collab</option>
              <option value="event">Event Buddy</option>
              <option value="mood">Just Vibing</option>
            </select>
          </div>
        </motion.div>
      ),
    },
  ]

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  const canProceed = () => {
    if (step === 1) return email.includes('@') && email.includes('.edu')
    if (step === 2) return username.length >= 3
    if (step === 3) return interests.length > 0 && skills.length > 0
    return true
  }

  const getProgressColor = (index: number) => {
    if (index <= step) {
      if (index === 0) return 'bg-neon-green'
      if (index === 1) return 'bg-neon-blue'
      if (index === 2) return 'bg-neon-pink'
      return 'bg-neon-purple'
    }
    return 'bg-white/10'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black-pure">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-neon rounded-3xl p-8 border border-neon-cyan/30 shadow-neon-cyan">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {steps.map((_, i) => (
                    <motion.div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-colors ${getProgressColor(i)}`}
                      animate={i <= step ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
                <h1 className="text-2xl font-bold mb-1 gradient-text">{steps[step].title}</h1>
                <p className="text-white/60">{steps[step].subtitle}</p>
              </div>

              <div className="min-h-[300px] flex items-center">{steps[step].content}</div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!canProceed()}
                className={`w-full py-3.5 rounded-lg font-semibold text-black-pure mt-6 flex items-center justify-center gap-2 transition-all ${
                  canProceed()
                    ? 'neon-gradient-green-blue shadow-neon-green hover:shadow-neon-green/50'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                {step === steps.length - 1 ? (
                  <>
                    <Check className="w-5 h-5" />
                    Get Started
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
