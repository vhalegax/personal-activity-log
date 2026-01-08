'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-client';
import { TaskStatus } from '@/schemas/task-schema';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

type Task = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  created_at: string;
};

// Truncate description to 30 characters
function truncateDescription(desc: string | null | undefined): string {
  if (!desc) return '';
  // Strip HTML tags first
  const plainText = desc.replace(/<[^>]*>/g, '');
  if (plainText.length <= 30) return plainText;
  return plainText.substring(0, 30) + '...';
}

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

function getColumnHeaderColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'to do':
      return 'bg-secondary/50 text-foreground';
    case 'in progress':
      return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
    case 'review':
      return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
    case 'done':
      return 'bg-green-500/20 text-green-700 dark:text-green-300';
    case 'cancelled':
      return 'bg-destructive/20 text-destructive';
    default:
      return 'bg-secondary/50 text-foreground';
  }
}

// Sortable task card component
function SortableTaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    data: { task, type: 'task' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/tasks/${task.id}`}>
        <Card className="bg-card cursor-grab shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing">
          <CardHeader className="p-3">
            <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
            <CardDescription className="text-xs">
              {truncateDescription(task.description)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Badge variant="outline" className={`text-xs ${getTypeColor(task.type)}`}>
              {task.type}
            </Badge>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

// Drag overlay component (shows while dragging)
function TaskDragOverlay({ task }: { task: Task }) {
  return (
    <Card className="bg-card rotate-3 cursor-grabbing shadow-lg">
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
        <CardDescription className="text-xs">
          {truncateDescription(task.description)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Badge variant="outline" className={`text-xs ${getTypeColor(task.type)}`}>
          {task.type}
        </Badge>
      </CardContent>
    </Card>
  );
}

// Column component for each status - now droppable
function KanbanColumn({
  status,
  tasks,
  activeId,
}: {
  status: string;
  tasks: Task[];
  activeId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  });

  return (
    <div className="bg-muted/30 flex min-w-[280px] flex-col rounded-lg">
      <div className={`rounded-t-lg p-3 ${getColumnHeaderColor(status)}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{status}</h3>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[200px] flex-1 space-y-2 p-2 transition-colors ${isOver ? 'bg-primary/5' : ''}`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} isDragging={activeId === task.id} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-muted-foreground py-8 text-center text-sm">Drop tasks here</div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks: initialTasks }: { tasks: Task[] }) {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Sync with external tasks prop
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Status columns from TaskStatus enum
  const columns = TaskStatus.options;

  // Group tasks by status
  const tasksByStatus = columns.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Mutation for updating task status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: string }) => {
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
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update task');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Find which column a task is in
  const findColumn = (taskId: string): string | null => {
    for (const status of columns) {
      if (tasksByStatus[status].some((t) => t.id === taskId)) {
        return status;
      }
    }
    return null;
  };

  // Check if the id is a column status
  const isColumn = (id: string): boolean => {
    return columns.includes(id as any);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // Find the columns
    const activeColumn = findColumn(activeTaskId);
    // If overId is a column, use it directly, otherwise find the column of the task
    const overColumn = isColumn(overId) ? overId : findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return;
    }

    // Move task to new column (optimistic update)
    setTasks((prev) =>
      prev.map((task) => (task.id === activeTaskId ? { ...task, status: overColumn } : task)),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // Find where the task is now (after handleDragOver updates)
    const currentColumn = findColumn(activeTaskId);
    // Determine target column - if overId is a column, use it; otherwise find the column of the target task
    const overColumn = isColumn(overId) ? overId : findColumn(overId);

    if (!currentColumn || !overColumn) return;

    // If dropped in a different column from original, update status in database
    const originalTask = initialTasks.find((t) => t.id === activeTaskId);
    if (originalTask && originalTask.status !== currentColumn) {
      updateStatusMutation.mutate({ taskId: activeTaskId, newStatus: currentColumn });
    }

    // Reorder within the same column (only if dropping on another task, not a column)
    if (currentColumn === overColumn && activeTaskId !== overId && !isColumn(overId)) {
      const columnTasks = tasksByStatus[currentColumn];
      const oldIndex = columnTasks.findIndex((t) => t.id === activeTaskId);
      const newIndex = columnTasks.findIndex((t) => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        setTasks((prev) => {
          const otherTasks = prev.filter((t) => t.status !== currentColumn);
          return [...otherTasks, ...reordered];
        });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            activeId={activeId}
          />
        ))}
      </div>
      <DragOverlay>{activeTask && <TaskDragOverlay task={activeTask} />}</DragOverlay>
    </DndContext>
  );
}
