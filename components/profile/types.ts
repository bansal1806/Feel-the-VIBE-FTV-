export interface ProfileFormData {
  // Basic Identity
  name: string
  alias: string
  major: string
  year: string
  rollNumber: string
  avatarUrl: string
  headline: string
  pronouns: string
  hometown: string
  
  // Personality & Interests
  personalityTags: string[]
  hobbies: string[]
  techInterests: string[]
  moodIndicator: string
  
  // Tools & Media
  favoriteTools: string[]
  favoriteMedia: string[]
  inspirations: string[]
  
  // Academic & Projects
  currentSubjects: string
  ongoingProjects: string
  pastProjects: string
  techStack: string[]
  
  // Bio & Other
  bio: string
  
  // Privacy
  profileVisibility: 'everyone' | 'campus' | 'connections'
  allowMessagesFrom: 'everyone' | 'campus' | 'connections'
  dualIdentityMode: boolean
  discoverable: boolean
  recruiterOptIn: boolean
  shareAnalytics: boolean
  showRollNumber: boolean
}

