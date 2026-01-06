# 🚀 Task Management Implementation Guide

Dokumentasi implementasi Task Management dengan Supabase integration.

---

## 📁 File Structure

```
src/
├── lib/
│   └── supabase-client.ts          # Supabase client setup
├── schemas/
│   └── task-schema.ts              # Zod validation schemas
├── hooks/
│   ├── use-create-task.ts          # Hook untuk create task
│   └── use-fetch-tasks.ts          # Hook untuk fetch + filter tasks
├── components/
│   ├── CreateTaskForm.tsx          # Form untuk create task
│   └── TasksList.tsx               # List tasks dengan filters
└── app/
    └── api/
        └── tasks/
            └── route.ts            # API endpoints (GET, POST)

.env.example                        # Template environment variables
SUPABASE_SETUP.md                   # Setup guide lengkap
```

---

## 1️⃣ CREATE NEW TASK - Full Implementation

### Feature: Membuat task baru dengan validasi lengkap

**File:** [src/components/CreateTaskForm.tsx](src/components/CreateTaskForm.tsx)

**Key Features:**

- ✅ Form validation dengan Zod
- ✅ Loading state management
- ✅ Error handling & user feedback
- ✅ Success notification
- ✅ Auto-reset form setelah success
- ✅ Select field untuk project, status, type

**Form Fields:**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| Title | Text | ✅ | Min 3, Max 255 chars |
| Description | Textarea | ❌ | Max 5000 chars |
| Project | Select | ❌ | UUID format |
| Requester | Text | ❌ | Max 255 chars |
| PIC | Text | ❌ | Max 255 chars |
| Status | Select | ✅ | To Do, In Progress, Review, Done, Cancelled |
| Type | Select | ✅ | Working, Learning, Other |

### Cara Pakai di Parent Component:

```tsx
'use client';

import { CreateTaskForm } from '@/components/CreateTaskForm';
import { TasksList } from '@/components/TasksList';
import { useState } from 'react';

export default function TaskPage() {
  const [projects, setProjects] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskCreated = () => {
    // Refresh tasks list
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Create Task Form */}
      <CreateTaskForm projects={projects} onSuccess={handleTaskCreated} />

      {/* Tasks List */}
      <TasksList projects={projects} refreshTrigger={refreshTrigger} />
    </div>
  );
}
```

---

## 2️⃣ VIEW ALL TASKS - Full Implementation

### Feature: Fetch tasks dengan multiple filters

**File:** [src/components/TasksList.tsx](src/components/TasksList.tsx)

**Filters:**

```
🔍 Search       - Cari by title (ilike)
🚦 Status       - Filter by status
🏷 Type         - Filter by type
📁 Project      - Filter by project
🙋 Requester    - Cari by requester name
👤 PIC          - Cari by PIC name
```

**Filter Behavior:**

- Semua filter optional
- Bisa dikombinasikan (AND logic)
- Jika kosong → tidak di-apply
- Real-time filtering (update saat user ketik)
- "Clear All" button untuk reset

### API Query Example:

```typescript
// URL dengan filters
GET /api/tasks?search=API&status=In%20Progress&type=Working&limit=50&offset=0

// Response
{
  "tasks": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Complete API Integration",
      "description": "Integrate Supabase with Next.js",
      "project_id": "987fcdeb-51a2-11ec-81d3-0242ac130003",
      "requester": "John Doe",
      "pic": "Jane Smith",
      "status": "In Progress",
      "type": "Working",
      "created_at": "2025-01-06T10:30:00Z"
    }
  ],
  "count": 150,
  "limit": 50,
  "offset": 0
}
```

---

## 3️⃣ API Routes - Backend Implementation

### File: [src/app/api/tasks/route.ts](src/app/api/tasks/route.ts)

### GET Endpoint - Fetch Tasks dengan Filters

```typescript
GET /api/tasks

Query Parameters:
- search (string)         : Search di title (case-insensitive)
- status (string)         : Filter by status
- type (string)           : Filter by type (Working, Learning, Other)
- project_id (string)     : Filter by project UUID
- requester (string)      : Filter by requester name
- pic (string)            : Filter by PIC name
- limit (number)          : Default 50, Max 500
- offset (number)         : Default 0, untuk pagination

Example:
GET /api/tasks?search=payment&status=In%20Progress&limit=20
```

**Query Implementation:**

```typescript
// Filter diterapkan hanya jika ada value
const query = supabase.from('tasks').select('*').is('deleted_at', null); // Soft delete

if (search) query = query.ilike('title', `%${search}%`);
if (status) query = query.eq('status', status);
if (type) query = query.eq('type', type);
if (project_id) query = query.eq('project_id', project_id);
if (requester) query = query.ilike('requester', `%${requester}%`);
if (pic) query = query.ilike('pic', `%${pic}%`);

query = query.order('created_at', { ascending: false });
const { data, error } = await query;
```

### POST Endpoint - Create Task

