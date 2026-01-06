# 🚀 Quick Start - Task Management

Setup cepat dalam 5 menit.

---

## Step 1: Install Dependency

```bash
# Sudah terinstall saat setup project
bun add @supabase/supabase-js
```

---

## Step 2: Setup Environment Variables

```bash
# 1. Copy template
cp .env.example .env.local

# 2. Isi dengan credentials Supabase kamu
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
# SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

---

## Step 3: Setup Database di Supabase

Buka file: **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

Ada 2 cara setup:

### Option A: Gunakan Migration (Recommended) ✨

```bash
# 1. Install Supabase CLI (jika belum)
brew install supabase/tap/supabase

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
