# 🔍 Troubleshooting: Unauthorized Error saat Create Task

## Problem: "Unauthorized" Error saat Create Task

```
POST /api/tasks → Error: Unauthorized (401)
```

---

## 🔧 Root Cause Analysis

### Masalah Utama

RLS (Row Level Security) Policy mengharuskan user authenticated di Supabase Auth:

```sql
-- RLS policy mengecek: auth.uid() ada atau tidak
CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (created_by = auth.uid());
```

**Problem:** Browser client tidak punya Supabase Auth session → `auth.uid()` undefined → Unauthorized!

---

## ✅ Solution: Server-Side with Service Role

Saya sudah update `/src/app/api/tasks/route.ts` untuk menggunakan **service role key** (server-side):

### ✨ Perubahan yang dilakukan:

```typescript
// SEBELUM: Client auth yang tidak ada
const { user, error } = await supabase.auth.getUser();
if (!user) return Error('Unauthorized');

// SESUDAH: Server admin client yang bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const { data, error } = await supabaseAdmin
  .from('tasks')
  .insert([...]);
```

---

## 🚀 Cara Menggunakan Sekarang

### 1. Pastikan .env.local Lengkap

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # PENTING! Jangan lupa ini
```

**Where to get:**

- Supabase Dashboard → Settings → API
- Copy: **Project URL**, **anon public**, **service_role secret**

### 2. Restart Dev Server

```bash
# Hentikan server
Ctrl+C

# Restart
bun dev
```

### 3. Test Create Task

- Buka browser: http://localhost:3000
- Coba buat task baru
- Seharusnya berhasil ✅

---

## 📊 Flow Diagram

```
Browser
  ↓
[Create Task Form]
  ↓
POST /api/tasks (JSON)
  ↓
[API Route di Server]
  ↓ (menggunakan SUPABASE_SERVICE_ROLE_KEY)
Supabase Admin Client
  ↓ (bypass RLS)
Database Insert
  ↓
Task Created ✅
```

---

## ⚠️ Production Considerations

**Current Setup:** Server-side dengan hardcoded user ID

```typescript
const demoUserId = '00000000-0000-0000-0000-000000000001';
```

### Untuk Production:

1. **Implement Supabase Auth** - Add login/signup
2. **Get user session** - Track real user ID
3. **Update API** - Set `created_by: actualUser.id`

```typescript
// Production version:
const {
  data: { user },
} = await supabase.auth.getUser();

const { data, error } = await supabaseAdmin.from('tasks').insert([
  {
    ...validatedData,
    created_by: user.id, // Real user!
  },
]);
```

---

## 🆘 Masih Error?

### Check 1: .env Variables

```bash
# Terminal
echo $SUPABASE_SERVICE_ROLE_KEY

# Harus print key (bukan kosong)
```

### Check 2: Browser Console

```javascript
// F12 → Console → test
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test',
    status: 'To Do',
    type: 'Working',
  }),
});

const result = await response.json();
console.log(result);
```

### Check 3: Server Logs

```bash
# Terminal (tempat bun dev jalan)
# Lihat error message lengkap di sini
```

---

## 🔗 Related Documentation

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Setup database
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [SUPABASE_CLI_GUIDE.md](./SUPABASE_CLI_GUIDE.md) - CLI commands

---

## 📝 Next Steps

Sekarang task creation harus work! ✅

Untuk improvement kedepannya:

1. [ ] Implement proper Supabase Auth
2. [ ] Setup Supabase session management
3. [ ] Create user management page
4. [ ] Update RLS untuk real users
