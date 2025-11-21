# Profile Section System

A complete, modular profile management system for the campus-connect platform with all requested features.

## Structure

```
components/profile/
├── ProfilePage.tsx          # Main profile page component
├── BasicDetailsSection.tsx  # Basic verified identity
├── PersonalityTagsSection.tsx # Personality tags
├── HobbiesSection.tsx       # Campus hobbies
├── TechInterestsSection.tsx # Tech & creative interests
├── MoodSection.tsx          # Mood & vibe indicators
├── InspirationsSection.tsx  # Tools, media & inspirations
├── AcademicSection.tsx      # Academic & project details
├── BioSection.tsx          # Bio/about section
├── PrivacySection.tsx       # Privacy controls
├── ProfileSection.tsx       # Reusable section wrapper
├── form/
│   ├── TextField.tsx        # Text input component
│   ├── TextArea.tsx         # Textarea component
│   ├── ToggleRow.tsx        # Toggle switch component
│   └── SelectField.tsx      # Select dropdown component
├── types.ts                 # TypeScript types
└── index.ts                 # Barrel exports
```

## Features

### 1. Basic Verified Identity
- ✅ Verified name with checkmark badge
- ✅ Branch/Major & Year
- ✅ Roll Number/ID with optional visibility toggle
- ✅ Profile Photo/Avatar with URL input
- ✅ Headline, Pronouns, Hometown

### 2. Personality Tags
- ✅ Multi-select tags: Introvert/Extrovert, Builder/Designer/Researcher, Night Owl/Early Bird, Team Player/Solo Operator
- ✅ Visual selection with toggle buttons
- ✅ Helps match work styles

### 3. Campus Hobbies
- ✅ Predefined hobbies: badminton, photography, gaming, content creation, robotics, music, trekking, etc.
- ✅ Custom hobby input (supports gaming genres)
- ✅ Tag-based display

### 4. Tech & Creative Interests
- ✅ Predefined interests: AI/ML, hardware hacking, UI/UX, finance, startups, anime, sci-fi, etc.
- ✅ Custom interest input
- ✅ Makes conversations easier and builds instant rapport

### 5. Mood & Vibe Indicators
- ✅ Predefined options: "Usually chill but focused", "Hyperactive builder mode", "Minimal talk, maximum work", etc.
- ✅ Custom mood input
- ✅ Simple vibe cues (not memes)

### 6. Inspirations & Tools
- ✅ Favorite Tools/Frameworks: Add/remove (e.g., React, Figma, VS Code)
- ✅ Favorite Media/Creators: Add creators, books, etc.
- ✅ Inspirations: Add role models (e.g., "Tony Stark-like builder")
- ✅ Gives personality without clutter

### 7. Academic & Project Details
- ✅ Current Subjects: Text area
- ✅ Ongoing Projects: Text area
- ✅ Past Projects: Text area (short)
- ✅ Tech Stack: Tag-based input with add/remove
- ✅ Helps others find collaborators

### 8. Privacy Controls
- ✅ Dual identity mode toggle
- ✅ Discoverable toggle
- ✅ Recruiter opt-in
- ✅ Analytics sharing
- ✅ Profile visibility settings
- ✅ Message permissions

## Usage

```tsx
import { ProfilePage } from '@/components/profile'

// Use in your app
<ProfilePage />
```

## Data Structure

The profile data is stored in a scalable structure:

- **Basic Info**: Stored in User model fields (name, alias, major, year, etc.)
- **Interests**: Combined array stored in `interests` field, parsed by category
- **Structured Data**: Stored in `bio` field with special markers:
  - `Mood: ...`
  - `Tools: ...`
  - `Media: ...`
  - `Inspirations: ...`
  - `Subjects: ...`
  - `Ongoing: ...`
  - `Past: ...`
  - `Roll: ...`

## View/Edit Modes

- **View Mode**: Displays all profile information in a clean, read-only format
- **Edit Mode**: Full editing capabilities with all form fields
- Toggle between modes with the Edit/View button

## Responsive Design

- ✅ Mobile-first approach
- ✅ Responsive grid layouts
- ✅ Touch-friendly interactions
- ✅ Optimized for all screen sizes

## Styling

- ✅ Neon aesthetic throughout
- ✅ Color-coded sections (cyan, pink, yellow, purple, green)
- ✅ Glassmorphism effects
- ✅ Smooth animations
- ✅ Consistent design language

## Integration

The profile system integrates with:
- Profile API (`/api/profile`)
- Global state management
- Intent picker
- Seeking editor
- Trust progression system

