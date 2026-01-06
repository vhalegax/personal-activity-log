'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getStoredData, updateStoredValue } from '@/lib/storage';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

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

type Project = { id: string; name: string };

type TimeLog = {
  id: string;
  task_id: string;
  user_email: string;
  start_at: string;
  end_at: string | null;
};

interface PageProps {
  params: {
    id: string;
  };
}

const statusOptions = ['To Do', 'In Progress', 'Done'];
const typeOptions = ['Working', 'Meeting', 'Break', 'Admin'];

export default function TaskDetailPage({ params }: PageProps) {
  const taskId = params.id;

  const [task, setTask] = useState<Task | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Form state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editProject, setEditProject] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editType, setEditType] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    const email = localStorage.getItem('mvp_email');
    if (!email) {
      window.location.href = '/';
      return;
    }

    const cached = getStoredData();
    if (cached.user) setUser(cached.user);
    if (cached.projects) setProjects(cached.projects);

    // Find task in cached data
    if (cached.tasks) {
      const foundTask = cached.tasks.find((t) => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
        setEditTitle(foundTask.title);
        setEditDesc(foundTask.description || '');
        setEditProject(foundTask.project_id || '');
        setEditStatus(foundTask.status);
        setEditType(foundTask.type);
      }
    }

    if (cached.timeLogs) {
      const taskLogs = cached.timeLogs.filter((log) => log.task_id === taskId);
      setTimeLogs(taskLogs);
      const active = taskLogs.find((l) => l.end_at === null);
      setIsRunning(!!active);
    }

    fetchLatestData();
  }

  async function fetchLatestData() {
    try {
      const [pRes, tRes, tlRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks'),
        fetch('/api/time-logs'),
      ]);

      const pJson = await pRes.json();
      const tJson = await tRes.json();
      const tlJson = await tlRes.json();

      setProjects(pJson.projects || []);

      const foundTask = (tJson.tasks || []).find((t: Task) => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
        setEditTitle(foundTask.title);
        setEditDesc(foundTask.description || '');
        setEditProject(foundTask.project_id || '');
        setEditStatus(foundTask.status);
        setEditType(foundTask.type);
      }

      const taskLogs = (tlJson.timeLogs || []).filter((log: TimeLog) => log.task_id === taskId);
      setTimeLogs(taskLogs);
      const active = taskLogs.find((l: TimeLog) => l.end_at === null);
      setIsRunning(!!active);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const getProjectName = (projectId: string | null | undefined): string => {
    if (!projectId) return 'No Project';
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  async function startStop(action: 'start' | 'stop') {
    if (!user) return;
    setUpdating(true);
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
        setIsRunning(action === 'start');
        await fetchLatestData();
      } else {
        const err = await res.json();
        alert(err.error || `Failed to ${action} timer`);
      }
    } finally {
      setUpdating(false);
    }
  }

  async function updateTask() {
    if (!editTitle.trim()) {
      alert('Task title is required');
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editTitle,
          description: editDesc || undefined,
          project_id: editProject || null,
          status: editStatus,
          type: editType,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTask(updated.task);

        // Update localStorage
        const cached = getStoredData();
        if (cached.tasks) {
          const updated_tasks = cached.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  title: editTitle,
                  description: editDesc,
                  project_id: editProject || null,
                  status: editStatus,
                  type: editType,
                }
              : t,
          );
          updateStoredValue('tasks', updated_tasks);
        }

        alert('Task updated successfully');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update task');
      }
    } finally {
      setUpdating(false);
    }
  }

  const formatTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString();
  };

  const calculateDuration = (startAt: string, endAt: string | null): string => {
    const start = new Date(startAt).getTime();
    const end = endAt ? new Date(endAt).getTime() : Date.now();
    const ms = end - start;
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  if (loading || !task) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading task...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <Link href="/tasks">
            <Button variant="outline">Back to Tasks</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Task Info & Actions */}
          <div className="space-y-6 md:col-span-2">
            {/* Timer Section */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Time Tracking</h2>
              <div className="flex gap-3">
                {isRunning ? (
                  <Button
                    onClick={() => startStop('stop')}
                    disabled={updating}
                    variant="destructive"
                    className="flex-1"
                  >
                    {updating ? 'Stopping...' : 'Stop Timer'}
                  </Button>
                ) : (
                  <Button onClick={() => startStop('start')} disabled={updating} className="flex-1">
                    {updating ? 'Starting...' : 'Start Timer'}
                  </Button>
                )}
                {isRunning && (
                  <div className="flex items-center justify-center rounded bg-green-100 px-3">
                    <span className="text-sm font-medium text-green-800">🔴 Running</span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Task Form */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Edit Task</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Title</label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Task title"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Description</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Task description"
                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Project</label>
                    <select
                      value={editProject}
                      onChange={(e) => setEditProject(e.target.value)}
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="">No Project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">Type</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                    >
                      {typeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <Button onClick={updateTask} disabled={updating} className="w-full">
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Time Logs */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Time History</h2>
            {timeLogs.length === 0 ? (
              <p className="text-sm text-gray-500">No time logs yet</p>
            ) : (
              <div className="space-y-3">
                {timeLogs.map((log) => (
                  <div key={log.id} className="border-l-2 border-blue-300 bg-blue-50 p-3">
                    <p className="text-xs text-gray-600">{formatTime(log.start_at)}</p>
                    <p className="font-semibold text-gray-900">
                      {calculateDuration(log.start_at, log.end_at)}
                    </p>
                    {log.end_at && (
                      <p className="text-xs text-gray-600">
                        Ended: {new Date(log.end_at).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
