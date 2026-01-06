# 🔐 Supabase Auth Setup & Configuration

Panduan lengkap setup Supabase Authentication untuk Daily Worklog.

---

## ✨ Fitur Auth yang Sudah Diimplementasikan

- ✅ Sign Up (Create Account)
- ✅ Sign In (Login)
- ✅ Sign Out (Logout)
- ✅ Session Management
- ✅ Auth Context (Global user state)
- ✅ Protected Routes (Auto redirect ke login)
- ✅ Real User Tracking (Task created_by = actual user ID)
- ✅ Field-Level Error Display

---

## 🚀 Setup Auth di Supabase Dashboard

### Step 1: Enable Email Auth

1. Login ke [https://app.supabase.com](https://app.supabase.com)
2. Pilih project mu
3. Navigate ke: **Authentication** → **Providers**
4. Click **Email** provider
5. Set ke "**Enabled**"
6. Klik **Save**

### Step 2: Configure Email Templates (Optional)

Settings → Email Templates:
- Confirm signup email
- Password reset email
- Magic link email

Default templates sudah OK, bisa diubah sesuai brand kamu.

### Step 3: Setup SMTP (Optional)

Untuk production, gunakan custom SMTP server.
Settings → Email → SMTP Settings

---

## 🔑 Environment Variables

File `.env.local` harus punya:

```bash
# Supabase URL & Keys
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Opsional:
NODE_ENV=development
```

**IMPORTANT:** 
- `NEXT_PUBLIC_*` = Safe untuk client (dibuka di browser)
- `SUPABASE_SERVICE_ROLE_KEY` = JANGAN expose! Server only!

---

## 📚 Architecture Overview

```
Browser
  ↓
[Login/Signup Page]
  ↓ (email + password)
Supabase Auth API
  ↓
[Session + Token]
  ↓ (stored di browser)
App State (AuthContext)
  ↓
Protected Pages (redirect jika belum login)
  ↓
API Routes (dengan Bearer token)
  ↓ (verify token → get user ID)
Database Queries (real user ID)
```

---

## 🎯 User Flow

### Sign Up
```
User Signup Page
  ↓
POST /auth/signup (Supabase)
  ↓
Confirmation Email sent
  ↓ (user click link atau auto confirm)
Account Created
  ↓
Redirect ke Login
```

### Sign In
```
User Login Page
  ↓
POST /auth/signin (Supabase)
  ↓
Session + Token Created
  ↓
Redirect ke /tasks (main app)
  ↓
AuthContext update (user logged in)
```

### Create Task
```
User Fill Form
  ↓
POST /api/tasks
  ↓ (include: Authorization: Bearer <token>)
API Verify Token
  ↓
Get User ID dari token
  ↓
Create Task (created_by = user ID)
  ↓
Success + Show field errors (jika ada)
```

---

## 📁 File Structure

```
src/
├── hooks/
│   └── use-auth.tsx              ← Auth context & hook
├── app/
│   ├── login/
│   │   └── page.tsx              ← Login page
│   ├── signup/
│   │   └── page.tsx              ← Signup page
│   ├── page.tsx                  ← Protected (home)
│   ├── layout.tsx                ← With AuthProvider wrapper
│   └── api/
│       └── tasks/
│           └── route.ts          ← With auth token verification
└── components/
    └── CreateTaskForm.tsx         ← With field-level errors
```

---

## 🔐 Security Features

### 1. Session Management
- Token disimpan di browser (secure HttpOnly cookies via Supabase)
- Auto refresh sebelum expire
- Auto logout jika session invalid

### 2. Token Verification
- API routes verify token sebelum akses database
- Token expire protection
- CORS handled oleh Supabase

### 3. User Isolation
- Task dibuat dengan real user ID
- User hanya bisa access own tasks (via RLS jika diaktifkan)
- Service role key hanya di server

---

## 🧪 Testing Auth Flow

### 1. Test Sign Up
```bash
# Browser: http://localhost:3000/signup
# 1. Enter email & password
# 2. Click "Sign Up"
# 3. Confirmation email (jika configured)
# 4. Redirect ke login
```

### 2. Test Sign In
```bash
# Browser: http://localhost:3000/login
# 1. Enter email & password dari signup
# 2. Click "Sign In"
# 3. Redirect ke / (tasks page)
# 4. Check: email show di header
```

### 3. Test Create Task
```bash
# 1. Di logged in state, fill task form
# 2. Click "Create Task"
# 3. Success → task created dengan user ID
# 4. Test field validation errors
```

### 4. Test Sign Out
```bash
# 1. Click "Sign Out" button di header
# 2. Redirect ke /login
# 3. Session cleared
```

---

## 🛠️ API Reference

### Sign Up
```typescript
const { error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign In
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### Get Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
// session.access_token untuk API calls
```

### Sign Out
```typescript
await supabase.auth.signOut();
```

### Get User (Server-side)
```typescript
const { data: { user } } = await supabase.auth.getUser(token);
// user.id untuk database queries
```

---

## 🚨 Common Issues & Solutions

### Issue: "Unauthorized" di login page
**Solution:** Pastikan Email provider enabled di Supabase Dashboard

### Issue: Token invalid/expired
**Solution:** Supabase auto refresh, tapi cek session:
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log(session); // Should have access_token
```

### Issue: User tidak ter-save di tasks
**Solution:** Check API route menerima token:
```typescript
const token = req.headers.get('authorization')?.replace('Bearer ', '');
```

### Issue: "Please fix the errors below" tanpa field errors
**Solution:** Check field name consistency antara frontend & API:
```typescript
// Frontend
title: "string"

// API validation harus: "title"
```

---

## 🔄 Next Steps

### Phase 1: Basic Auth (Done ✅)
- ✅ Sign up/in/out
- ✅ Session management
- ✅ Protected routes

### Phase 2: Enhanced Auth
- [ ] Email confirmation modal
- [ ] Password reset
- [ ] Email verification
- [ ] OAuth (Google, GitHub)

### Phase 3: User Management
- [ ] User profile page
- [ ] Change password
- [ ] Delete account
- [ ] User permissions

---

## 📖 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Session Management](https://supabase.com/docs/guides/auth/auth-helpers)
- [Custom Claims & RLS](https://supabase.com/docs/guides/auth/custom-claims)
