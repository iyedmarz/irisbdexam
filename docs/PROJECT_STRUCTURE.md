# Project Structure - IRIS Exam Platform

## 📂 Organized File Structure

```
iris-exam-platform/
│
├── 📄 Configuration Files (Root)
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── next.config.js            # Next.js configuration
│   ├── .env.local.template       # Environment variables template
│   ├── .gitignore                # Git ignore rules
│   └── README.md                 # Main documentation
│
├── 📁 app/                       # Next.js App Router (Entry Point)
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main application entry (login/dashboard)
│   │
│   └── 📁 api/                   # Backend API Routes
│       ├── auth/
│       │   └── login/
│       │       └── route.ts      # POST /api/auth/login
│       ├── users/
│       │   └── route.ts          # GET /api/users
│       ├── exams/
│       │   ├── route.ts          # GET, POST /api/exams
│       │   └── [id]/
│       │       └── route.ts      # GET, PUT, DELETE /api/exams/:id
│       ├── submissions/
│       │   └── route.ts          # GET, POST /api/submissions
│       └── attempts/
│           └── route.ts          # GET, POST, DELETE /api/attempts
│
├── 📁 components/                # React Components
│   ├── LoginPage.tsx             # User authentication UI
│   ├── TeacherDashboard.tsx      # Teacher main dashboard
│   ├── StudentDashboard.tsx      # Student main dashboard
│   ├── CreateExam.tsx            # Exam creation form
│   ├── ExamTaking.tsx            # Student exam interface
│   ├── ExamResults.tsx           # Results display
│   ├── TeacherExamView.tsx       # Teacher exam statistics
│   │
│   ├── 📁 ui/                    # shadcn/ui Components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── ... (40+ components)
│   │   └── utils.ts
│   │
│   └── 📁 figma/                 # Protected Figma Components
│       └── ImageWithFallback.tsx
│
├── 📁 lib/                       # Core Libraries & Utilities
│   ├── api-client.ts             # Client-side API wrapper (browser)
│   ├── db-storage.ts             # Server-side database operations
│   ├── db.ts                     # PostgreSQL connection pool
│   ├── queries.ts                # SQL query definitions
│   └── export.ts                 # CSV/PDF export utilities
│
├── 📁 types/                     # TypeScript Definitions
│   └── index.ts                  # Shared type definitions
│
├── 📁 scripts/                   # Database Utilities
│   ├── hash-passwords.ts         # Password hashing utility
│   ├── migrate.ts                # Database migration runner
│   └── test-connection.ts        # Database connection tester
│
├── 📁 migrations/                # Database Schema
│   └── 001_initial_schema.sql    # Initial database setup
│
├── 📁 styles/                    # Global Styles
│   └── globals.css               # Tailwind CSS + custom styles
│
├── 📁 docs/                      # Documentation
│   ├── DATABASE_ARCHITECTURE.md  # Database schema details
│   ├── GIT_PUSH_GUIDE.md         # Git workflow guide
│   ├── PGADMIN_CONNECTION_GUIDE.md # pgAdmin setup
│   ├── PROJECT_STRUCTURE.md      # This file
│   └── Guidelines.md             # Development guidelines
│
└── 📁 guidelines/                # Protected System Files
    └── Guidelines.md             # Figma Make AI guidelines

```

---

## 🗂️ Directory Descriptions

### `/app` - Next.js App Router
**Purpose:** Application entry point and API routes  
**Key Files:**
- `page.tsx` - Main React component (handles routing to login/dashboards)
- `layout.tsx` - Root layout with global providers
- `api/` - Backend API endpoints (server-side only)

**Why App Router?**
- File-based routing
- Built-in API routes
- Server and Client Components separation
- Better performance with React Server Components

---

### `/components` - React Components
**Purpose:** Reusable UI components  
**Organization:**
- **Top-level:** Page-level components (dashboards, exam interfaces)
- **ui/:** shadcn/ui library components (buttons, dialogs, forms)
- **figma/:** Protected Figma-specific components

**Component Hierarchy:**
```
App (page.tsx)
├── LoginPage
├── TeacherDashboard
│   ├── CreateExam
│   └── TeacherExamView
└── StudentDashboard
    ├── ExamTaking
    └── ExamResults
```

---

### `/lib` - Core Libraries
**Purpose:** Business logic and utilities  
**Files:**

| File | Purpose | Usage |
|------|---------|-------|
| `api-client.ts` | Client-side API calls | Browser (fetch API) |
| `db-storage.ts` | Server-side database | API routes only |
| `db.ts` | PostgreSQL pool | Server-side only |
| `queries.ts` | SQL queries | Database operations |
| `export.ts` | CSV/PDF generation | Export functionality |

**Architecture Flow:**
```
Browser Component → api-client.ts → API Route → db-storage.ts → PostgreSQL
```

---

### `/app/api` - API Routes
**Purpose:** Backend endpoints for database operations  
**Structure:**

```
/api/auth/login        POST   - User authentication
/api/users             GET    - Fetch all users
/api/exams             GET    - List all exams
                       POST   - Create new exam
/api/exams/:id         GET    - Get exam details
                       PUT    - Update exam
                       DELETE - Delete exam
/api/submissions       GET    - Get student submissions
                       POST   - Submit exam answers
/api/attempts          GET    - Get active exam session
                       POST   - Start new exam attempt
                       DELETE - Clear exam attempt
```

**Why API Routes?**
- Keeps database credentials server-side (security)
- Single deployment (no separate backend server)
- TypeScript end-to-end
- Easy to add middleware (auth, rate limiting)

