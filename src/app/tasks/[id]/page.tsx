'use client';

import '@/assets/styles/quill-custom.css';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import {
  createTaskSchema,
  TaskStatus,
  TaskType,
  type UpdateTaskInput,
} from '@/schemas/task-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Clock, Loader2, Play, Square, Timer } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for Quill (client-side only)
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-[200px] animate-pulse rounded-md bg-gray-100" />,
});

type Task = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  pic?: string | null;
  requester?: string | null;
  created_at: string;
  updated_at: string;
};

type TimeLog = {
  id: string;
  task_id: string;
  start_at: string;
  end_at: string | null;
  duration: number | null;
  created_at: string;
};

// Format duration in HH:mm:ss
function formatDuration(seconds: number | null): string {
  if (!seconds) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format date time
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TimeLogHistory({ taskId }: { taskId: string }) {
  const { data: timeLogs = [], isLoading } = useQuery<TimeLog[]>({
    queryKey: ['time-logs', taskId],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return [];

      const response = await fetch(`/api/time-logs?task_id=${taskId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch time logs');

      const result = await response.json();
      return result.timeLogs || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (timeLogs.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center text-sm">
        No time logs yet. Start the timer!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {timeLogs.map((log) => {
        // Calculate duration in code from start_at and end_at
        let calculatedDuration = log.duration;
        if (log.start_at && log.end_at) {
          const startTime = new Date(log.start_at).getTime();
          const endTime = new Date(log.end_at).getTime();
          calculatedDuration = Math.floor((endTime - startTime) / 1000);
        } else if (log.start_at && !log.end_at) {
          // Still running - calculate from start to now
          const startTime = new Date(log.start_at).getTime();
          const now = new Date().getTime();
          calculatedDuration = Math.floor((now - startTime) / 1000);
        }

        return (
          <Card key={log.id}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span className="font-medium">Start:</span>
                    <span>{formatDateTime(log.start_at)}</span>
                  </div>
                  {log.end_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Square className="text-muted-foreground h-4 w-4" />
                      <span className="font-medium">End:</span>
                      <span>{formatDateTime(log.end_at)}</span>
                    </div>
                  )}
                  {!log.end_at && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatDuration(calculatedDuration)}</div>
                  <p className="text-muted-foreground text-xs">Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function DescriptionEditor({
  taskId,
  initialDescription,
}: {
  taskId: string;
  initialDescription: string | null | undefined;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [description, setDescription] = useState(initialDescription || '');
  const lastSavedValue = useRef(initialDescription || '');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local state when initial description changes
  useEffect(() => {
    setDescription(initialDescription || '');
    lastSavedValue.current = initialDescription || '';
  }, [initialDescription]);

  // React Query mutation for saving description
  const saveMutation = useMutation({
    mutationFn: async (newDescription: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ description: newDescription }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save description');
      }

      return response.json();
    },
    onSuccess: () => {
      // Update last saved value on successful save
      lastSavedValue.current = description;
      // Only invalidate tasks list, NOT the current task to prevent rollback
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to save',
        description: error.message,
      });
    },
  });

  // Debounced auto-save effect
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Don't save if content hasn't changed from last saved value
    if (description === lastSavedValue.current) {
      return;
    }

    // Set up debounced save (700ms)
    saveTimeoutRef.current = setTimeout(() => {
      saveMutation.mutate(description);
    }, 700);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [description, saveMutation]);

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean'],
    ],
  };

  return (
    <div className="space-y-2">
      <ReactQuill
        theme="snow"
        value={description}
        onChange={setDescription}
        modules={modules}
        placeholder="Add task description..."
        className="min-h-[300px]"
      />
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">Auto-saves as you type</p>
        {saveMutation.isPending && (
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </span>
        )}
        {saveMutation.isSuccess && !saveMutation.isPending && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Saved
          </span>
        )}
      </div>
    </div>
  );
}

function TimerControls({ taskId }: { taskId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch active log for THIS task
  const { data: activeLog } = useQuery<TimeLog | null>({
    queryKey: ['active-time-log', taskId],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return null;

      const response = await fetch(`/api/time-logs?task_id=${taskId}&active=true`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) return null;

      const result = await response.json();
      return result.timeLogs?.[0] || null;
    },
  });

  // Fetch ANY active log to prevent multiple running timers
  const { data: globalActiveLog } = useQuery<TimeLog | null>({
    queryKey: ['active-timer'],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return null;

      const response = await fetch('/api/time-logs?active=true', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) return null;

      const result = await response.json();
      return result.timeLogs?.[0] || null;
    },
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/time-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ task_id: taskId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start timer');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-time-log', taskId] });
      queryClient.invalidateQueries({ queryKey: ['time-logs', taskId] });
      queryClient.invalidateQueries({ queryKey: ['active-timer'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Cannot start timer',
        description: error.message,
      });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      if (!activeLog) throw new Error('No active timer');

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/time-logs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ time_log_id: activeLog.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to stop timer');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-time-log', taskId] });
      queryClient.invalidateQueries({ queryKey: ['time-logs', taskId] });
      queryClient.invalidateQueries({ queryKey: ['active-timer'] });
    },
  });

  const isActive = !!activeLog;
  const isAnotherTaskRunning = !!globalActiveLog && globalActiveLog.task_id !== taskId;
  const isLoading = startMutation.isPending || stopMutation.isPending;

  return (
    <div className="space-y-4">
      {isAnotherTaskRunning && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Another task is already being tracked. Please stop it first.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        {!isActive ? (
          <Button
            onClick={() => startMutation.mutate()}
            disabled={isLoading || isAnotherTaskRunning}
            size="lg"
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            START
          </Button>
        ) : (
          <Button
            onClick={() => stopMutation.mutate()}
            disabled={isLoading}
            variant="destructive"
            size="lg"
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Square className="mr-2 h-4 w-4" />
            )}
            STOP
          </Button>
        )}
      </div>
    </div>
  );
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id as string;
  const queryClient = useQueryClient();

  // Fetch task details
  const {
    data: task,
    isLoading,
    error,
  } = useQuery<Task>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return null;
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch task');

      const result = await response.json();
      return result.task;
    },
    enabled: !!taskId,
  });

  const form = useForm<UpdateTaskInput>({
    resolver: zodResolver(createTaskSchema.partial()),
    defaultValues: {
      title: task?.title || '',
      type: task?.type as any,
      status: task?.status as any,
      pic: task?.pic || '',
      requester: task?.requester || '',
    },
  });

  // Update form when task data changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        type: task.type as any,
        status: task.status as any,
        pic: task.pic || '',
        requester: task.requester || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: async (values: UpdateTaskInput) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update task');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const onSubmit = async (values: UpdateTaskInput) => {
    try {
      await updateMutation.mutateAsync(values);
    } catch (err: any) {
      form.setError('root', { message: err?.message ?? 'Failed to update task' });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Error: {error ? (error as Error).message : 'Task not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center">
        <Link href="/tasks">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Task Details */}
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TaskType.options.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TaskStatus.options.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PIC</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requester"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requester</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.formState.errors.root && (
                    <p className="text-destructive text-sm font-medium">
                      {form.formState.errors.root.message}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>

        {/* Timer Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <CardTitle>Time Tracking</CardTitle>
            </div>
            <CardDescription>Track time spent on this task</CardDescription>
          </CardHeader>
          <CardContent>
            <TimerControls taskId={taskId} />
          </CardContent>
        </Card>
      </div>

      {/* Description Section - Auto-saves */}
      <Card>
        <CardContent className="p-6">
          <DescriptionEditor taskId={taskId} initialDescription={task.description} />
        </CardContent>
      </Card>

      {/* Time Log History */}
      <Card>
        <CardHeader>
          <CardTitle>Time Log History</CardTitle>
          <CardDescription>All time entries for this task</CardDescription>
        </CardHeader>
        <CardContent>
          <TimeLogHistory taskId={taskId} />
        </CardContent>
      </Card>
    </div>
  );
}
