"use client";

import React, { useEffect, useState } from "react";

type User = { id: string; email: string };

export default function MvpApp() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projectName, setProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");

  useEffect(() => {
    const e = localStorage.getItem("mvp_email") || "";
    if (e) {
      setEmail(e);
      fetchLogin(e);
    }
  }, []);

  async function fetchLogin(e: string) {
    const res = await fetch("/api/auth", {
      method: "POST",
      body: JSON.stringify({ email: e }),
    });

    const data = await res.json();

    setUser(data.user);

    localStorage.setItem("mvp_email", e);

    refreshLists(e);
  }

  async function refreshLists(userEmail?: string) {
    const u = userEmail || email;
    const [pRes, tRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/tasks"),
    ]);
    const pJson = await pRes.json();
    const tJson = await tRes.json();
    setProjects(pJson.projects || []);
    setTasks(tJson.tasks || []);
  }

  async function createProject() {
    if (!projectName) return;
    await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name: projectName, user_email: email }),
    });
    setProjectName("");
    refreshLists();
  }

  async function createTask() {
    if (!taskTitle) return;
    await fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: taskTitle, user_email: email }),
    });
    setTaskTitle("");
    refreshLists();
  }

  async function startStop(taskId: string, action: "start" | "stop") {
    await fetch("/api/time-logs", {
      method: "POST",
      body: JSON.stringify({ action, task_id: taskId, user_email: email }),
    });
    // no need to refresh lists for MVP
  }

  async function getReport() {
    const res = await fetch(`/api/reports/daily`);
    const j = await res.json();
    alert(`Total hours today: ${j.totalHours.toFixed(2)}`);
  }

  if (!user)
    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Login — email only</h2>
        <input
          className="input"
          placeholder="you@domain"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="mt-3">
          <button className="btn" onClick={() => fetchLogin(email)}>
            Sign in
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Signed in as {user.email}</h3>
        <button
          className="text-sm text-muted-foreground"
          onClick={() => {
            localStorage.removeItem("mvp_email");
            setUser(null);
            setEmail("");
          }}
        >
          Sign out
        </button>
      </div>

      <section className="mb-6">
        <h4 className="font-medium">Projects</h4>
        <div className="flex gap-2 mt-2">
          <input
            className="input"
            placeholder="New project"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <button className="btn" onClick={createProject}>
            Add
          </button>
        </div>
        <ul className="mt-3">
          {projects.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h4 className="font-medium">Tasks</h4>
        <div className="flex gap-2 mt-2">
          <input
            className="input"
            placeholder="New task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <button className="btn" onClick={createTask}>
            Add
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-muted-foreground">
                  {t.status} • {t.type}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn"
                  onClick={() => startStop(t.id, "start")}
                >
                  Start
                </button>
                <button className="btn" onClick={() => startStop(t.id, "stop")}>
                  Stop
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex gap-2">
        <button className="btn" onClick={getReport}>
          Show Today Report
        </button>
        <button className="btn" onClick={() => refreshLists()}>
          Refresh
        </button>
      </div>
    </div>
  );
}