---

### `/types` - TypeScript Types
**Purpose:** Shared type definitions  
**Key Types:**
- `User` - Teacher/Student user
- `Exam` - Exam metadata
- `Question` - Question with answer options
- `ExamSubmission` - Completed exam
- `ExamAttempt` - Active exam session

---

### `/scripts` - Database Utilities
**Purpose:** Development and deployment tools  
**Scripts:**
- `hash-passwords.ts` - Hash default user passwords
- `migrate.ts` - Run database migrations
- `test-connection.ts` - Verify PostgreSQL connection

**Usage:**
```bash
npm run db:seed      # Hash passwords
npm run db:migrate   # Run migrations
npm run db:test      # Test connection
```

---

### `/migrations` - Database Schema
**Purpose:** Version-controlled database changes  
**Current:**
- `001_initial_schema.sql` - Creates 8 tables (users, exams, questions, etc.)

**Future migrations:**
- `002_add_question_images.sql`
- `003_add_exam_categories.sql`
- etc.

---

### `/docs` - Documentation
**Purpose:** Project documentation (organized)  
**Files:**
- `DATABASE_ARCHITECTURE.md` - Complete DB schema
- `GIT_PUSH_GUIDE.md` - Git workflow
- `PGADMIN_CONNECTION_GUIDE.md` - Database connection help
- `PROJECT_STRUCTURE.md` - This file
- `Guidelines.md` - Development guidelines

---

### `/styles` - Global Styles
**Purpose:** Application-wide CSS  
**Contains:**
- Tailwind CSS configuration
- Custom CSS variables
- Global typography
- Component overrides

---

## 🔑 Key Files

### Entry Points
| File | Purpose |
|------|---------|
| `/app/page.tsx` | Main React entry point |
| `/app/layout.tsx` | Root layout wrapper |
| `/lib/api-client.ts` | Client-side API interface |
| `/lib/db-storage.ts` | Server-side data layer |

### Configuration
| File | Purpose |
|------|---------|
| `package.json` | Dependencies & scripts |
| `tsconfig.json` | TypeScript config |
| `next.config.js` | Next.js config |
| `.env.local` | Environment variables (not in Git) |

---

## 🚫 Protected Files (System)

These files are managed by Figma Make and should not be deleted:
- `/App.tsx` - Legacy entry point (kept for compatibility)
- `/Attributions.md` - License attributions
- `/guidelines/Guidelines.md` - AI guidelines
- `/components/figma/ImageWithFallback.tsx` - Image helper

---

## 📦 Import Patterns

### Components
```typescript
// Pages
import { LoginPage } from './components/LoginPage';

// UI Components
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
```

### Libraries (Client-side)
```typescript
import { getCurrentUser, login } from '../lib/api-client';
```

### Libraries (Server-side - API routes only)
```typescript
import { getUsers, createExam } from '../lib/db-storage';
import pool from '../lib/db';
```

### Types
```typescript
import { User, Exam, Question } from '../types';
```

---

## 🎯 Best Practices

### File Organization
✅ Keep components in `/components`  
✅ Keep utilities in `/lib`  
✅ Keep API routes in `/app/api`  
✅ Keep docs in `/docs`  
❌ Don't mix server/client code in same file  
❌ Don't import database code in components  

### Import Rules
✅ Client components: Use `api-client.ts`  
✅ Server components/API routes: Use `db-storage.ts`  
✅ Always use relative imports  
❌ Never import `db.ts` or `pg` in client components  

### Naming Conventions
- **Components:** PascalCase (`TeacherDashboard.tsx`)
- **Utilities:** camelCase (`api-client.ts`)
- **Types:** PascalCase (`User`, `Exam`)
- **API Routes:** kebab-case (`/api/auth/login`)

---

## 🔄 File Dependencies

```
┌─────────────────────────────────────────────┐
│ Browser (Client)                            │
│                                             │
│ ┌─────────────┐         ┌───────────────┐  │
│ │ Components  │────────>│ api-client.ts │  │
│ └─────────────┘         └───────┬───────┘  │
└─────────────────────────────────┼──────────┘
                                  │
                                  │ HTTP
                                  │
┌─────────────────────────────────▼──────────┐
│ Next.js Server (API Routes)                │
│                                             │
│ ┌─────────────┐         ┌───────────────┐  │
│ │ /app/api/*  │────────>│ db-storage.ts │  │
│ └─────────────┘         └───────┬───────┘  │
│                                  │          │
│                         ┌────────▼────────┐ │
│                         │ db.ts (pool)    │ │
│                         └────────┬────────┘ │
└─────────────────────────────────┼──────────┘
                                  │
                                  │ SQL
                                  │
┌─────────────────────────────────▼──────────┐
│ PostgreSQL Database                        │
│                                             │
│ users, exams, questions, submissions, etc. │
└────────────────────────────────────────────┘
```

---

## 📝 Notes

1. **App.tsx vs app/page.tsx:**  
   - `App.tsx` is a legacy file from initial setup
   - `app/page.tsx` is the actual Next.js App Router entry point
   - Both exist for compatibility but only `page.tsx` is used

2. **Client vs Server:**  
   - Components in `/components` are client-side (use `api-client.ts`)
   - Code in `/app/api` is server-side (use `db-storage.ts`)
   - Never mix them!

3. **Documentation Location:**  
   - All documentation moved to `/docs` for clarity
   - Root level only contains essential config and README

---

**Last Updated:** October 30, 2025  
**Project:** IRIS Online Exam Platform  
**Repository:** https://github.com/iyedmarz/IRIS.git
