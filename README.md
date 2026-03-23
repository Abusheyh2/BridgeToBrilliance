# 🌉 BridgeToBrilliance

A nonprofit ManageBac-style learning management system built with **Next.js 14**, **Supabase**, and **Cloudinary**. All free-tier services.

## ✨ Features

- **Public Landing Page** — Animated hero with floating 3D bridge, mission section, features, team flip cards
- **Auth System** — Email/password register & login, role selection (Student/Teacher), password reset
- **Student Dashboard** — Enrolled subjects with progress bars, upcoming classes, announcements, grades, Recharts analytics
- **Teacher Dashboard** — Create subjects, upload video lessons (Cloudinary), schedule classes, post announcements, manage gradebook
- **Admin Dashboard** — User management, stats overview, global announcements
- **Subject Pages** — Tabbed interface with video player, announcements, classes, grades
- **Design System** — Royal blue/gold luxury nonprofit theme, Framer Motion animations throughout, glassmorphism

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Auth & Database:** Supabase (PostgreSQL + Auth)
- **Video Hosting:** Cloudinary (free tier, unsigned uploads)
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Forms:** react-hook-form + zod
- **Styling:** Tailwind CSS + Custom CSS design tokens
- **Icons:** Lucide React

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd btb-site
npm install
```

### 2. Set Up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → run `supabase/migration.sql`
3. Copy your **Project URL** and **Anon Key** from Settings → API

### 3. Set Up Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to **Settings → Upload** → Create an **unsigned upload preset**
3. Copy your **Cloud Name** and **Upload Preset Name**

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your keys:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### 5. Create Test Users

Register users through the app at `/register`:
- Create student accounts (select "Student" role)
- Create teacher accounts (select "Teacher" role)
- For admin: create a user, then in Supabase dashboard, update their `role` in the `profiles` table to `admin`

### 6. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Login
│   ├── register/page.tsx           # Register with role selection
│   ├── forgot-password/page.tsx    # Password reset
│   ├── dashboard/
│   │   ├── layout.tsx              # Protected layout with sidebar
│   │   ├── student/page.tsx        # Student dashboard
│   │   ├── teacher/page.tsx        # Teacher dashboard
│   │   └── admin/page.tsx          # Admin dashboard
│   └── subjects/[id]/page.tsx      # Subject detail page
├── components/
│   └── landing/                    # Landing page sections
├── lib/
│   ├── supabase/                   # Supabase clients
│   ├── cloudinary.ts               # Upload helper
│   └── utils.ts                    # Utility functions
├── types/
│   └── database.types.ts           # TypeScript types
├── supabase/
│   ├── migration.sql               # Database schema + RLS
│   └── seed.sql                    # Sample data template
└── middleware.ts                   # Route protection
```

## 🔒 Security

- **Row Level Security (RLS)** on all tables
- **Middleware** protects `/dashboard/*` and `/subjects/*` routes
- Students can only view enrolled subjects
- Teachers can only manage their own subjects/lessons
- Admin has full access

## 📄 License

This is a nonprofit educational project. Free to use and modify.
