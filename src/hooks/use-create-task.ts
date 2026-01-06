import { supabase } from '@/lib/supabase-client';
import { createTaskSchema, type CreateTaskInput } from '@/schemas/task-schema';
import { useState } from 'react';
import { ZodError } from 'zod';

interface UseCreateTaskResult {
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string> | null;
  success: boolean;
  createTask: (data: CreateTaskInput) => Promise<void>;
  reset: () => void;
}

export function useCreateTask(): UseCreateTaskResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [success, setSuccess] = useState(false);

  const createTask = async (data: CreateTaskInput) => {
    setLoading(true);
    setError(null);
    setFieldErrors(null);
    setSuccess(false);

    try {
      // Validate data with schema
      const validatedData = createTaskSchema.parse(data);

      // Get session for auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('You must be logged in to create a task');
        setLoading(false);
        return;
      }

      // Call API with auth token
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle field-level errors
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
          setError('Please fix the errors below');
        } else {
          setError(result.error || 'Failed to create task');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setError(null);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrs: Record<string, string> = {};
        err.errors.forEach((e) => {
          const fieldPath = e.path.join('.');
          fieldErrs[fieldPath] = e.message;
        });
        setFieldErrors(fieldErrs);
        setError('Please fix validation errors');
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
    setFieldErrors(null);
    setSuccess(false);
  };

  return { loading, error, fieldErrors, success, createTask, reset };
}
