"use client";

import { DemoDashboard } from "@/components/Demo/DemoDashboard";

export default function DemoPage() {
  return (
    <div className="bg-background text-foreground min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold">Demo Dashboard</h1>
        <DemoDashboard />
      </div>
    </div>
  );
}
