export type ID = string;

export type User = {
  id: ID;
  email: string;
  created_at: string;
};

export type Project = {
  id: ID;
  name: string;
  created_by: ID;
  deleted_at?: string | null;
  created_at: string;
};

export type Task = {
  id: ID;
  title: string;
  description?: string;
  project_id?: ID | null;
  requester?: string | null;
  pic?: string | null;
  status: "To Do" | "Progress" | "Review" | "Done" | "Cancelled";
  type: "Working" | "Learning" | "Other";
  created_by: ID;
  deleted_at?: string | null;
  created_at: string;
};

export type TimeLog = {
  id: ID;
  task_id: ID;
  user_id: ID;
  start_at: string;
  end_at?: string | null;
};

function id(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// Simple in-memory store. Reset on refresh.
export const db = {
  users: [] as User[],
  projects: [] as Project[],
  tasks: [] as Task[],
  timeLogs: [] as TimeLog[],

  findOrCreateUserByEmail(email: string) {
    let u = this.users.find(
      (x) => x.email.toLowerCase() === email.toLowerCase()
    );

    if (!u) {
      u = { id: id("user"), email, created_at: new Date().toISOString() };
      this.users.push(u);
    }

    return u;
  },
};

export const helpers = {
  now() {
    return new Date().toISOString();
  },

  softDelete<T extends { deleted_at?: string | null }>(item: T) {
    item.deleted_at = new Date().toISOString();
  },
};
