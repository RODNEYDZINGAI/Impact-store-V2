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
  referralStats?: {
    usageCount: number;
    revenue: number;
    discountIssued: number;
  };
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

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#1f4f8f]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Users</h1>
      <p className="mt-1 text-slate-500">{users.length} registered customers</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-white text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Referral</th>
              <th className="px-4 py-3">Referral Uses</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr
                key={user._id}
                className="cursor-pointer transition hover:bg-slate-100"
                onClick={() => router.push(`/admin/users/${user._id}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-royal to-steel text-xs font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-700">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      user.emailVerified
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {!!user.referralEnabled && user.referralCode ? (
                    <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                      {user.referralCode}
                    </span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {user.referralStats?.usageCount ?? 0}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {user.address
                    ? `${user.address.city}, ${user.address.province}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString("en-ZA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
