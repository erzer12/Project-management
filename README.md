# PMA - Enterprise Project Management System

A robust, scalable, and modern project management solution designed to streamline team collaboration and maximize productivity. Built with the latest web technologies to deliver a seamless, high-performance experience.

## 🎯 About PMA

PMA (Project Management App) was engineered to solve the complexity of managing modern software teams. By combining intuitive Kanban workflows with powerful role-based access control and intelligent notifications, PMA eliminates the chaos of project tracking. It empowers teams to focus on what matters: shipping great software.

## 🏆 Key Features

### 📋 Advanced Project Management
- **Interactive Kanban Board**: Drag-and-drop interface for fluid task management.
- **Customizable Workflows**: Create, edit, and reorder columns to fit your team's unique process.
- **Rich Task Details**: Comprehensive task attributes including priority, due dates, labels, and rich-text descriptions.
- **Media Support**: Seamless file attachments and image handling within tasks.

### 🤝 Team Collaboration
- **Real-Time Updates**: Instant synchronization of board state across all connected clients.
- **Threaded Comments**: Contextual discussions directly within tasks.
- **Member Management**: Streamlined interface for adding and removing team members.
- **Smart Search**: Instant user lookup for rapid team assembly.

### 🔔 Intelligent Notification System
- **Smart Grouping Engine**: Proprietary logic that aggregates multiple updates from a single user into a concise summary, reducing notification noise by up to 80%.
- **Project-Wide Alerts**: Automatic notifications for critical events (Task Creation, Status Changes, Assignments).
- **Unread Indicators**: Visual cues for missed updates.

### 🔐 Enterprise-Grade Security
- **Role-Based Access Control (RBAC)**: Granular permissions for Admins, Managers, and Members.
- **Secure Authentication**: Powered by NextAuth v5 with robust session management.
- **Data Isolation**: Strict project-level access boundaries.

## 🚀 Deployment

### Deploying to Vercel

1.  **Push to GitHub:** Ensure your project is pushed to a GitHub repository.
2.  **Import to Vercel:** Go to [Vercel](https://vercel.com), click "Add New...", and select "Project". Import your repository.
3.  **Configure Project:**
    *   **Framework Preset:** Next.js
    *   **Root Directory:** `./`
    *   **Build Command:** `npx prisma generate && next build` (Important!)
    *   **Install Command:** `npm install`
4.  **Environment Variables:** Add the following variables in the Vercel dashboard:
    *   `DATABASE_URL`: **Transaction Pooler URL** (Port 6543).
        *   Example: `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
    *   `DIRECT_URL`: **Session URL** (Port 5432).
        *   Example: `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres`
    *   `AUTH_SECRET`: A random 32-character string.
    *   `AUTH_TRUST_HOST`: `true`
5.  **Deploy:** Click "Deploy".

### Database Setup (Production)

Since Vercel is serverless, you need to push your database schema manually:

1.  **Connect to Prod DB:** Temporarily set your local `.env` `DATABASE_URL` to your production database URL (or use a separate `.env.production`).
2.  **Push Schema:**
    ```bash
    npx prisma db push
    ```
3.  **Seed Data (Optional):**
    ```bash
    node prisma/seed.js
    ```

## 🚀 Tech Stack

### Frontend Architecture
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Library**: shadcn/ui (Radix UI)
- **State Management**: React Server Components & Server Actions
- **Icons**: Lucide React

### Backend Infrastructure
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Auth.js (NextAuth v5)
- **Runtime**: Node.js

## 🛠️ Installation & Setup

### 1. Prerequisites
- Node.js 18.17 or later
- PostgreSQL database instance

### 2. Clone Repository
```bash
git clone <repository-url>
cd pm
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pm_db"
AUTH_SECRET="your-super-secret-key-generated-by-openssl"
```

### 5. Initialize Database
```bash
npx prisma generate
npx prisma db push
node test-db.js  # Seeds the database with test data
```

### 6. Start Application
```bash
npm run dev
```

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access. Can manage all users, projects, and system settings. Implicitly a member of all projects. |
| **Manager** | Can create projects, manage project members, and oversee task workflows within their owned projects. |
| **Member** | Can view assigned projects, create tasks, move tasks, and participate in discussions. |

## 📁 Project Structure

```
pm/
├── src/
│   ├── app/                 # Next.js App Router (Routes & Layouts)
│   │   ├── (auth)/          # Authentication Pages
│   │   ├── dashboard/       # Protected Application Interface
│   │   └── api/             # API Endpoints
│   ├── components/          # React Components
│   │   ├── kanban/          # Board & Task Components
│   │   ├── projects/        # Project & Member Management
│   │   └── ui/              # Design System (shadcn/ui)
│   ├── lib/                 # Core Logic & Utilities
│   │   ├── *-actions.ts     # Server Actions (Business Logic)
│   │   └── prisma.ts        # Database Client
│   └── types/               # TypeScript Definitions
├── prisma/                  # Database Schema
└── public/                  # Static Assets
```

## ✨ Feature Spotlight

### Smart Notification Grouping
PMA addresses the common issue of "notification spam" in active teams.
- **Problem**: Moving 10 tasks generates 10 separate notifications, cluttering the inbox.
- **Solution**: PMA's Smart Grouping detects rapid actions (within 5 minutes) from the same user and consolidates them into a single update: *"User X made multiple updates in Project Y"*.

### Context-Aware Navigation
The interface adapts to the user's context:
- **Dashboard**: Provides high-level metrics and quick links to project analysis.
- **Project View**: Focuses entirely on the Kanban board for maximum screen real estate and focus.

---
*Built with ❤️ for high-performance teams.*
