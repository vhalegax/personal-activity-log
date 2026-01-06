# 🎯 Task Management - Implementation Checklist

Checklist lengkap untuk setup dan testing Task Management.

---

## Phase 1: ✅ Code Implementation (COMPLETED)

- [x] Install `@supabase/supabase-js`
- [x] Create `src/lib/supabase-client.ts`
- [x] Create `src/schemas/task-schema.ts`
- [x] Create `src/hooks/use-create-task.ts`
- [x] Create `src/hooks/use-fetch-tasks.ts`
- [x] Create `src/components/CreateTaskForm.tsx`
- [x] Create `src/components/TasksList.tsx`
- [x] Update `src/app/api/tasks/route.ts`
- [x] Create `.env.example`

---

## Phase 2: 🔧 Supabase Setup (TO DO)

### Create Supabase Project

- [ ] Go to https://supabase.com
- [ ] Sign up / Login
- [ ] Create new project
- [ ] Wait for project initialization (~5 minutes)
- [ ] Go to Settings → API
- [ ] Copy and save:
  - [ ] Project URL
  - [ ] anon public key
  - [ ] service_role secret

### Setup Database

- [ ] Go to SQL Editor
- [ ] Create new query
- [ ] Copy SQL script dari [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- [ ] Run the script
- [ ] Verify tables created:
  - [ ] users table
  - [ ] projects table
  - [ ] tasks table

### Setup Row Level Security

- [ ] Go to Authentication → Policies
- [ ] Create RLS policies untuk:
  - [ ] users table
  - [ ] projects table
  - [ ] tasks table
- [ ] Test policies

### Enable Authentication

- [ ] Go to Authentication → Providers
- [ ] Enable Email provider
- [ ] (Optional) Customize email templates

---

## Phase 3: 🔑 Environment Configuration (TO DO)

- [ ] Copy `.env.example` to `.env.local`

  ```bash
  cp .env.example .env.local
  ```

- [ ] Edit `.env.local` dengan credentials:

  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```

- [ ] Verify `.env.local` in `.gitignore`
- [ ] Restart dev server

---

## Phase 4: 🧪 Local Testing (TO DO)

### Start Dev Server

- [ ] Run `bun dev` (or your package manager)
- [ ] Open http://localhost:3000
- [ ] Check console for errors

### Test Create Task Form

- [ ] Navigate to task creation page
- [ ] **Test 1: Valid submission**
  - [ ] Fill all required fields
  - [ ] Submit form
  - [ ] Should see success message
  - [ ] Should see task in Supabase dashboard

- [ ] **Test 2: Validation errors**
  - [ ] Leave title empty
  - [ ] Submit → should show error
  - [ ] Title < 3 chars → should show error
  - [ ] Title > 255 chars → should show error
  - [ ] Invalid project UUID → should show error

- [ ] **Test 3: Optional fields**
  - [ ] Create task with only title & status
  - [ ] Should success
  - [ ] Other fields should be null/empty

- [ ] **Test 4: Loading state**
  - [ ] Submit form
  - [ ] Button should show loading spinner
  - [ ] Form should be disabled
  - [ ] After success → button back to normal

- [ ] **Test 5: Error handling**
  - [ ] Disconnect internet
  - [ ] Try to create task
  - [ ] Should show error message
  - [ ] Reconnect internet
  - [ ] Try again → should work

### Test View All Tasks

- [ ] Navigate to task list page
- [ ] Should see all tasks from Supabase
- [ ] Check count matches

### Test Filters

- [ ] **Filter 1: Search by title**
  - [ ] Enter search text
  - [ ] Tasks should filter by title (case-insensitive)
  - [ ] Partial matches should work
  - [ ] Clear search → all tasks back

- [ ] **Filter 2: Filter by status**
  - [ ] Select status "To Do"
  - [ ] Only "To Do" tasks shown
  - [ ] Select "In Progress" → only those tasks
  - [ ] Select "All Statuses" → all tasks back

- [ ] **Filter 3: Filter by type**
  - [ ] Select type "Working"
  - [ ] Only "Working" tasks shown
  - [ ] Try "Learning", "Other"
  - [ ] Select all → all tasks back

- [ ] **Filter 4: Filter by project**
  - [ ] Select a project
  - [ ] Only tasks dari project shown
  - [ ] Select other projects
  - [ ] Select "All Projects" → all back

- [ ] **Filter 5: Filter by requester**
  - [ ] Enter requester name
  - [ ] Tasks filtered by requester
  - [ ] Partial match works

- [ ] **Filter 6: Filter by PIC**
  - [ ] Enter PIC name
  - [ ] Tasks filtered by PIC
  - [ ] Partial match works

- [ ] **Filter 7: Combine filters**
  - [ ] Search "payment" + status "In Progress" + type "Working"
  - [ ] Only matching tasks shown
  - [ ] Add more filters
  - [ ] All filters work together (AND logic)

- [ ] **Filter 8: Clear all**
  - [ ] Apply multiple filters
  - [ ] Click "Clear All" button
  - [ ] All filters reset
  - [ ] All tasks shown

### Test Pagination

- [ ] Create 100+ tasks
- [ ] Load tasks → default 50 items
- [ ] Change limit parameter
- [ ] Tasks should paginate correctly

### Test Empty States

- [ ] Apply filter yang tidak ada match
- [ ] Should show "No tasks found" message
- [ ] Should suggest to adjust filters

### Test Error Handling

- [ ] Disconnect internet
- [ ] Try to fetch tasks
- [ ] Should show error message
- [ ] Reconnect
- [ ] Try again → should work

### Test Loading States

- [ ] Load tasks
- [ ] Should show loading spinner
- [ ] After data loaded → spinner gone

---

## Phase 5: 🔐 Security Testing (TO DO)

### RLS Policies Test

- [ ] Create 2 test accounts
- [ ] Account 1: Create task A
- [ ] Account 1: Login & create task B
- [ ] Account 2: Login
- [ ] Account 2: Can NOT see Account 1's tasks
- [ ] Account 2: Create task C
- [ ] Account 1: Can NOT see Account 2's task C

### Public vs Private Keys

- [ ] Verify `.env.local` NOT in git
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` NOT in client code
- [ ] Check browser console
- [ ] Should NOT see service role key
- [ ] Should ONLY see anon key

---

## Phase 6: 🚀 Deployment (TO DO)

### Pre-deployment Checklist

- [ ] All tests passed locally
- [ ] No console errors
- [ ] `.env.local` not committed
- [ ] `.env.example` is up-to-date
- [ ] Database RLS enabled in production
- [ ] Verify Supabase project is production-ready

### Deploy to Production

- [ ] Add environment variables to hosting platform
- [ ] Deploy code
- [ ] Test on production URL
- [ ] Monitor for errors
- [ ] Check Supabase dashboard for API calls

---

## Phase 7: 📚 Documentation (TO DO)

- [ ] Share setup guide with team
- [ ] Share quick start guide
- [ ] Document any custom modifications
- [ ] Create team onboarding guide

---

## 🐛 Troubleshooting Checklist

### If tasks not appearing

- [ ] Check environment variables
- [ ] Verify Supabase URL & key
- [ ] Check Supabase dashboard → tasks table
- [ ] Verify RLS policies not blocking

### If create fails

- [ ] Check validation errors
- [ ] Verify user is authenticated
- [ ] Check network tab in browser
- [ ] See Supabase logs

### If filters not working

- [ ] Check API query parameters
- [ ] Verify field names in database
- [ ] Check browser console for errors

### If RLS blocking access

- [ ] Review RLS policies
- [ ] Check user email/id
- [ ] Test simple policy first
- [ ] Verify auth.uid() working

---

## 📊 Testing Coverage

| Component      | Coverage                        |
| -------------- | ------------------------------- |
| CreateTaskForm | UI, validation, API, errors     |
| TasksList      | UI, filters, pagination, errors |
| API Routes     | GET, POST, validation, errors   |
| Hooks          | Loading, error, success states  |
| Validation     | All field types, edge cases     |
| Error Handling | Network, validation, auth       |
| Security       | RLS, key protection, auth       |

---

## ✅ Sign-off

- [ ] All code reviewed
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Team trained
- [ ] Ready for production

---

**Status: Ready to Implement** ✨

Next step: Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to configure Supabase!
