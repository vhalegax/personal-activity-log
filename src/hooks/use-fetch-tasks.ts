import { type FilterTasksInput } from '@/schemas/task-schema';
import { useState, useCallback } from 'react';

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

interface UseFetchTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  count: number;
  fetchTasks: (filters: Partial<FilterTasksInput>) => Promise<void>;
}

export function useFetchTasks(): UseFetchTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const fetchTasks = useCallback(async (filters: Partial<FilterTasksInput> = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.project_id) params.append('project_id', filters.project_id);
      if (filters.requester) params.append('requester', filters.requester);
      if (filters.pic) params.append('pic', filters.pic);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      // Call API
      const response = await fetch(`/api/tasks?${params.toString()}`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch tasks');
      }

      setTasks(result.tasks || []);
      setCount(result.count || 0);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      setTasks([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tasks, loading, error, count, fetchTasks };
}
