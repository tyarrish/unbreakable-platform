# Rogue Leadership Training Experience - LMS Platform

A comprehensive Learning Management System for the Rogue Leadership Training Experience, built with Next.js 14, TypeScript, Supabase, and ShadCN UI.

## 🌲 Project Overview

The RLTE platform is an 8-month leadership development journey featuring:

- **Module-based Learning**: Structured curriculum with rich content management
- **Accountability Partners**: Matched pairs with weekly check-ins
- **Discussion Forums**: Real-time community engagement
- **Book Library**: Curated reading with progress tracking
- **Event Management**: Calendar with Zoom integration
- **Capstone Projects**: Milestone-based leadership projects
- **Analytics Dashboard**: Track engagement and completion rates

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: ShadCN UI
- **Backend**: Supabase (Auth, Database, Storage, Real-time)
- **Email**: Resend
- **Deployment**: Vercel
- **Icons**: Lucide React

## 🎨 Design System

### Color Palette

The platform uses a nature-inspired color scheme:

- **Primary Forest Tones**: `rogue-forest`, `rogue-pine`, `rogue-sage`
- **Accent Gold**: `rogue-gold`, `rogue-gold-light`
- **Supporting Neutrals**: `rogue-cream`, `rogue-slate`, `rogue-steel`
- **Earth Tones**: `rogue-terracotta`, `rogue-ochre`, `rogue-copper`

### Design Principles

- Glass-morphism effects for cards
- 0.5rem border radius throughout
- Smooth transitions (200ms duration)
- Nature-inspired progress metaphors (seedling → summit)
- Generous whitespace with cream backgrounds

## 📁 Project Structure

```
/Users/treveryarrish/Projects/Cohort/
├── app/                          # Next.js app router pages
│   ├── (auth)/                   # Authentication pages
│   ├── admin/                    # Admin dashboard
│   ├── dashboard/                # User dashboard
│   ├── modules/                  # Learning modules
│   ├── discussions/              # Discussion forums
│   ├── calendar/                 # Event calendar
│   ├── library/                  # Book library
│   └── profile/                  # User profile
├── components/
│   ├── ui/                       # ShadCN UI components
│   ├── layout/                   # Layout components
│   ├── auth/                     # Auth-specific components
│   ├── modules/                  # Module components
│   ├── discussions/              # Discussion components
│   ├── events/                   # Event components
│   ├── partners/                 # Partner components
│   ├── books/                    # Book components
│   ├── admin/                    # Admin components
│   └── capstone/                 # Capstone components
├── lib/
│   ├── supabase/                 # Supabase client & queries
│   ├── constants/                # App constants
│   └── utils/                    # Utility functions
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
└── .cursorrules                  # Cursor AI coding standards
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (package manager)
- Supabase account
- Resend account (for emails)

### Installation

1. Clone the repository:
   ```bash
   cd /Users/treveryarrish/Projects/Cohort
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   RESEND_API_KEY=your-resend-api-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Setup

### Supabase Configuration

1. Create a new Supabase project for each environment (dev, staging, prod)
2. Run the database migrations (coming in Phase 3)
3. Set up Row Level Security (RLS) policies
4. Configure storage buckets for file uploads

### Database Schema

The platform uses the following main tables:
- `profiles` - User profiles with roles
- `modules` & `lessons` - Learning content
- `lesson_progress` - User progress tracking
- `reflections` - User journal entries
- `discussion_threads` & `discussion_posts` - Community forums
- `events` & `event_attendance` - Calendar management
- `books` & `reading_progress` - Library tracking
- `partner_questionnaire` & `partner_checkins` - Accountability
- `capstone_projects` - Final projects

## 🎯 User Roles

- **Admin**: Full platform control, content management, user oversight
- **Facilitator**: Content management, moderation, user support
- **Participant**: Learning access, community engagement, progress tracking

## 📦 Available Scripts

```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## 🔐 Authentication

Authentication is handled by Supabase Auth with:
- Email/password login
- Role-based access control
- Protected routes via middleware
- Automatic session refresh

## 🎨 Adding UI Components

The project uses ShadCN UI. To add new components:

```bash
pnpm dlx shadcn@latest add [component-name]
```

All components are customized with the Rogue color palette.

## 📝 Coding Standards

See `.cursorrules` for comprehensive development guidelines including:
- File organization conventions
- Component design principles
- TypeScript standards
- Supabase best practices
- Performance optimization
- Accessibility requirements

## 🚢 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Set up preview deployments for branches
4. Deploy to production

### Environment Strategy

- **Development**: Local development with dev Supabase project
- **Staging**: Preview deployments with staging Supabase project
- **Production**: Main branch with production Supabase project

## 📅 Development Timeline

- **Phase 1** (Days 1-2): ✅ Project setup & infrastructure
- **Phase 2** (Days 3-4): Design system & theming (In Progress)
- **Phase 3** (Days 5-7): Authentication & user management
- **Phase 4** (Days 8-12): Learning management system
- **Phase 5** (Days 13-16): Discussion & community features
- **Phase 6** (Days 17-19): Partner matching & accountability
- **Phase 7** (Days 20-22): Events & calendar management
- **Phase 8** (Days 23-25): Book library & reading progress
- **Phase 9** (Days 26-30): Analytics, capstone & launch prep

**Target Launch**: October 23, 2025  
**First Cohort**: 24 participants

## 🎯 Success Metrics

- 90% login rate in first week
- 80% module completion rate
- 75% discussion engagement rate
- Sub-2s page load times
- Zero critical security vulnerabilities

## 🤝 Contributing

This is a solo project built with Claude Sonnet 4.5 in Cursor. Follow the `.cursorrules` guidelines for consistent code quality.

## 📄 License

Private project for Rogue Leadership Training Experience.

## 🌟 Platform Features

### Learning Management
- ✅ 8-month modular curriculum
- ✅ Rich text lesson editor (TipTap)
- ✅ **Professional video player** with progress tracking
- ✅ **Curriculum tree sidebar** with navigation
- ✅ **Resource management** (PDFs, documents, worksheets)
- ✅ Reflection journals with word count
- ✅ Automated progress tracking
- ✅ Release date scheduling

### Community & Engagement
- ✅ Real-time discussion forums
- ✅ Threaded conversations with reactions
- ✅ **Accountability partner messaging** (real-time)
- ✅ Weekly check-in system
- ✅ Role-based badges

### Events & Library
- ✅ Event calendar with Zoom integration
- ✅ Registration and attendance tracking
- ✅ Curated book library
- ✅ Reading progress tracking

### Analytics & Administration
- ✅ Success metrics dashboard
- ✅ Engagement tracking
- ✅ Capstone project management
- ✅ User management
- ✅ Content moderation tools

### Design & UX
- ✅ **Animated progress indicators**
- ✅ **Collapsible curriculum tree**
- ✅ Mobile responsive with drawer navigation
- ✅ Glass-morphism effects
- ✅ Nature-inspired progress metaphors
- ✅ Accessibility features (WCAG 2.1 AA)

---

Built with 🌲 for the Rogue Leadership community.
