# 📚 Supabase Setup Guide - Task Management

Panduan lengkap setup Supabase untuk fitur Task Management.

---

## 0️⃣ Prerequisites

Pastikan sudah punya:

- ✅ Akun Supabase
- ✅ Project Supabase (sudah dibuat)
- ✅ Credentials (URL, anon key, service role key)

---

## 1️⃣ Membuat Project Supabase

### Step 1: Login ke Supabase

1. Kunjungi [https://supabase.com](https://supabase.com)
2. Click **"Sign in"** atau **"Sign up"** jika belum punya akun
3. Gunakan GitHub atau email

### Step 2: Buat Project Baru

1. Dashboard → Click **"New Project"**
2. **Database Password**: Catat password ini (penting untuk koneksi)
3. **Region**: Pilih yang terdekat (misal: Singapore untuk ASEAN)
4. Tunggu project dibuat (~5 menit)

### Step 3: Dapatkan Credentials

1. Buka **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (JANGAN expose!)

---

## 2️⃣ Setup Tabel Database

### ✨ Method A: Gunakan Migration (Recommended)

Migration otomatis setup schema + RLS policies. Perfect untuk production & team collaboration.

#### Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Linux / Windows (WSL)
brew install supabase/tap/supabase
# atau lihat: https://github.com/supabase/cli#install-the-cli
```

#### Step 2: Link Project

```bash
cd project-folder

supabase link --project-ref YOUR_PROJECT_REF
# Masukkan password database saat diminta

# Find YOUR_PROJECT_REF di:
# Supabase Dashboard → Settings → API → Project Reference
```

#### Step 3: Push Migrations

```bash
# Lihat migrations yang akan dijalankan
supabase db push --dry-run

# Push ke remote
supabase db push

# Tunggu sampai selesai ✅
```

#### Step 4: Verify

Buka Supabase Dashboard → Check bahwa tables sudah ada:

- ✅ `users` table
- ✅ `projects` table
- ✅ `tasks` table
- ✅ RLS policies aktif

---

### 📝 Method B: Manual SQL Script (Alternatif)

Untuk yang prefer langsung copy-paste SQL tanpa CLI.

#### Step 1: Buka SQL Editor

Supabase Dashboard → SQL Editor → New Query

#### Step 2: Copy SQL Script Lengkap

```sql
-- ============================================
-- CREATE USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk faster lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- CREATE PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT projects_name_unique_per_user UNIQUE(name, created_by)
);

-- Index untuk soft delete queries
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);

-- ============================================
-- CREATE TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Task Info
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Relations
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Assignments
  requester VARCHAR(255),
  pic VARCHAR(255),

  -- Status & Type
  status VARCHAR(50) NOT NULL DEFAULT 'To Do'
    CHECK (status IN ('To Do', 'In Progress', 'Review', 'Done', 'Cancelled')),
  type VARCHAR(50) NOT NULL DEFAULT 'Working'
    CHECK (type IN ('Working', 'Learning', 'Other')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes untuk query efficiency
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
CREATE INDEX IF NOT EXISTS idx_tasks_title ON tasks USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
```

#### Step 3: Run Script

1. Copy semua SQL di atas
2. Buka **SQL Editor** → **New Query**
3. Paste code
4. Click **Run** (atau Ctrl+Enter)
5. Tunggu sampai selesai (✅ success)

#### Step 4: Setup RLS Policies

Lanjut ke section "**3️⃣ Row Level Security Policies**" untuk setup keamanan data.

---

## 3️⃣ Row Level Security (RLS) Policies

**IMPORTANT:** RLS mencegah user akses data yang bukan milik mereka.

⚠️ **Jika pakai Migration:** RLS sudah otomatis setup di migration file `20260106035406_add_rls_policies.sql`

⚠️ **Jika pakai Manual SQL:** Copy-paste policies di bawah ke SQL Editor

### 🔒 Users Table Policy

```sql
-- Users bisa melihat data mereka sendiri
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users bisa update data mereka sendiri
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);
```

### 🔒 Projects Table Policy

```sql
-- Users bisa melihat project yang mereka buat
CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR deleted_at IS NULL
  );

-- Users bisa create project
CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Users bisa update project mereka sendiri
CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  USING (created_by = auth.uid());
```

### 🔒 Tasks Table Policy (PENTING!)

```sql
-- ========================================
-- SELECT: Users melihat task yang relevan
-- ========================================
CREATE POLICY "Users can view tasks they created or are assigned to"
  ON tasks
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR requester = auth.email()
    OR pic = auth.email()
    OR deleted_at IS NULL
  );

-- ========================================
-- INSERT: Users bisa create task
-- ========================================
CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- ========================================
-- UPDATE: Users bisa update task mereka
-- ========================================
CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  USING (created_by = auth.uid());

