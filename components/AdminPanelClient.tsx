"use client";

import { useState } from "react";
import Link from "next/link";
import type { PublicUser } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Props = { users: PublicUser[] };

export function AdminPanelClient({ users: initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState(initialUsers[0]?.id || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function request(action: string) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", {
        method: action === "refresh" ? "GET" : "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "refresh" ? undefined : JSON.stringify({ action, userId: selectedUserId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Request failed.");
      if (action === "refresh") setUsers(data.items || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Admin</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">Admin dashboard</h1>
          <p className="mt-2 text-slate-600">View users, unlock achievements, and add sample weekly progress data.</p>
        </div>
        <Link href="/dashboard" className="btn-outline">Back to dashboard</Link>
      </div>

      {error && <div className="alert-error mb-6">{error}</div>}

      <section className="card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full max-w-md">
            <label htmlFor="selectedUser" className="label">Selected user</label>
            <select id="selectedUser" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary" disabled={saving} onClick={() => request("refresh")}>Refresh users</button>
            <button className="btn-outline" disabled={saving || !selectedUserId} onClick={() => request("unlock-achievements")}>Unlock all achievements</button>
            <button className="btn-primary" disabled={saving || !selectedUserId} onClick={() => request("add-sample-visualization-data")}>Add sample graph data</button>
          </div>
        </div>
      </section>

      <section className="mt-8 card p-6">
        <h2 className="section-title">Existing users</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 text-slate-700">
                  <td className="py-3 pr-4 font-medium text-slate-900">{user.name}</td>
                  <td className="py-3 pr-4">{user.email}</td>
                  <td className="py-3 pr-4 capitalize">{user.role}</td>
                  <td className="py-3 pr-4">{formatDate(user.joinedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