```typescript
POST /api/tasks

Request Body:
{
  "title": "string (required, 3-255 chars)",
  "description": "string (optional, max 5000 chars)",
  "project_id": "uuid (optional)",
  "requester": "string (optional)",
  "pic": "string (optional)",
  "status": "To Do | In Progress | Review | Done | Cancelled (default: To Do)",
  "type": "Working | Learning | Other (default: Working)"
}

Example:
{
  "title": "Setup Database",
  "description": "Create tables in Supabase",
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "requester": "Manager",
  "pic": "Developer",
  "status": "To Do",
  "type": "Working"
}

Response (201):
{
  "task": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Setup Database",
    "status": "To Do",
    "created_at": "2025-01-06T10:30:00Z"
  }
}
```

---

## 4️⃣ Custom Hooks - Client Implementation

### Hook 1: useCreateTask

**File:** [src/hooks/use-create-task.ts](src/hooks/use-create-task.ts)

```typescript
import { useCreateTask } from '@/hooks/use-create-task';

function MyComponent() {
  const { loading, error, success, createTask } = useCreateTask();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await createTask({
      title: 'My Task',
      description: 'Description',
      status: 'To Do',
      type: 'Working'
    });

    if (success) {
      console.log('Task created!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {loading && <p>Creating...</p>}
      {error && <p>Error: {error}</p>}
      {success && <p>Success!</p>}
      <button type="submit" disabled={loading}>Create</button>
    </form>
  );
}
```

### Hook 2: useFetchTasks

**File:** [src/hooks/use-fetch-tasks.ts](src/hooks/use-fetch-tasks.ts)

```typescript
import { useFetchTasks } from '@/hooks/use-fetch-tasks';

function MyComponent() {
  const { tasks, loading, error, count, fetchTasks } = useFetchTasks();

  // Fetch on mount
  useEffect(() => {
    fetchTasks({ status: 'In Progress' });
  }, []);

  // Fetch saat filter berubah
  const handleStatusChange = (newStatus) => {
    fetchTasks({
      status: newStatus,
      search: searchQuery
    });
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {tasks.map(task => <TaskCard key={task.id} task={task} />)}
    </div>
  );
}
```

---

## 5️⃣ Validation Schema - Zod

**File:** [src/schemas/task-schema.ts](src/schemas/task-schema.ts)

### Schema Definitions:

```typescript
// Create Task
const createTaskSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(5000).optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  requester: z.string().max(255).optional().nullable(),
  pic: z.string().max(255).optional().nullable(),
  status: z.enum(['To Do', 'In Progress', 'Review', 'Done', 'Cancelled']),
  type: z.enum(['Working', 'Learning', 'Other']),
});

type CreateTaskInput = z.infer<typeof createTaskSchema>;

// Filter Tasks
const filterTasksSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  project_id: z.string().uuid().optional(),
  requester: z.string().optional(),
  pic: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
});
```

---

## 6️⃣ Error Handling & Loading States

### Loading States:

```tsx
{
  loading && (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="ml-2">Loading...</span>
    </div>
  );
}
```

### Error Handling:

```tsx
{
  error && (
    <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-700">
      <AlertCircle className="h-5 w-5" />
      <p className="text-sm">{error}</p>
    </div>
  );
}
```

### Success Messages:

```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: 'Success',
  description: 'Task created successfully!',
});
```

---

## 7️⃣ Environment Variables Setup

**File:** [.env.example](.env.example)

### Langkah Setup:

1. **Copy `.env.example` ke `.env.local`:**

   ```bash
   cp .env.example .env.local
   ```

2. **Isi dengan credentials Supabase kamu:**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Variable Naming:**
   - `NEXT_PUBLIC_*` = Aman di client (public)
   - Tanpa prefix = Server-only (private)

---

## 8️⃣ Integration Example

### Complete Integration di Page:

```tsx
'use client';

import { CreateTaskForm } from '@/components/CreateTaskForm';
import { TasksList } from '@/components/TasksList';
import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
}

export default function TasksPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Task Management</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <CreateTaskForm projects={projects} onSuccess={handleTaskCreated} />

          <TasksList projects={projects} refreshTrigger={refreshTrigger} />
        </>
      )}
    </div>
  );
}
```

---

## 9️⃣ Database Schema Reference

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Projects Table

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP,
  deleted_at TIMESTAMP (soft delete)
);
```

### Tasks Table

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id),
  created_by UUID NOT NULL REFERENCES users(id),
  requester VARCHAR(255),
  pic VARCHAR(255),
  status VARCHAR(50) (To Do, In Progress, Review, Done, Cancelled),
  type VARCHAR(50) (Working, Learning, Other),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP (soft delete)
);
```

---

## 🔟 Testing Checklist

- [ ] Environment variables sudah di-set
- [ ] Supabase project sudah dibuat
- [ ] Database tables sudah dibuat
- [ ] RLS policies sudah di-setup
- [ ] Create task form berfungsi
- [ ] Task tersimpan di Supabase
- [ ] View all tasks berfungsi
- [ ] Filters bekerja (semua kombinasi)
- [ ] Search by title berfungsi
- [ ] Error handling menampilkan pesan
- [ ] Loading states menampilkan spinner
- [ ] Success messages menampilkan notification

---

## 📚 Resources

- **Full Setup Guide**: [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Zod Validation**: https://zod.dev

---

**Ready to use! 🎉**
