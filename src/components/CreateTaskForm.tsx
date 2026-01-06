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
import { Textarea } from '@/components/ui/textarea';
import { useCreateTask } from '@/hooks/use-create-task';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface CreateTaskProps {
  projects: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function CreateTaskForm({ projects, onSuccess }: CreateTaskProps) {
  const { loading, error, fieldErrors, success, createTask, reset } = useCreateTask();
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [requester, setRequester] = useState('');
  const [pic, setPic] = useState('');
  const [status, setStatus] = useState('To Do');
  const [type, setType] = useState('Working');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Call create task hook
    await createTask({
      title,
      description: description || null,
      project_id: projectId || null,
      requester: requester || null,
      pic: pic || null,
      status: status as 'To Do' | 'In Progress' | 'Review' | 'Done' | 'Cancelled',
      type: type as 'Working' | 'Learning' | 'Other',
    });
  };

  // Show success message
  if (success) {
    toast({
      title: 'Success',
      description: 'Task created successfully!',
    });

    // Reset form
    setTitle('');
    setDescription('');
    setProjectId('');
    setRequester('');
    setPic('');
    setStatus('To Do');
    setType('Working');
    reset();

    // Callback
    onSuccess?.();
  }

  // Helper function to get field error
  const getFieldError = (fieldName: string) => fieldErrors?.[fieldName];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Create New Task</h2>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <p className="text-sm">Task created successfully!</p>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title *
        </label>
        <Input
          id="title"
          placeholder="Enter task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          required
          className={getFieldError('title') ? 'border-red-500' : ''}
        />
        {getFieldError('title') && <p className="text-xs text-red-500">{getFieldError('title')}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Enter task description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          rows={4}
          className={getFieldError('description') ? 'border-red-500' : ''}
        />
        {getFieldError('description') && (
          <p className="text-xs text-red-500">{getFieldError('description')}</p>
        )}
      </div>

      {/* Row: Project & Requester */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="project" className="text-sm font-medium">
            Project
          </label>
          <Select value={projectId} onValueChange={setProjectId} disabled={loading}>
            <SelectTrigger
              id="project"
              className={getFieldError('project_id') ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Select project..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Project</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('project_id') && (
            <p className="text-xs text-red-500">{getFieldError('project_id')}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="requester" className="text-sm font-medium">
            Requester
          </label>
          <Input
            id="requester"
            placeholder="Enter requester name..."
            value={requester}
            onChange={(e) => setRequester(e.target.value)}
            disabled={loading}
            className={getFieldError('requester') ? 'border-red-500' : ''}
          />
          {getFieldError('requester') && (
            <p className="text-xs text-red-500">{getFieldError('requester')}</p>
          )}
        </div>
      </div>

      {/* Row: PIC & Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="pic" className="text-sm font-medium">
            PIC (Person In Charge)
          </label>
          <Input
            id="pic"
            placeholder="Enter PIC name..."
            value={pic}
            onChange={(e) => setPic(e.target.value)}
            disabled={loading}
            className={getFieldError('pic') ? 'border-red-500' : ''}
          />
          {getFieldError('pic') && <p className="text-xs text-red-500">{getFieldError('pic')}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            Type
          </label>
          <Select value={type} onValueChange={setType} disabled={loading}>
            <SelectTrigger id="type" className={getFieldError('type') ? 'border-red-500' : ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Working">Working</SelectItem>
              <SelectItem value="Learning">Learning</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {getFieldError('type') && <p className="text-xs text-red-500">{getFieldError('type')}</p>}
        </div>
      </div>

      {/* Row: Status */}
      <div className="space-y-2">
        <label htmlFor="status" className="text-sm font-medium">
          Status
        </label>
        <Select value={status} onValueChange={setStatus} disabled={loading}>
          <SelectTrigger id="status" className={getFieldError('status') ? 'border-red-500' : ''}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="To Do">To Do</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        {getFieldError('status') && (
          <p className="text-xs text-red-500">{getFieldError('status')}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Creating...' : 'Create Task'}
      </Button>
    </form>
  );
}
