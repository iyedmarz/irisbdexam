# pgAdmin 4 Connection Guide - IRIS Exam Platform

> **Note:** This file was manually edited by the user. Please update with your custom content.

## Quick Connection Steps

1. **Open pgAdmin 4**
2. **Right-click Servers** → Create → Server
3. **Enter connection details:**
   - Name: IRIS Exam Database
   - Host: localhost
   - Port: 5432
   - Database: iris_exam_db
   - Username: postgres
   - Password: [your password]

## Get Your Credentials

Check your `.env.local` file for:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/iris_exam_db"
```

## Troubleshooting

- Ensure PostgreSQL is running
- Verify credentials match your `.env.local`
- Check firewall settings

---

*This file has been moved to /docs/ for better organization.*
