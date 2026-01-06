'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase-client';
import { createTaskSchema, TaskType, type CreateTaskInput } from '@/schemas/task-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Search, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type Task = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  created_at: string;
};

type ActiveTimeLog = {
  id: string;
  task_id: string;
  start_at: string;
  tasks?: {
    id: string;
    title: string;
  };
};

// Truncate description to 30 characters
function truncateDescription(desc: string | null | undefined): string {
  if (!desc) return '';
  if (desc.length <= 30) return desc;
  return desc.substring(0, 30) + '...';
}

function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'Working',
      status: 'To Do',
      pic: '',
      requester: '',
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (values: CreateTaskInput) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      form.reset();
      setOpen(false);
    },
  });

  const onSubmit = async (values: CreateTaskInput) => {
    try {
      await mutateAsync(values);
    } catch (err: any) {
      form.setError('root', { message: err?.message ?? 'Failed to create task' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to track your work</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Task description"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                    />
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
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select task type" />
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
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['To Do', 'In Progress', 'Review', 'Done', 'Cancelled'].map((status) => (
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

            <FormField
              control={form.control}
              name="pic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIC (Person in Charge)</FormLabel>
                  <FormControl>
                    <Input placeholder="PIC name" {...field} value={field.value || ''} />
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
                    <Input placeholder="Requester name" {...field} value={field.value || ''} />
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Task
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function TasksPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch active timer
  const { data: activeTimer } = useQuery<ActiveTimeLog | null>({
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

  // Fetch tasks with React Query
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery<Task[]>({
    queryKey: ['tasks', searchQuery, statusFilter, typeFilter],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return [];
      }

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(`/api/tasks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch tasks');

      const result = await response.json();
      return result.tasks || [];
    },
  });

  const handleSearch = () => {
    setSearchQuery(searchInput);
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
        return 'bg-purple-100 text-purple-800';
      case 'learning':
        return 'bg-blue-100 text-blue-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and track your tasks</p>
        </div>
        <CreateTaskDialog />
      </div>

      {/* Active Timer Alert */}
      {activeTimer && (
        <Alert className="border-green-200 bg-green-50">
          <Timer className="h-4 w-4 text-green-600" />
          <AlertDescription className="ml-2">
            <span className="font-medium">Timer is running</span> for task:{' '}
            <Link
              href={`/tasks/${activeTimer.task_id}`}
              className="font-semibold text-green-700 hover:underline"
            >
              {tasks.find((t) => t.id === activeTimer.task_id)?.title || 'Loading...'}
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <div className="flex gap-4">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              placeholder="Search by title, description, PIC, requester, project..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="To Do">To Do</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Working">Working</SelectItem>
            <SelectItem value="Learning">Learning</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[250px]" />
                <Skeleton className="h-4 w-[400px]" />
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {(error as Error).message}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && tasks.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No tasks found. Create one to get started!</p>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      {!isLoading && !error && tasks.length > 0 && (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Link key={task.id} href={`/tasks/${task.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{task.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {truncateDescription(task.description)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(task.type)}>{task.type}</Badge>
                      <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