-- ========================================
-- DELETE: Soft delete via RLS trigger (optional)
-- ========================================
-- DELETE policy bisa di-skip, gunakan soft delete via UPDATE
```

---

## 4️⃣ Setup Supabase Authentication

### Enable Email Auth

1. **Authentication** → **Providers**
2. Cari **Email**
3. Click toggle untuk enable
4. **Save** config

### Email Template (Optional)

Customize email template di:

- **Authentication** → **Email Templates**
- Bisa customize welcome email, reset password, dll

---

## 5️⃣ Testing di Supabase Console

### Test 1: Insert User

```sql
INSERT INTO users (email)
VALUES ('test@example.com')
RETURNING id, email, created_at;
```

### Test 2: Insert Project

```sql
INSERT INTO projects (name, created_by)
VALUES (
  'My First Project',
  (SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1)
)
RETURNING id, name, created_by;
```

### Test 3: Insert Task

```sql
INSERT INTO tasks (
  title,
  description,
  project_id,
  requester,
  pic,
  status,
  type,
  created_by
)
VALUES (
  'Complete API Integration',
  'Integrate Supabase client for task management',
  (SELECT id FROM projects WHERE name = 'My First Project' LIMIT 1),
  'John Doe',
  'Jane Smith',
  'In Progress',
  'Working',
  (SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1)
)
RETURNING id, title, status, created_at;
```

### Test 4: Query Tasks dengan Filter

```sql
-- Get tasks dengan filter
SELECT
  id,
  title,
  status,
  type,
  requester,
  pic,
  created_at
FROM tasks
WHERE
  deleted_at IS NULL
  AND title ILIKE '%API%'
  AND status = 'In Progress'
  AND type = 'Working'
ORDER BY created_at DESC
LIMIT 50;
```

---

## 6️⃣ Setup Environment Variables

Buat file `.env.local` di root project:

```env
# Dari Supabase Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ PENTING:**

- `.env.local` = JANGAN commit ke git (sudah di `.gitignore`)
- `.env.example` = Template untuk team
- Variable `NEXT_PUBLIC_*` = Aman di client (public)
- Variable tanpa prefix = Server-only (aman)

---

## 7️⃣ Koneksi dari Frontend (Next.js)

### Imports

```typescript
import { supabase } from '@/lib/supabase-client';
```

### Contoh: Fetch Tasks

```typescript
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .is('deleted_at', null)
  .ilike('title', '%your-search%')
  .eq('status', 'In Progress')
  .order('created_at', { ascending: false });

if (error) console.error('Error:', error);
else console.log('Tasks:', data);
```

### Contoh: Insert Task

```typescript
const { data, error } = await supabase
  .from('tasks')
  .insert([
    {
      title: 'New Task',
      description: 'Task description',
      status: 'To Do',
      type: 'Working',
      created_by: user.id,
      created_at: new Date().toISOString(),
    },
  ])
  .select()
  .single();
```

---

## 8️⃣ Debugging Tips

### Debug 1: Check RLS Policies

1. **Authentication** → **Policies**
2. Lihat policies yang sudah dibuat
3. Test dengan user yang berbeda

### Debug 2: Enable Query Inspector

```typescript
// Di Supabase client
const { data, error } = await supabase.from('tasks').select('*');

console.log('Query:', error); // Lihat error detail
```

### Debug 3: Check User Session

```typescript
const { data } = await supabase.auth.getSession();
console.log('Current user:', data.session?.user);
```

---

## 9️⃣ Best Practices

✅ **DO:**

- Gunakan parameterized queries (Supabase SDK handle ini)
- Always validate input di client & server
- Use RLS untuk security
- Index kolom yang sering di-filter
- Soft delete (set `deleted_at` instead of DELETE)
- Monitor query performance di Supabase dashboard

❌ **DON'T:**

- Expose `SUPABASE_SERVICE_ROLE_KEY` ke client
- Skip validation
- Disable RLS di production
- Store sensitive data di public tables tanpa RLS
- Use SELECT \* di production (specify columns)

---

## 🔟 Troubleshooting

| Problem                    | Solution                                        |
| -------------------------- | ----------------------------------------------- |
| "Unauthorized" saat insert | Check RLS policies, pastikan user authenticated |
| Query return 0 rows        | Check `deleted_at` filter, mungkin soft-deleted |
| Slow queries               | Add indexes, check query di Supabase dashboard  |
| CORS error                 | Check NEXT_PUBLIC_SUPABASE_URL format           |
| Auth error                 | Verify credentials di `.env.local`              |

---

## 📞 Resources

- **Supabase Docs**: https://supabase.com/docs
- **JavaScript Client**: https://supabase.com/docs/reference/javascript/introduction
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Database Best Practices**: https://supabase.com/docs/guides/database/best-practices

---

**Selesai! 🎉 Supabase sudah siap digunakan untuk Task Management.**
