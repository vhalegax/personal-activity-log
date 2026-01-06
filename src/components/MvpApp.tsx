'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getStoredData,
  saveStoredData,
  updateStoredValue,
  clearStoredData,
  type StorageData,
} from '@/lib/storage';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type User = { id: string; email: string };
type Project = { id: string; name: string };
type Task = {
  id: string;
  title: string;
  description?: string;
  project_id?: string | null;
  requester?: string | null;
  pic?: string | null;
  status: string;
  type: string;
};

export default function MvpApp() {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // New task form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
  const [newTaskRequester, setNewTaskRequester] = useState('');
  const [newTaskPic, setNewTaskPic] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('To Do');
  const [newTaskType, setNewTaskType] = useState('Working');

  // New project form
  const [newProjectName, setNewProjectName] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);

  useEffect(() => {
    const e = localStorage.getItem('mvp_email') || '';
    if (e) {
      setEmail(e);
      // Load cached data first
      const cached = getStoredData();
      if (cached.user) setUser(cached.user);
      if (cached.projects) setProjects(cached.projects);
      if (cached.tasks) setTasks(cached.tasks);
      if (cached.activeTaskId) setActiveTaskId(cached.activeTaskId);

      fetchLogin(e);
    }
  }, []);

  async function fetchLogin(e: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ email: e }),
      });
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('mvp_email', e);

      // Save to localStorage
      saveStoredData({ user: data.user });

      await refreshData();
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function refreshData() {
    try {
      const [pRes, tRes, tlRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks'),
        fetch('/api/time-logs'),
      ]);

      // Check if responses are ok
      if (!pRes.ok || !tRes.ok || !tlRes.ok) {
        throw new Error('API error: ' + [pRes.status, tRes.status, tlRes.status].join(', '));
      }

      const pJson = await pRes.json();
      const tJson = await tRes.json();
      const tlJson = await tlRes.json();

      setProjects(pJson.projects || []);
      setTasks(tJson.tasks || []);

      // Find active time log
      const active = (tlJson.timeLogs || []).find((l: any) => l.end_at == null);
      const activeId = active ? active.task_id : null;
      setActiveTaskId(activeId);

      // Save to localStorage
      saveStoredData({
        projects: pJson.projects || [],
        tasks: tJson.tasks || [],
        timeLogs: tlJson.timeLogs || [],
        activeTaskId: activeId,
      });
    } catch (err) {
      console.error('Refresh error:', err);
      // Fail silently, use cached data
    }
  }

  async function createProject() {
    if (!newProjectName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: newProjectName,
          user_email: user?.email,
        }),
      });
      if (res.ok) {
        setNewProjectName('');
        setShowProjectForm(false);
        await refreshData();
      } else {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          alert(err.error || 'Failed to create project');
        } catch {
          alert('Failed to create project: ' + res.statusText);
        }
      }
    } catch (err) {
      console.error('Create project error:', err);
      alert('Error creating project');
    } finally {
      setLoading(false);
    }
  }

  async function createTask() {
    if (!newTaskTitle.trim()) {
      alert('Task title is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc || undefined,
          project_id: newTaskProject || null,
          requester: newTaskRequester || null,
          pic: newTaskPic || null,
          status: newTaskStatus,
          type: newTaskType,
          user_email: user?.email,
        }),
      });
      if (res.ok) {
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskProject('');
        setNewTaskRequester('');
        setNewTaskPic('');
        setNewTaskStatus('To Do');
        setNewTaskType('Working');
        await refreshData();
      } else {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          alert(err.error || 'Failed to create task');
        } catch {
          alert('Failed to create task: ' + res.statusText);
        }
      }
    } catch (err) {
      console.error('Create task error:', err);
      alert('Error creating task');
    } finally {
      setLoading(false);
    }
  }

  async function startStop(taskId: string, action: 'start' | 'stop') {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/time-logs', {
        method: 'POST',
        body: JSON.stringify({
          action,
          task_id: taskId,
          user_email: user.email,
        }),
      });

      if (res.ok) {
        if (action === 'start') {
          setActiveTaskId(taskId);
        } else {
          setActiveTaskId(null);
        }
        await refreshData();
      } else {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          alert(err.error || `Failed to ${action} timer`);
        } catch {
          alert(`Failed to ${action} timer: ` + res.statusText);
        }
      }
    } catch (err) {
      console.error('Start/Stop error:', err);
      alert('Error with timer');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    clearStoredData();
    localStorage.removeItem('mvp_email');
    setUser(null);
    setEmail('');
    setProjects([]);
    setTasks([]);
    setActiveTaskId(null);
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
          <h1 className="mb-2 text-3xl font-bold">Task Tracker</h1>
          <p className="mb-6 text-gray-600">Time tracking MVP</p>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && fetchLogin(email)}
              />
              <p className="mt-2 text-xs text-gray-500">
                Tip: Use any email to test (e.g., test@example.com)
              </p>
            </div>

            <Button
              onClick={() => fetchLogin(email || 'test@example.com')}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold">Task Tracker</h1>
            <p className="text-sm text-gray-600">
              Signed in as <span className="font-medium">{user.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/tasks">
              <Button variant="outline">View All Tasks</Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline">Reports</Button>
            </Link>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8">
          {/* New Task Form */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">Create New Task</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Title *</label>
                  <Input
                    placeholder="Task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Type</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Working">Working</option>
                    <option value="Learning">Learning</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea
                  placeholder="Task description (optional)"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Status</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="To Do">To Do</option>
                    <option value="Progress">Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Project</label>
                  <div className="flex gap-2">
                    <select
                      value={newTaskProject}
                      onChange={(e) => setNewTaskProject(e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">No project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {!showProjectForm && (
                      <Button variant="outline" size="sm" onClick={() => setShowProjectForm(true)}>
                        +
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Requester</label>
                  <Input
                    placeholder="Requester name (optional)"
                    value={newTaskRequester}
                    onChange={(e) => setNewTaskRequester(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">PIC</label>
                  <Input
                    placeholder="Person in charge (optional)"
                    value={newTaskPic}
                    onChange={(e) => setNewTaskPic(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={createTask}
                disabled={loading || !newTaskTitle.trim()}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </div>

          {/* Project Creation */}
          {showProjectForm && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold">Create New Project</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Project Name *</label>
                  <Input
                    placeholder="Project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && createProject()}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={createProject} disabled={loading || !newProjectName.trim()}>
                    {loading ? 'Creating...' : 'Create Project'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowProjectForm(false);
                      setNewProjectName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Projects List */}
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold">Projects</h2>
            </div>

            {projects.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No projects yet. Create one above to get started!
              </div>
            ) : (
              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-lg border border-gray-200 p-4 hover:shadow-md"
                  >
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {tasks.filter((t) => t.project_id === project.id).length} tasks
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{tasks.length}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-600">Active Project</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-600">Running Task</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{activeTaskId ? '1' : '0'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
