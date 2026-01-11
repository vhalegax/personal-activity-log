import { z } from 'zod';

// Task status enum
export const TaskStatus = z.enum(['To Do', 'In Progress', 'Review', 'Done', 'Cancelled']);

// Task type enum
export const TaskType = z.enum(['Working', 'Learning', 'Other']);

// Create Task Schema
export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'Title must be at least 3 characters' })
    .max(255, { message: 'Title must be less than 255 characters' }),
  description: z
    .string()
    .trim()
    .max(50000, { message: 'Description must be less than 50000 characters' })
    .optional()
    .nullable(),
  type: TaskType.default('Working'),
  parent_task_id: z.string().uuid().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  requester: z.string().trim().max(255).optional().nullable(),
  pic: z.string().trim().max(255).optional().nullable(),
  status: TaskStatus.default('To Do'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

// Update Task Schema (same as create but all fields optional except what user wants to update)
export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// Filter Tasks Schema
export const filterTasksSchema = z.object({
  search: z.string().trim().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  project_id: z.string().uuid().optional(),
  requester: z.string().optional(),
  pic: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
});

export type FilterTasksInput = z.infer<typeof filterTasksSchema>;
