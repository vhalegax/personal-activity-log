'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getStoredData } from '@/lib/storage';
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

// Truncate description to max 30 words + ...
function truncateDescription(desc: string | undefined, maxWords: number = 30): string {
  if (!desc) return '';
  const words = desc.split(' ');
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...';
  }
  return desc;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    const email = localStorage.getItem('mvp_email');
    if (!email) {
      // Redirect to home if not logged in
      window.location.href = '/';
      return;
    }

    const cached = getStoredData();
    if (cached.user) setUser(cached.user);
    if (cached.projects) setProjects(cached.projects);
    if (cached.tasks) setTasks(cached.tasks);

    fetchLatestData();
  }

  async function fetchLatestData() {
    try {
      const [pRes, tRes] = await Promise.all([fetch('/api/projects'), fetch('/api/tasks')]);

      const pJson = await pRes.json();
      const tJson = await tRes.json();

      setProjects(pJson.projects || []);
      setTasks(tJson.tasks || []);
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

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'to do':
        return 'bg-gray-100 text-gray-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white p-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tasks</h1>
            <p className="text-sm text-gray-600">Manage and track your tasks</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center">
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                {/* Header with status badge */}
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="flex-1 font-semibold text-gray-900">{task.title}</h3>
                  <span
                    className={`flex-shrink-0 rounded px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
                  >
                    {task.status}
                  </span>
                </div>

                {/* Description */}
                {task.description && (
                  <p className="mb-3 text-sm text-gray-600">
                    {truncateDescription(task.description, 30)}
                  </p>
                )}

                {/* Metadata */}
                <div className="mb-4 space-y-1 text-sm text-gray-500">
                  <p>
                    <span className="font-medium">Project:</span> {getProjectName(task.project_id)}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span> {task.type}
                  </p>
                </div>

                {/* View Button */}
                <Link href={`/tasks/${task.id}`}>
                  <Button variant="default" className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
