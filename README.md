# IRIS Online Exam Platform

A comprehensive web-based examination system for higher education institutions built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, and **shadcn/ui**.

## ✨ Features

### For Teachers
- ✅ Create multiple-choice exams with unlimited questions
- ✅ Assign exams to specific students
- ✅ View real-time exam statistics and completion rates
- ✅ Automatic grading of MCQ answers
- ✅ Export results to CSV/PDF
- ✅ Comprehensive dashboard with analytics

### For Students
- ✅ Take assigned exams with timer
- ✅ Auto-save progress during exam
- ✅ Resume interrupted exams
- ✅ View scores and results immediately
- ✅ Track exam history
- ✅ Clean, distraction-free exam interface

### Technical Features
- ✅ PostgreSQL database with connection pooling
- ✅ Secure password hashing with bcrypt
- ✅ RESTful API with Next.js API routes
- ✅ Real-time countdown timer
- ✅ Responsive design (desktop & mobile)
- ✅ Session management
- ✅ Data persistence and recovery

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

**1. Clone and Install**
```bash
npm install
```

**2. Setup Database**

Create database in PostgreSQL (pgAdmin4 or CLI):
```sql
CREATE DATABASE iris_exam_db;
```

Run the schema from `/migrations/001_initial_schema.sql` in pgAdmin4 or:
```bash
psql iris_exam_db < migrations/001_initial_schema.sql
```

**3. Configure Environment**

Create `.env.local`:
```bash
cp .env.local.template .env.local
```

Edit `.env.local` with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/iris_exam_db"
```

**4. Seed Database**

Hash the default user passwords:
```bash
npm run db:seed
```

**5. Run Application**
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🔐 Default Login Credentials

| Username | Password | Role |
|----------|----------|------|
| teacher | teacher123 | Teacher |
| student | student123 | Student |
| student2 | student123 | Student |

---

## 📁 Project Structure

```
├── app/
│   ├── api/              # Next.js API routes (backend)
│   │   ├── auth/         # Authentication endpoints
│   │   ├── exams/        # Exam CRUD operations
│   │   ├── submissions/  # Exam submissions
│   │   ├── attempts/     # Active exam sessions
│   │   └── users/        # User management
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main entry point
│
├── components/           # React components
│   ├── LoginPage.tsx
│   ├── TeacherDashboard.tsx
│   ├── StudentDashboard.tsx
│   ├── CreateExam.tsx
│   ├── ExamTaking.tsx
│   └── ui/               # shadcn/ui components
│
├── lib/
│   ├── api-client.ts     # Client-side API wrapper
│   ├── db-storage.ts     # Server-side database operations
│   ├── db.ts             # PostgreSQL connection pool
│   ├── queries.ts        # SQL queries
│   └── export.ts         # Export utilities
│
├── migrations/
│   └── 001_initial_schema.sql  # Database schema
│
├── scripts/
│   ├── hash-passwords.ts       # Password hashing utility
│   ├── test-connection.ts      # DB connection test
│   └── migrate.ts              # Migration runner
│
├── docs/                 # Documentation (organized)
│   ├── DATABASE_ARCHITECTURE.md
│   ├── GIT_PUSH_GUIDE.md
│   ├── PGADMIN_CONNECTION_GUIDE.md
│   └── PROJECT_STRUCTURE.md
│
└── types/
    └── index.ts          # TypeScript type definitions
```

> **📖 See [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) for detailed architecture and file organization.**

---

## 🏗️ Architecture

### Client-Server Flow

```
┌─────────────────────────────────────────┐
│  Browser (Client)                       │
│  - React Components                     │
│  - Uses lib/api-client.ts              │
└──────────────┬──────────────────────────┘
               │
               │ HTTP Requests (fetch)
               │
┌──────────────▼──────────────────────────┐
│  Next.js API Routes (Server)            │
│  - /app/api/**/*.ts                     │
│  - Uses lib/db-storage.ts              │
└──────────────┬──────────────────────────┘
               │
               │ SQL Queries (pg)
               │
┌──────────────▼──────────────────────────┐
│  PostgreSQL Database                    │
│  - users, exams, questions              │
│  - submissions, attempts                │
└─────────────────────────────────────────┘
```

### Key Design Decisions

**Why Next.js API Routes?**
- Single deployment (frontend + backend)
- Built-in TypeScript support
- Easy to develop and maintain
- Production-ready with Vercel/Netlify

**Why PostgreSQL?**
- ACID compliance for exam data
- Complex queries for statistics
- Relational data (users, exams, submissions)
- Production-grade reliability

**Why Client-Server Separation?**
- Security: Database credentials never exposed to browser
- Performance: Smaller client bundle
- Scalability: Easy to add authentication, rate limiting

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server (port 3000)
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:test          # Test PostgreSQL connection
npm run db:seed          # Hash default user passwords
npm run db:migrate       # Run database migrations
```

