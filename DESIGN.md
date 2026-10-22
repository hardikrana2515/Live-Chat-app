# Talkyy Landing Page - Design Specification (Master Brief)

## Product Identity
- **Product name**: Talkyy
- **Category**: Private, real-time messaging and group communication
- **Positioning**: End-to-end encrypted private chats, groups, voice messages, media sharing, voice/video calls
- **Brand personality**: Human, confident, thoughtful, distinctive, technically credible, playful in small details, premium through craftsmanship
- **Primary audience**: Friends, families, small teams, communities
- **Primary conversion**: Create account & start conversation
- **Secondary conversion**: Existing users sign in

## Design System

### Core Palette (from brief)
- Warm paper: #F7F5EF (main marketing-page background)
- Primary ink: #191B20 (headings, body text)
- Secondary ink: #51545C (secondary text)
- Pure white: #FFFFFF
- Brand cobalt: #2858E8 (primary actions, links, selected states)
- Deep blue: #173BB5 (hover, pressed states)
- Soft blue surface: #E8EEFF (supporting accent)
- Fine divider: #DCDAD3
- Quiet mint accent: #B9D9C7 (supporting, not full-page backgrounds)
- Dark section background: #191D25
- Dark section text: #F7F5EF

### Usage Rules
- Warm paper is main background
- Primary ink for headings and body text
- Cobalt for primary actions, links, selected states
- Deep blue for hover and pressed states
- Soft blue and mint as supporting accents only
- Dark sections used selectively for contrast
- Never make every section different pastel color
- Avoid constant alternation of white cards on pale-gray
- No gradient-heavy backgrounds, neon accents, glowing outlines

### Typography
- **Display/headings**: Space Grotesk, bold/semibold
- **Body text**: DM Sans, regular through semibold

Load fonts from reliable source with sensible fallbacks.

### Layout and Spacing
- Responsive 12-column editorial grid on desktop
- Max content width: 1240–1320px
- Generous but purposeful section spacing
- Allow elements to break the grid
- Asymmetry where it improves composition
- Body content readable and aligned
- 6–10px radii for ordinary controls
- Large radii for specific compositions only
- Subtle shadows only when depth needed
- Don't enforce rigid 8px rhythm making sections identical

### Anti-Generic UI Rules (NON-NEGOTIABLE)
- ❌ No indigo-to-purple or blue-to-purple gradients
- ❌ No neon purple, pink, or cyan glow effects
- ❌ No glassmorphism translucent floating panels
- ❌ No blurred gradient blobs
- ❌ No glowing borders
- ❌ No oversized centered headings with generic gray subtitles
- ❌ No identical 3-column/4-column feature-card grids repeated
- ❌ No rows of decorative statistics
- ❌ No fake social proof or invented user counts
- ❌ No standard SaaS hero with two buttons + floating dashboard
- ❌ No identical rounded cards with shadows everywhere
- ❌ No excessive pill-shaped buttons
- ❌ No excessive border radii
- ❌ No scroll animations on every heading/image
- ❌ No placeholder links, lorem ipsum, or dead buttons
- ❌ No "premium" as dark background + glowing blue edges
- ❌ No "minimal" as mostly empty space + giant heading
- ❌ No "3D" as animated sphere beside hero

### Motion & Interaction
**Allowed:**
- Subtle entrance animation for hero product composition
- Gentle movement in 3D sculpture
- Small message-preview transitions
- Understated hover feedback
- Subtle transitions between sections
- Controlled reveal of real product UI

**Avoid:**
- Continuous motion across entire screen
- Long entrance animations delaying content access
- Scroll hijacking
- Infinite parallax
- Autoplay audio/video
- Animations preventing interaction
- Excessive motion on mobile

### Responsive Breakpoints
- Large desktop: 1440px+
- Standard desktop: 1280px
- Tablet: 768–1024px
- Mobile: 375px, 390px, 430px

### Accessibility & Performance
- Semantic HTML, proper heading hierarchy
- Keyboard-accessible navigation and controls
- Visible focus indicators
- Appropriate text contrast
- Color not sole indicator of meaning
- Reduced-motion support
- Lazy-loaded below-the-fold imagery
- Optimized font loading
- No layout shifts from images or 3D
- No console errors
- No broken routes or asset imports
- Measure Core Web Vitals

### SEO Metadata
- **Title**: "Talkyy — Private Chats, Groups & Video Calls"
- **Description**: "Stay connected with Talkyy through real-time messages, group conversations, media sharing, and voice and video calls, with end-to-end encryption for supported conversations."
- Open Graph metadata
- Favicon and brand assets
- Canonical URL (if production domain known)
- Semantic content, descriptive image alt text

### Required Design & Implementation Workflow

**Stage A** — Repository audit (Completed)
**Stage B** — Design specification (This DESIGN.md)
**Stage C** — Page architecture
**Stage D** — Implement the complete landing page
**Stage E** — Visual quality review
**Stage F** — Functional and technical verification

### Definition of Done
1. Public Talkyy landing page implemented in existing app
2. Coherent, documented design system
3. Visually distinct from generic AI-generated SaaS designs
4. Screenshots influence real product presentation
5. 3D element has clear purpose + lightweight fallback
6. Registration/login connect to existing routes
7. Works at desktop, tablet, mobile widths
8. Accessibility and reduced-motion considered
9. Production build succeeds
10. Existing chat/encryption/calling/auth unchanged
11. No fabricated product claims or fake social proof
12. Visually inspected and refined

### Files Created/Changed (to be documented at completion)
- DESIGN.md
- Landing page components
- Any new routes or modifications
- Dependencies added
- Tests and build commands executed
- Remaining issues