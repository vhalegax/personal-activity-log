import { createTaskSchema, type CreateTaskInput } from '@/schemas/task-schema';
import { useState } from 'react';
import { ZodError } from 'zod';

interface UseCreateTaskResult {
  loading: boolean;
  error: string | null;
  success: boolean;
  createTask: (data: CreateTaskInput) => Promise<void>;
  reset: () => void;
}

export function useCreateTask(): UseCreateTaskResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createTask = async (data: CreateTaskInput) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate data with schema
      const validatedData = createTaskSchema.parse(data);

      // Call API
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create task');
      }

      setSuccess(true);
      setError(null);
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        setError(`Validation error: ${messages}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  return { loading, error, success, createTask, reset };
}