---

## 📊 Database Schema

### Core Tables

**users** - Teachers and students
```sql
id, username, password, name, email, role, created_at
```

**exams** - Exam metadata
```sql
id, title, description, duration, created_by, created_at
```

**questions** - Exam questions
```sql
id, exam_id, question_text, question_type
```

**answer_options** - Multiple choice options
```sql
id, question_id, option_text, is_correct
```

**exam_submissions** - Completed exams
```sql
id, exam_id, student_id, score, total_questions, submitted_at
```

**exam_attempts** - Active exam sessions
```sql
id, exam_id, student_id, started_at, answers
```

See `DATABASE_ARCHITECTURE.md` for complete schema.

---

## 🧪 Testing

### Test Database Connection
```bash
npm run db:test
```

Expected output:
```
✅ Successfully connected to PostgreSQL!
📊 Tables found: users, exams, questions...
👥 Users in database: 3
```

### Manual Testing Checklist

**Teacher Flow:**
1. Login as teacher
2. Create new exam with 5 questions
3. Assign to students
4. View exam statistics
5. Export results

**Student Flow:**
1. Login as student
2. View assigned exams
3. Start exam (timer begins)
4. Answer questions
5. Submit and view results

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables:
  - `DATABASE_URL`: Your PostgreSQL connection string

3. **Database Options**
- [Supabase](https://supabase.com) - Free PostgreSQL (recommended)
- [Railway](https://railway.app) - Free tier available
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Heroku Postgres](https://www.heroku.com/postgres)

### Other Platforms

**Netlify:**
- Deploy via GitHub
- Add PostgreSQL via Supabase or external provider

**Railway:**
- Includes PostgreSQL built-in
- Deploy from GitHub
- Auto-setup DATABASE_URL

---

## 🔒 Security Considerations

### Current Implementation
✅ Passwords hashed with bcrypt  
✅ SQL injection prevention (parameterized queries)  
✅ Session storage (sessionStorage)  
✅ Database credentials server-side only  

### Production Recommendations
- [ ] Add JWT authentication
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Enable HTTPS only
- [ ] Add input validation middleware
- [ ] Implement audit logging
- [ ] Add role-based access control (RBAC)
- [ ] Set up database backups

⚠️ **Note:** This platform is designed for educational use. Do not store highly sensitive PII without additional security measures.

---

## 🐛 Troubleshooting

### "Connection refused" Error
**Problem:** PostgreSQL not running

**Solution:**
```bash
# Check PostgreSQL status
pg_isready

# Start PostgreSQL
# macOS: brew services start postgresql@14
# Linux: sudo systemctl start postgresql
# Windows: Services → PostgreSQL
```

### "Authentication failed" Error
**Problem:** Wrong DATABASE_URL credentials

**Solution:**
- Check username/password in pgAdmin4
- Update `.env.local`
- Restart dev server

### "Module not found: pg"
**Problem:** Dependencies not installed

**Solution:**
```bash
npm install
```

### "relation does not exist"
**Problem:** Database tables not created

**Solution:**
```bash
# Run schema SQL in pgAdmin4 or:
psql iris_exam_db < migrations/001_initial_schema.sql
npm run db:seed
```

---

## 📚 Documentation

- **[docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)** - Complete file organization and architecture
- **[docs/DATABASE_ARCHITECTURE.md](docs/DATABASE_ARCHITECTURE.md)** - Database schema and relationships
- **[docs/GIT_PUSH_GUIDE.md](docs/GIT_PUSH_GUIDE.md)** - Guide for pushing code to GitHub
- **[docs/PGADMIN_CONNECTION_GUIDE.md](docs/PGADMIN_CONNECTION_GUIDE.md)** - pgAdmin 4 connection setup

---

## 🤝 Contributing

This is an educational project. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Fork for your institution

---

## 📝 License

[Your License Here]

---

## 🎓 About

Built for **IRIS Higher Education Institutions** to provide a modern, secure, and user-friendly online examination platform.

**Technology Stack:**
- Next.js 15 (React + TypeScript)
- Tailwind CSS 4.0
- PostgreSQL 12+
- shadcn/ui Components
- Recharts for analytics
- bcrypt for password hashing

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review [docs/DATABASE_ARCHITECTURE.md](docs/DATABASE_ARCHITECTURE.md) for database details
3. See [docs/PGADMIN_CONNECTION_GUIDE.md](docs/PGADMIN_CONNECTION_GUIDE.md) for database connection help
4. Check [docs/GIT_PUSH_GUIDE.md](docs/GIT_PUSH_GUIDE.md) for version control instructions
5. Read [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) for architecture details

---

**Made with ❤️ for education**# irisbdexam
