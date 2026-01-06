# ⚡ Quick Reference - Supabase Migration

**TL;DR version untuk production workflow**

---

## 🚀 First Time Setup

```bash
# 1. Install CLI
brew install supabase/tap/supabase

# 2. Initialize project (sudah done)
supabase init

# 3. Link ke project
supabase link --project-ref YOUR_PROJECT_REF

# 4. Push existing migrations
supabase db push
```

---

## 📝 Development Workflow

### Create New Migration

```bash
supabase migration new feature_name

# Edit file: supabase/migrations/xxx_feature_name.sql
# Add SQL statements
```

### Test & Push

```bash
# Check what will be applied
supabase db push --dry-run

# Apply to remote
supabase db push

# Verify
supabase migration list
```

---

## 🔄 Sync with Team

```bash
# Pull latest changes from remote
supabase db pull

# This auto-generates migration if needed
# Review the file, then push:
supabase db push
```

---

## ⚠️ Troubleshooting

| Problem                          | Solution                                           |
| -------------------------------- | -------------------------------------------------- |
| "Password authentication failed" | `supabase unlink` → re-link dengan password benar  |
| "Database is already running"    | `supabase stop` → retry                            |
| Need to undo changes             | Manual: delete migration file + `supabase db push` |
| Remote & local out of sync       | `supabase db pull` → review generated migration    |

---

## 📁 Structure

```
supabase/
├── migrations/
│   ├── 20260106035352_create_tables.sql
│   └── 20260106035406_add_rls_policies.sql
├── config.toml
└── .gitignore
```

**Always commit migration files to git!** ✅

---

## 🔗 Links

- [Full Guide](./SUPABASE_CLI_GUIDE.md)
- [Setup Instructions](./SUPABASE_SETUP.md)
- [Quick Start](./QUICK_START.md)
