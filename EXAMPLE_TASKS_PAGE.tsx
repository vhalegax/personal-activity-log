'use client';

import { CreateTaskForm } from '@/components/CreateTaskForm';
import { TasksList } from '@/components/TasksList';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
}

/**
 * Example Tasks Page Component
 *
 * Menunjukkan cara mengintegrasikan:
 * - CreateTaskForm (untuk buat task baru)
 * - TasksList (untuk view & filter tasks)
 * - Refresh synchronization antara kedua komponen
 *
 * Usage:
 * <TasksPageExample />
 */
export default function TasksPageExample() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Fetch projects dari API
   * Dipanggil saat component mount
   */
  useEffect(() => {
    fetchProjects();
  }, []);

  /**
   * Get all projects
   * Used untuk dropdown di create form & filter
   */
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await fetch('/api/projects');

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Bisa tambah toast notification di sini
    } finally {
      setLoadingProjects(false);
    }
  };

  /**
   * Handle saat task baru berhasil dibuat
   * Trigger TasksList untuk refresh
   */
  const handleTaskCreated = () => {
    // Update trigger untuk signal ke TasksList bahwa ada task baru
    setRefreshTrigger((prev) => prev + 1);

    // Optional: fetch projects lagi (jika ada project baru)
    // fetchProjects();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">Task Management</h1>
        <p className="text-lg text-slate-600">Create, manage, and track your tasks efficiently</p>
      </div>

      {/* Loading State */}
      {loadingProjects && (
        <div className="flex min-h-96 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-lg text-slate-600">Loading projects...</p>
          </div>
        </div>
      )}

      {!loadingProjects && (
        <div className="space-y-8">
          {/* ============================================ */}
          {/* Section 1: Create New Task Form */}
          {/* ============================================ */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <CreateTaskForm projects={projects} onSuccess={handleTaskCreated} />
          </div>

          {/* ============================================ */}
          {/* Section 2: View & Filter Tasks */}
          {/* ============================================ */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <TasksList projects={projects} refreshTrigger={refreshTrigger} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ============================================
 * COMPONENT BREAKDOWN
 * ============================================
 *
 * 1. CreateTaskForm
 *    - Form input untuk buat task baru
 *    - Include validation & error handling
 *    - Call onSuccess callback saat berhasil
 *
 * 2. TasksList
 *    - Display semua tasks
 *    - Include multiple filters:
 *      - Search by title
 *      - Filter by status
 *      - Filter by type
 *      - Filter by project
 *      - Filter by requester
 *      - Filter by PIC
 *    - Watch refreshTrigger untuk reload data
 *
 * ============================================
 * DATA FLOW
 * ============================================
 *
 * 1. fetchProjects() → get projects list
 * 2. Pass projects ke CreateTaskForm & TasksList
 * 3. User create task → CreateTaskForm POST /api/tasks
 * 4. onSuccess callback → setRefreshTrigger
 * 5. TasksList detect refreshTrigger change → fetch latest tasks
 *
 * ============================================
 * STYLING NOTES
 * ============================================
 *
 * - bg-gradient-to-br = Gradient background
 * - Tailwind utility classes = Responsive design
 * - Shadows & borders = Visual hierarchy
 * - Grid layout = Mobile responsive
 *
 * ============================================
 */
