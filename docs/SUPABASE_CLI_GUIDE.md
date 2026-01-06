# 🚀 Supabase CLI & Migration Guide

Panduan lengkap menggunakan Supabase CLI untuk database management.

---

## 📦 Installation

### macOS (Recommended)

```bash
brew install supabase/tap/supabase
```

### Linux / Windows (WSL)

```bash
# Cek: https://github.com/supabase/cli#install-the-cli

# Contoh untuk Ubuntu:
sudo snap install supabase
```

### Verify Installation

```bash
supabase --version
# Output: supabase-cli 2.67.1 (atau versi terbaru)
```

---

## 🔧 Setup Project

### Step 1: Initialize Project

```bash
cd /path/to/project
supabase init
```

Ini akan create struktur folder:

```
supabase/
├── migrations/      # SQL migration files
├── config.toml      # Configuration
└── .gitignore
```

### Step 2: Link ke Remote Project

Get Project Reference dari Supabase Dashboard:

- Login ke https://app.supabase.com
- Select project
- Settings → API → Project Reference

```bash
supabase link --project-ref YOUR_PROJECT_REF

# Contoh:
# supabase link --project-ref abcdefghijklmnop

# Saat diminta, masukkan database password
```

### Step 3: Get Access Token (untuk CI/CD)

```bash
supabase projects create-access-token --name my-token

# Simpan token di environment variable:
# export SUPABASE_ACCESS_TOKEN=xxx
```

---

## 📝 Creating & Running Migrations

### Create New Migration

```bash
supabase migration new create_tables

# Akan create file: supabase/migrations/20260106035352_create_tables.sql
```

### Edit Migration File

```bash
# File sudah auto-created, tinggal edit di:
# supabase/migrations/20260106035352_create_tables.sql

# Add SQL statements sesuai kebutuhan
```

### Check Pending Migrations

```bash
supabase db push --dry-run

# Akan show apa yang akan dijalankan:
# ✓ Migration 20260106035352_create_tables.sql
# ✓ Migration 20260106035406_add_rls_policies.sql
```

### Push Migrations ke Remote

```bash
supabase db push

# Output:
# Applying migrations...
# ✓ 20260106035352_create_tables.sql
# ✓ 20260106035406_add_rls_policies.sql
# Migrations successfully applied!
```

### Pull Remote Schema

```bash
# Untuk sync changes yang dilakukan di Supabase dashboard:
supabase db pull

# Ini akan auto-generate migration dari perubahan remote
```

---

## 📊 Database Status

### Check Migrations Applied

```bash
supabase migration list

# Output:
# Migrations:
# ✓ 20260106035352_create_tables           (applied)
# ✓ 20260106035406_add_rls_policies        (applied)
```

### Check Local vs Remote Diff

```bash
supabase db push --dry-run

# Akan show differences jika ada
```

---

## 🔄 Workflow: Development → Production

### Local Development

```bash
# 1. Create migration
supabase migration new add_new_column

# 2. Edit migration file
# supabase/migrations/xxx_add_new_column.sql

# 3. Test locally (optional)
supabase start  # Start local Postgres

# 4. Push ke remote development/staging project
supabase link --project-ref DEV_PROJECT_REF
supabase db push
```

### Production Deployment

```bash
# 1. Link ke production project
supabase link --project-ref PROD_PROJECT_REF

# 2. Check apa yang akan di-push
supabase db push --dry-run

# 3. Push migrations
supabase db push

# 4. Verify
supabase migration list
```

---

## 🚨 Common Issues & Solutions

### Issue: "Database is already running"

```bash
# Solution: Stop existing instance
supabase stop

# Then try again:
supabase db push
```

### Issue: "Password authentication failed"

```bash
# Solution: Re-link dengan password yang benar
supabase unlink
supabase link --project-ref YOUR_PROJECT_REF
```

### Issue: "Migration already exists"

```bash
# Jangan create migration baru untuk changes yang sama
# Edit file migration yang sudah ada, atau:

# Reset local state:
supabase db reset
```

### Issue: Remote & Local Out of Sync

```bash
# Pull schema dari remote:
supabase db pull

# Ini auto-generate migration dari perubahan
# Cek hasilnya, edit jika perlu, terus push:
supabase db push
```

---

## 🔐 Best Practices

### ✅ DO:

- ✅ Selalu create migration untuk schema changes
- ✅ Test migration locally sebelum production
- ✅ Commit migration files ke git
- ✅ Use descriptive migration names
- ✅ Keep migrations small & focused
- ✅ Review `--dry-run` sebelum push

### ❌ DON'T:

- ❌ Edit migration files setelah di-push
- ❌ Drop tables tanpa backup
- ❌ Modify data di production without backup
- ❌ Create manual tables di dashboard (use migrations instead)

---

## 📚 Useful Commands

```bash
# Initialize new project
supabase init

# Link to remote project
supabase link --project-ref YOUR_REF

# Create migration
supabase migration new {name}

# Check pending changes
supabase db push --dry-run

# Push to remote
supabase db push

# Pull remote schema
supabase db pull

# List all migrations
supabase migration list

# Start local Postgres
supabase start

# Stop local Postgres
supabase stop

# Reset local database
supabase db reset

# Status/Health check
supabase status
```

---

## 📖 Resources

- Official Docs: https://supabase.com/docs/guides/cli
- GitHub: https://github.com/supabase/cli
- Issues: https://github.com/supabase/cli/issues
