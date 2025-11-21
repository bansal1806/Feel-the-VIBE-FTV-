'use client'

import { motion } from 'framer-motion'
import { 
  Building2, 
  Ticket, 
  GraduationCap, 
  Users, 
  Database,
  DollarSign,
  Sparkles,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react'
import { useState } from 'react'

interface RevenueModel {
  id: string
  title: string
  subtitle: string
  description: string
  howItWorks: string // Explanation of how revenue is generated
  features: string[]
  icon: React.ElementType
  color: string
  gradient: string
  revenueType: 'recurring' | 'transaction' | 'subscription'
  targetCustomers: string
}

const revenueModels: RevenueModel[] = [
  {
    id: 'sponsors',
    title: 'Local Sponsors & Brands',
    subtitle: 'Promoted Rooms & Sponsored Challenges',
    description: 'Local businesses promote via featured placements and interactive challenges',
    howItWorks: 'Local businesses pay for featured placements ("Promoted Rooms") in student feeds and sponsor interactive challenges. Revenue through monthly advertising fees.',
    features: [
      'Promoted Rooms (featured placement)',
      'Sponsored Challenges (gamified engagement)',
      'Location-based advertising',
      'Performance analytics'
    ],
    icon: Building2,
    color: 'from-purple-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    revenueType: 'recurring',
    targetCustomers: 'Local businesses, cafes, gyms, event venues'
  },
  {
    id: 'ticketing',
    title: 'Event Ticketing',
    subtitle: 'RSVPs & Paid Event Management',
    description: 'Clubs use Vibe for RSVPs and paid event management',
    howItWorks: 'Clubs enable paid ticketing on events. Students buy tickets through the app. Revenue through transaction fees on each sale, plus RSVP and analytics tools.',
    features: [
      'Event RSVP management',
      'Paid ticket sales with transaction fee',
      'Attendance tracking',
      'Event analytics'
    ],
    icon: Ticket,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    revenueType: 'transaction',
    targetCustomers: 'Student clubs, organizations, campus events'
  },
  {
    id: 'campus',
    title: 'Campus Partnerships',
    subtitle: 'Verified Onboarding & Analytics',
    description: 'Universities pay for verified onboarding, analytics, and event dashboards',
    howItWorks: 'Universities pay annual subscription for verified onboarding, campus analytics dashboards, event management, and compliance tools. Revenue through partnership agreements.',
    features: [
      'Verified student onboarding (.ac.in/.edu.in)',
      'Campus-wide analytics dashboard',
      'Event management tools',
      'Safety and compliance reporting'
    ],
    icon: GraduationCap,
    color: 'from-emerald-500 to-teal-500',
    gradient: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    revenueType: 'subscription',
    targetCustomers: 'Universities, colleges, student affairs offices'
  },
  {
    id: 'recruiters',
    title: 'Recruiter & Alumni Modules',
    subtitle: 'Talent Discovery & Mentorship',
    description: 'Verified talent discovery and mentorship access',
    howItWorks: 'Companies and alumni pay monthly subscriptions to access verified student profiles, advanced search for recruitment, and mentorship matching. Revenue through subscription fees.',
    features: [
      'Verified talent discovery',
      'Targeted recruitment tools',
      'Mentorship matching platform',
      'Premium access to student profiles'
    ],
    icon: Users,
    color: 'from-orange-500 to-red-500',
    gradient: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
    revenueType: 'subscription',
    targetCustomers: 'Tech companies, consulting firms, alumni networks'
  },
  {
    id: 'data',
    title: 'Data Insights API',
    subtitle: 'Anonymous Campus Analytics',
    description: 'Anonymous campus analytics for institutions and sponsors',
    howItWorks: 'Institutions and agencies pay subscription fees for anonymized campus analytics, trend insights, and behavioral data via API. Revenue through tiered API subscriptions.',
    features: [
      'Anonymous aggregated analytics',
      'Campus trend insights',
      'Demographic and engagement data',
      'API access for integrations'
    ],
    icon: Database,
    color: 'from-indigo-500 to-purple-500',
    gradient: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
    revenueType: 'subscription',
    targetCustomers: 'Research institutions, marketing agencies, sponsors'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export default function RevenueModels() {
  const totalRevenueStreams = revenueModels.length
  const recurringStreams = revenueModels.filter(m => m.revenueType === 'recurring' || m.revenueType === 'subscription').length
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed'>('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Revenue Strategy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Multiple Revenue Streams
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            5 diversified revenue streams targeting local businesses, institutions, and enterprise clients
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="glass rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">{totalRevenueStreams}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Revenue Streams</div>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">{recurringStreams}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Recurring/Subscription Models</div>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-sm text-slate-600 dark:text-slate-400">Scalable & Diversified</div>
          </div>
        </motion.div>

        {/* View Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-2 mb-8"
        >
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedView === 'overview'
                ? 'glass text-blue-600 dark:text-blue-400 shadow-md'
                : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setSelectedView('detailed')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedView === 'detailed'
                ? 'glass text-blue-600 dark:text-blue-400 shadow-md'
                : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <PieChart className="w-4 h-4 inline mr-2" />
            Detailed Breakdown
          </button>
        </motion.div>

        {/* Revenue Models Overview */}
        {selectedView === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Revenue Models Overview
            </h2>
            <div className="space-y-6">
              {revenueModels.map((model) => (
                <div key={model.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0 pb-6 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center flex-shrink-0`}>
                      <model.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-1">{model.title}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">{model.subtitle}</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{model.howItWorks}</div>
                      <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                        <strong>Target Customers:</strong> {model.targetCustomers}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Detailed View */}
        {selectedView === 'detailed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <PieChart className="w-6 h-6" />
              Revenue Generation Flow
            </h2>
            <div className="space-y-6">
              {revenueModels.map((model) => (
                <div key={model.id} className={`rounded-xl p-6 ${model.gradient}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center flex-shrink-0`}>
                      <model.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-slate-800 dark:text-slate-200 mb-1">{model.title}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{model.subtitle}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">How Revenue is Generated</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{model.howItWorks}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Key Features</div>
                      <ul className="space-y-1">
                        {model.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${model.color} mt-1.5 flex-shrink-0`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">Target Customers</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">{model.targetCustomers}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Revenue Models Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {revenueModels.map((model) => (
            <motion.div
              key={model.id}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              {/* Icon & Header */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <model.icon className="w-7 h-7 text-white" />
              </div>

              <div className="mb-3">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {model.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {model.subtitle}
                </p>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {model.description}
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-4">
                {model.features.slice(0, 2).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${model.color} mt-1.5 flex-shrink-0`} />
                    <span>{feature}</span>
                  </li>
                ))}
                {model.features.length > 2 && (
                  <li className="text-xs text-slate-500 dark:text-slate-500 italic">
                    +{model.features.length - 2} more features
                  </li>
                )}
              </ul>

              {/* Revenue Type & How It Works */}
              <div className={`mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3`}>
                <div className="flex items-center gap-2">
                  <DollarSign className={`w-4 h-4 bg-gradient-to-br ${model.color} bg-clip-text text-transparent`} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {model.revenueType === 'recurring' ? 'Recurring Revenue Model' : model.revenueType === 'transaction' ? 'Transaction-Based Revenue' : 'Subscription Revenue Model'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {model.howItWorks}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4 text-center">
            Revenue Model Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Revenue Strengths</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span><strong>Diversified:</strong> 5 independent revenue streams reduce risk</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span><strong>Recurring:</strong> 4 of 5 streams are recurring/subscription-based</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span><strong>Scalable:</strong> Revenue scales with campus expansion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span><strong>Multiple Customers:</strong> B2B2C model targets different customer segments</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Market Opportunity</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span><strong>40,000+</strong> colleges & universities in India</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span><strong>40M+</strong> college students (target user base)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span><strong>Multiple revenue streams</strong> per campus create sustainable income</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span><strong>High retention:</strong> Students stay 3-4 years, creating long-term value</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

