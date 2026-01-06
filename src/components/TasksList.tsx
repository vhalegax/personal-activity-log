'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFetchTasks } from '@/hooks/use-fetch-tasks';
import { Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  project_id: string | null;
  requester: string | null;
  pic: string | null;
  status: string;
  type: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

interface TasksListProps {
  projects: Project[];
  refreshTrigger?: number; // Use this to trigger refresh from parent
}

export function TasksList({ projects, refreshTrigger = 0 }: TasksListProps) {
  const { tasks, loading, error, count, fetchTasks } = useFetchTasks();

  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [projectId, setProjectId] = useState('');
  const [requester, setRequester] = useState('');
  const [pic, setPic] = useState('');

  // Fetch tasks when filters change
  useEffect(() => {
    fetchTasks({
      search: search || undefined,
      status: status || undefined,
      type: type || undefined,
      project_id: projectId || undefined,
      requester: requester || undefined,
      pic: pic || undefined,
    });
  }, [search, status, type, projectId, requester, pic, fetchTasks]);

  // Refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchTasks({
        search: search || undefined,
        status: status || undefined,
        type: type || undefined,
        project_id: projectId || undefined,
        requester: requester || undefined,
        pic: pic || undefined,
      });
    }
  }, [refreshTrigger]);

  const getProjectName = (projectId: string | null): string => {
    if (!projectId) return 'No Project';
    const project = projects.find((p) => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'to do':
        return 'bg-gray-100 text-gray-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'working':
        return 'bg-blue-50 text-blue-700';
      case 'learning':
        return 'bg-purple-50 text-purple-700';
      case 'other':
        return 'bg-gray-50 text-gray-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setStatus('');
    setType('');
    setProjectId('');
    setRequester('');
    setPic('');
  };

  const hasActiveFilters = search || status || type || projectId || requester || pic;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Tasks</h2>

        {/* Filter Section */}
        <div className="mb-6 space-y-4 rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Filters</h3>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Search */}
            <Input
              placeholder="🔍 Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
            />

            {/* Status Filter */}
            <Select value={status} onValueChange={setStatus} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="🚦 Filter by status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={type} onValueChange={setType} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="🏷 Filter by type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="Working">Working</SelectItem>
                <SelectItem value="Learning">Learning</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Project Filter */}
            <Select value={projectId} onValueChange={setProjectId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="📁 Filter by project..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Requester Filter */}
            <Input
              placeholder="🙋 Filter by requester..."
              value={requester}
              onChange={(e) => setRequester(e.target.value)}
              disabled={loading}
            />

            {/* PIC Filter */}
            <Input
              placeholder="👤 Filter by PIC..."
              value={pic}
              onChange={(e) => setPic(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {/* Tasks List */}
        {!loading && tasks.length === 0 && (
          <div className="rounded-lg bg-gray-50 py-8 text-center text-gray-500">
            No tasks found. {hasActiveFilters && 'Try adjusting your filters.'}
          </div>
        )}

        {!loading && tasks.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}{' '}
              {count > tasks.length && `of ${count}`}
            </p>

            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300"
              >
                <div className="flex flex-col gap-3">
                  {/* Header: Title + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="flex-1 font-medium text-gray-900">{task.title}</h3>
                    <div className="flex gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
                      >
                        {task.status}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(task.type)}`}
                      >
                        {task.type}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="line-clamp-2 text-sm text-gray-600">{task.description}</p>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 md:grid-cols-4">
                    <div>
                      <span className="font-medium">Project:</span>{' '}
                      {getProjectName(task.project_id)}
                    </div>
                    {task.requester && (
                      <div>
                        <span className="font-medium">Requester:</span> {task.requester}
                      </div>
                    )}
                    {task.pic && (
                      <div>
                        <span className="font-medium">PIC:</span> {task.pic}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(task.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
