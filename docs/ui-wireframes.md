# UI Wireframes (Conceptual)

## 1. Onboarding Flow
- **Step 1**: Welcome screen, CTA to sign in with `.edu` email (Clerk magic link). Ad slot hidden.
- **Step 2**: Email verification pending screen with progress illustration.
- **Step 3**: Profile setup – upload avatar, choose alias, select major/year, pick interests (tag chips).
- **Step 4**: Privacy preferences – dual identity toggle, campus visibility settings.
- **Final**: Completion summary, CTA to enter Discover. Ad slot reserved at footer for future use.

## 2. Discover (Swipe Deck)
- Header: Logo, campus selector, notifications bell, credits badge, hamburger.
- Main deck: cards for rooms/events/people with gradient backgrounds, CTA buttons (Connect, RSVP, Join).
- Swipe gestures (left/right). Interstitial ad card every 5 swipes.
- Bottom nav: Discover, Rooms, Chat, Capsules, Profile.

## 3. Now Rooms
- Radar hero: circular map with nearby avatars, toggle between list/radar.
- Room cards: gradient panels with distance, participant count (live), join button.
- Sticky join modal with chat preview.
- Ad slot: inline between room cards + persistent bottom banner on desktop.

## 4. Chat
- Sidebar (desktop) / slide-over (mobile) listing conversations and rooms.
- Conversation view: message bubbles, read receipts, typing indicators.
- Composer: attachments, GIFs placeholder, send button.
- Ad slot: right rail (desktop) or top banner (mobile).

## 5. Timecapsules
- Timeline view: chronological capsules with unlock dates, progress badges.
- Capsule detail: hero image/video, description, countdown, contributors.
- Create modal: title, audience, upload media, schedule unlock.
- Ad slot: after every two capsules in list.

## 6. Profile & Settings
- Header: avatar, alias, verification badge.
- Tabs: Overview, Achievements, Privacy, Devices.
- Metrics: SkillCreds chart, streaks, campus verification status.
- Settings: toggles for notifications, dual identity, ad personalization.
- Ad slot: optional card near bottom (hide if subscription).

## Responsive Considerations
- Mobile-first layout with safe-area padding, floating nav bar.
- Tablet: two-column layout (content + context panel).
- Desktop: three columns (nav, primary content, right rail ads/aux).

## Design Language
- Glassmorphism cards, neon gradients, subtle noise backgrounds.
- Motion: fade/slide transitions, interactive hover glows.
- Typography: modern sans-serif with variable weights.
- Iconography: Lucide icons with gradient strokes.

## Accessibility Notes
- Dark/light theme toggle, WCAG AA contrast.
- Keyboard focus states, reduced motion option.
- Screen reader labels for swipe actions and realtime updates.

