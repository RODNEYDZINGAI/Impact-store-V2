"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  referralEnabled: boolean;
  referralCode?: string;
  banned?: boolean;
  banReason?: string;
  createdAt: string;
  address?: {
    city: string;
    province: string;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = () => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchUsers, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const updateUserStatus = async (user: User, banned: boolean) => {
    const reason = banned ? window.prompt("Reason for banning this user?", user.banReason || "") : "";
    if (banned && reason === null) return;

    setActionLoading(user._id);
    const response = await fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, banned, banReason: reason }),
    });
    const data = await response.json();
    if (response.ok) {
      setUsers((current) =>
        current.map((item) => (item._id === user._id ? { ...item, ...data.user } : item))
      );
    } else {
      alert(data.error || "Failed to update user");
    }
    setActionLoading(null);
  };

  const deleteUser = async (user: User) => {
    if (!confirm(`Delete ${user.name}? This is only allowed when the customer has no orders.`)) return;

    setActionLoading(user._id);
    const response = await fetch(`/api/users?id=${user._id}`, { method: "DELETE" });
    const data = await response.json();
    if (response.ok) {
      setUsers((current) => current.filter((item) => item._id !== user._id));
    } else {
      alert(data.error || "Failed to delete user");
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-steel border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Users</h1>
      <p className="mt-1 text-gray-500">{users.length} registered customers</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/[0.06]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] bg-navy-light text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Referral</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {users.map((user) => (
              <tr key={user._id} className="transition hover:bg-white/[0.04]">
                <td className="px-4 py-3">
                  <div
                    className="flex cursor-pointer items-center gap-3"
                    onClick={() => router.push(`/admin/users/${user._id}`)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-royal to-steel text-xs font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-200">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      user.banned
                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                        : user.emailVerified
                        ? "border-emerald/30 bg-emerald/10 text-emerald"
                        : "border-amber/30 bg-amber/10 text-amber"
                    }`}
                  >
                    {user.banned ? "Banned" : user.emailVerified ? "Verified" : "Unverified"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {!!user.referralEnabled && user.referralCode ? (
                    <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                      {user.referralCode}
                    </span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {user.address
                    ? `${user.address.city}, ${user.address.province}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("en-ZA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={actionLoading === user._id}
                      onClick={() => updateUserStatus(user, !user.banned)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                        user.banned
                          ? "bg-emerald/20 text-emerald hover:bg-emerald/30"
                          : "bg-amber/20 text-amber hover:bg-amber/30"
                      }`}
                    >
                      {user.banned ? "Unban" : "Ban"}
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading === user._id}
                      onClick={() => deleteUser(user)}
                      className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/30 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
