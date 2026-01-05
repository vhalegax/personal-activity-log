"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { z } from "zod";

const chartData = [
  { month: "Jan", sales: 4000, users: 2400 },
  { month: "Feb", sales: 3000, users: 1398 },
  { month: "Mar", sales: 2000, users: 9800 },
  { month: "Apr", sales: 2780, users: 3908 },
  { month: "May", sales: 1890, users: 4800 },
  { month: "Jun", sales: 2390, users: 3800 },
];

const tableData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    status: "Active",
    role: "Admin",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    status: "Active",
    role: "User",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    status: "Inactive",
    role: "User",
  },
];

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(5, "Message is too short"),
  username: z.string().min(3, "Username too short").max(32).optional(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  color: z.string().optional(),
  range: z.number().min(0).max(100).optional(),
  tags: z.string().optional(),
  image: z.any().optional(),
  captcha: z.boolean().optional(),
  hp: z.string().optional(),
  lat: z.string().optional(),
  lon: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

export function DemoDashboard() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    reset,
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rangeValue, setRangeValue] = useState<number>(50);

  const onSubmit = (data: ContactForm) => {
    if (data.hp) {
      console.warn("Spam detected (honeypot):", data.hp);
      alert("Spam detected — submission rejected");
      return;
    }

    console.log("Demo form submit:", data);
    reset();
    setImagePreview(null);
    alert("Demo form submitted — check console");
  };

  // Fake async username check
  const checkUsername = async (value?: string) => {
    if (!value) return;
    await new Promise((r) => setTimeout(r, 600));
    const taken = ["admin", "john", "jane"];
    if (taken.includes(value.toLowerCase())) {
      setError("username", { type: "manual", message: "Username already taken" });
    }
  };

  const handleImageChange = (files?: FileList) => {
    if (!files || files.length === 0) {
      setImagePreview(null);
      setValue("image", undefined);
      return;
    }
    const f = files[0];
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(f.type)) {
      setError("image", { type: "manual", message: "Invalid image type" });
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setError("image", { type: "manual", message: "Image too large (max 2MB)" });
      return;
    }
    const url = URL.createObjectURL(f);
    setImagePreview(url);
    setValue("image", f as any);
  };

  const fillGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setValue("lat", String(latitude));
        setValue("lon", String(longitude));
      },
      (err) => {
        console.error(err);
        alert("Unable to get location");
      },
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Report</CardTitle>
          <CardDescription>Sales and user growth (demo)</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke={"hsl(var(--chart-1))"}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke={"hsl(var(--chart-2))"}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Fake user data table</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        u.status === "Active"
                          ? "bg-accent text-accent-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }`}
                    >
                      {u.status}
                    </span>
                  </TableCell>
                  <TableCell>{u.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Separator />

      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Contact (Demo)</CardTitle>
          <CardDescription>React Hook Form + Zod validation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Honeypot (hidden) */}
            <input className="hidden" aria-hidden {...register("hp")} />

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...register("username")}
                onBlur={(e) => checkUsername(e.target.value)}
              />
              {errors.username && (
                <p className="text-destructive text-sm">{errors.username.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} placeholder="e.g. +628123..." />
              {errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
            </div>

            <div>
              <Label htmlFor="dob">Date of birth</Label>
              <Input id="dob" type="date" {...register("dob")} />
              {errors.dob && <p className="text-destructive text-sm">{errors.dob.message}</p>}
            </div>

            <div>
              <Label htmlFor="color">Favorite color</Label>
              <input
                id="color"
                type="color"
                className="mt-1 h-10 w-20 rounded-md border"
                {...register("color")}
              />
            </div>

            <div>
              <Label htmlFor="range">Satisfaction ({rangeValue}%)</Label>
              <input
                id="range"
                type="range"
                min={0}
                max={100}
                value={rangeValue}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setRangeValue(v);
                  setValue("range", v);
                }}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" {...register("tags")} placeholder="design,frontend" />
            </div>

            <div>
              <Label htmlFor="image">Image upload (png/jpg/webp, max 2MB)</Label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files ?? undefined)}
              />
              {errors.image && (
                <p className="text-destructive text-sm">{(errors.image as any).message}</p>
              )}
              {imagePreview && (
                <img src={imagePreview} alt="preview" className="mt-2 max-h-40 rounded" />
              )}
            </div>

            <div className="flex items-center space-x-3">
              <input id="captcha" type="checkbox" {...register("captcha")} />
              <Label htmlFor="captcha">I'm not a robot (demo)</Label>
            </div>

            <div>
              <Label>Geolocation</Label>
              <div className="flex gap-2">
                <Button type="button" onClick={fillGeolocation} variant={"default"}>
                  Get location
                </Button>
                <Input placeholder="lat" {...register("lat")} />
                <Input placeholder="lon" {...register("lon")} />
              </div>
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...register("email")} />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" {...register("message")} rows={4} />
              {errors.message && (
                <p className="text-destructive text-sm">{errors.message.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Send (Demo)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
