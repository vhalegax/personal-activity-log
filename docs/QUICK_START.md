# 🚀 Quick Start - Daily Worklog

Setup lengkap dalam 10 menit.

---

## Step 1: Install Dependencies

```bash
bun install
```

---

## Step 2: Setup Environment Variables

```bash
# 1. Copy template
cp .env.example .env.local

# 2. Isi dengan credentials Supabase:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
# SUPABASE_SERVICE_ROLE_KEY=xxxxx  ← PENTING untuk API!
```

---

## Step 3: Setup Database & Auth

### Option A: Database Migration (Recommended) ✨

```bash
# 1. Install Supabase CLI
brew install supabase/tap/supabase

# 2. Link ke project
supabase link --project-ref YOUR_PROJECT_REF

# 3. Push migrations
supabase db push
```

### Option B: Manual SQL Script

Buka [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) → bagian manual setup

---

## Step 4: Enable Email Auth

1. Buka Supabase Dashboard
2. Go to **Authentication** → **Providers**
3. Enable **Email** provider
4. Click **Save**

---

## Step 5: Start Dev Server

```bash
bun dev
```

Buka browser: http://localhost:3000

---

## Step 6: Test Auth Flow

### 1. Create Account
- Go to: http://localhost:3000/signup
- Fill: email & password
- Click "Sign Up"

### 2. Sign In
- Go to: http://localhost:3000/login
- Use credentials dari signup
- Click "Sign In"

### 3. Create Task
- Fill task form
- Click "Create Task"
- Should success dengan your user ID!

### 4. Sign Out
- Click "Sign Out" di header
- Back to login

---

## ✅ Full Checklist

- [ ] Dependencies installed (`bun install`)
- [ ] `.env.local` filled dengan Supabase credentials
- [ ] Database migrations pushed (`supabase db push`)
- [ ] Email Auth enabled di Supabase dashboard
- [ ] Dev server running (`bun dev`)
- [ ] Can sign up: http://localhost:3000/signup
- [ ] Can sign in: http://localhost:3000/login
- [ ] Can create task logged in
- [ ] Can see your email di header

---

## 📁 Key Pages

| Page | Purpose | Auth Required |
|------|---------|---------------|
| / | Main app / task list | ✅ Yes |
| /login | Sign in | ❌ No |
| /signup | Create account | ❌ No |
| /tasks | View tasks | ✅ Yes |
| /reports | View reports | ✅ Yes |

---

## 📚 Dokumentasi Lengkap

- **Auth Setup:** [AUTH_SETUP_GUIDE.md](./AUTH_SETUP_GUIDE.md)
- **Database:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

# 2. Link ke project Supabase kamu
supabase link --project-ref YOUR_PROJECT_REF

# 3. Push migrations
supabase db push

# 4. Tunggu selesai ✅
```

### Option B: Manual SQL Script

Buka **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** → bagian "Setup Tabel Database" → copy-paste SQL ke SQL Editor

---

## Step 4: Gunakan Components

### Create Task Form:

```tsx
import { CreateTaskForm } from '@/components/CreateTaskForm';

<CreateTaskForm
  projects={projects}
  onSuccess={() => {
    // Refresh task list atau action lain
  }}
/>;
```

### Tasks List with Filters:

```tsx
import { TasksList } from '@/components/TasksList';

<TasksList projects={projects} refreshTrigger={refreshTrigger} />;
```

---

## Step 5: Test

```bash
# 1. Start dev server
bun dev

# 2. Buka browser
# http://localhost:3000

# 3. Test create task
# 4. Test filters (search, status, type, project, requester, pic)
```

---

## 📁 File Locations

| File                                                                   | Purpose               |
| ---------------------------------------------------------------------- | --------------------- |
| [src/lib/supabase-client.ts](src/lib/supabase-client.ts)               | Supabase client setup |
| [src/schemas/task-schema.ts](src/schemas/task-schema.ts)               | Validation schemas    |
| [src/hooks/use-create-task.ts](src/hooks/use-create-task.ts)           | Create task hook      |
| [src/hooks/use-fetch-tasks.ts](src/hooks/use-fetch-tasks.ts)           | Fetch tasks hook      |
| [src/components/CreateTaskForm.tsx](src/components/CreateTaskForm.tsx) | Create form component |
| [src/components/TasksList.tsx](src/components/TasksList.tsx)           | List component        |
| [src/app/api/tasks/route.ts](src/app/api/tasks/route.ts)               | API endpoints         |
| [.env.example](.env.example)                                           | Environment template  |

---

## 🔍 API Endpoints

### Get Tasks (with filters)

```bash
GET /api/tasks?search=title&status=In%20Progress&limit=50
```

### Create Task

```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "New Task",
  "status": "To Do",
  "type": "Working"
}
```

---

## 📝 Dokumentasi Lengkap

Lihat: **[TASK_MANAGEMENT_GUIDE.md](./TASK_MANAGEMENT_GUIDE.md)**

---

**Siap! Mulai buat tasks 🎉**
