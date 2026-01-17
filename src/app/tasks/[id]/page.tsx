'use client';

import '@/assets/styles/quill-custom.css';
import { EditTimeLogDialog } from '@/components/EditTimeLogDialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  project_id?: string | null;
  created_at: string;
  updated_at: string;
};

type Project = {
  id: string;
  name: string;
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

// Get status badge color
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'to do':
      return 'bg-secondary text-secondary-foreground';
    case 'in progress':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'review':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    case 'done':
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
    case 'cancelled':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}

// Get type badge color
function getTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'working':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    case 'learning':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'other':
      return 'bg-secondary text-secondary-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
}

function TimeLogHistory({ taskId }: { taskId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleEdit = (log: TimeLog) => {
    setEditingLog(log);
    setDialogOpen(true);
  };

  const handleSave = async (timeLogId: string, startAt: string, endAt: string | null) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error('Not authenticated');

    const response = await fetch('/api/time-logs', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        time_log_id: timeLogId,
        start_at: startAt,
        end_at: endAt,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update time log');
    }

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['time-logs', taskId] });
    queryClient.invalidateQueries({ queryKey: ['active-time-log', taskId] });

    toast({
      title: 'Time log updated',
      description: 'The time log has been successfully updated.',
    });
  };

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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
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
              <TableRow key={log.id}>
                <TableCell>{formatDateTime(log.start_at)}</TableCell>
                <TableCell>{log.end_at ? formatDateTime(log.end_at) : '-'}</TableCell>
                <TableCell className="font-mono font-semibold">
                  {formatDuration(calculatedDuration)}
                </TableCell>
                <TableCell className="text-center">
                  {!log.end_at && (
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-500/10 text-green-700 dark:border-green-800 dark:text-green-400"
                    >
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(log)} className="h-8">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <EditTimeLogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        timeLog={editingLog}
        onSave={handleSave}
      />
    </>
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
    <div className="flex gap-2">
      {isAnotherTaskRunning && (
        <Alert className="flex items-center space-x-2 border-yellow-500/20 bg-yellow-500/10">
          <div>
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          </div>
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Another task is already being tracked. Please stop it first.
          </AlertDescription>
        </Alert>
      )}

      {!isActive ? (
        <Button
          onClick={() => startMutation.mutate()}
          disabled={isLoading || isAnotherTaskRunning}
          size="default"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Start Timer
        </Button>
      ) : (
        <Button
          onClick={() => stopMutation.mutate()}
          disabled={isLoading}
          variant="destructive"
          size="default"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Square className="mr-2 h-4 w-4" />
          )}
          Stop Timer
        </Button>
      )}
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

  // Fetch projects for the dropdown
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return [];

      const response = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) return [];

      const result = await response.json();
      return result.projects || [];
    },
  });

  const form = useForm<UpdateTaskInput>({
    resolver: zodResolver(createTaskSchema.partial()),
    values: task
      ? {
          title: task.title,
          type: task.type as any,
          status: task.status as any,
          pic: task.pic || '',
          requester: task.requester || '',
          project_id: task.project_id || undefined,
        }
      : undefined,
  });

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
      <div className="space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/tasks">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>
      </div>

      {/* Task Title and Content Card */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-2xl">{task.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getTypeColor(task.type)}>
                {task.type}
              </Badge>
              <Badge variant="outline" className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
              <span className="text-muted-foreground text-sm">
                • Created {new Date(task.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task Details Accordion */}
          <Accordion type="single" collapsible>
            <AccordionItem value="task-details" className="border-0">
              <AccordionTrigger className="p-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">Task Details</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0 pt-4">
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

                    <FormField
                      control={form.control}
                      name="project_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project</FormLabel>
                          <FormControl>
                            <Combobox
                              options={projects.map((p) => ({ value: p.id, label: p.name }))}
                              value={field.value || ''}
                              onValueChange={field.onChange}
                              placeholder="Select project..."
                              searchPlaceholder="Search projects..."
                              emptyText="No projects found."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Divider */}
          <div className="border-t" />

          {/* Description Editor */}
          <div>
            <h3 className="mb-4 text-sm font-medium">Description</h3>
            <DescriptionEditor taskId={taskId} initialDescription={task.description} />
          </div>
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

      {/* Fixed Bottom Time Tracking */}
      <div className="h-10"></div>
      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed right-0 bottom-0 border-t backdrop-blur md:left-64">
        <div className="p-4 px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Timer className="text-muted-foreground h-4 w-4" />
                <h3 className="text-sm font-medium">Time Tracking</h3>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Track time spent on:{' '}
                <span className="text-foreground font-medium">{task.title}</span>
              </p>
            </div>
            <TimerControls taskId={taskId} />
          </div>
        </div>
      </div>
    </div>
  );
}
