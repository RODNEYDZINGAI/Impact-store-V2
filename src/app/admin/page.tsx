"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  counts: {
    products: number;
    orders: number;
    users: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  orderStatus: {
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
  };
  recentOrders: {
    _id: string;
    total: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
  }[];
  lowStockProducts: {
    _id: string;
    name: string;
    stock: number;
  }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-amber/10 text-amber",
  confirmed: "bg-blue-500/10 text-blue-400",
  shipped: "bg-violet/10 text-violet",
  delivered: "bg-emerald/10 text-emerald",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-steel border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-white">Failed to load dashboard data</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="card-shine rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-6 text-white shadow-lg shadow-emerald/20">
          <p className="text-sm text-emerald-100">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold">
            R{data.revenue.total.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center text-sm">
            <span
              className={`mr-1 ${
                data.revenue.growth >= 0 ? "text-emerald-200" : "text-red-200"
              }`}
            >
              {data.revenue.growth >= 0 ? "↑" : "↓"} {Math.abs(data.revenue.growth)}%
            </span>
            <span className="text-emerald-200">vs last month</span>
          </div>
        </div>

        {/* This Month Revenue */}
        <div className="card-shine rounded-2xl bg-gradient-to-br from-royal to-steel p-6 text-white shadow-lg shadow-royal/20">
          <p className="text-sm text-blue-200">This Month</p>
          <p className="mt-2 text-3xl font-bold">
            R{data.revenue.thisMonth.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-blue-200">
            {new Date().toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Total Orders */}
        <div className="card-shine rounded-2xl bg-gradient-to-br from-violet to-violet-bright p-6 text-white shadow-lg shadow-violet/20">
          <p className="text-sm text-purple-200">Total Orders</p>
          <p className="mt-2 text-3xl font-bold">{data.counts.orders}</p>
          <div className="mt-2 flex gap-3 text-xs">
            <span className="text-purple-200">{data.orderStatus.pending} pending</span>
            <span className="text-purple-200">{data.orderStatus.shipped} shipped</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="card-shine rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-white shadow-lg shadow-orange/20">
          <p className="text-sm text-orange-100">Customers</p>
          <p className="mt-2 text-3xl font-bold">{data.counts.users}</p>
          <p className="mt-2 text-sm text-orange-100">Registered accounts</p>
        </div>
      </div>

      {/* Products & Order Status */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Products Overview */}
        <div className="rounded-2xl border border-white/[0.06] bg-navy-light p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Products</h3>
            <Link
              href="/admin/products"
              className="text-sm text-steel hover:text-violet-bright"
            >
              View All →
            </Link>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 text-2xl font-bold text-gold">
              {data.counts.products}
            </div>
            <div>
              <p className="text-sm text-gray-400">Total products</p>
              <p className="text-sm text-gray-500">
                {data.lowStockProducts.length > 0 && (
                  <span className="text-amber">{data.lowStockProducts.length} low stock</span>
                )}
              </p>
            </div>
          </div>

          {data.lowStockProducts.length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider text-gray-500">Low Stock Alert</p>
              <div className="mt-2 space-y-2">
                {data.lowStockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"
                  >
                    <span className="truncate text-sm text-gray-300">{product.name}</span>
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                      {product.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="rounded-2xl border border-white/[0.06] bg-navy-light p-6">
          <h3 className="font-semibold text-white">Order Status</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/[0.02] p-4 text-center">
              <p className="text-2xl font-bold text-amber">{data.orderStatus.pending}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
            <div className="rounded-xl bg-white/[0.02] p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{data.orderStatus.confirmed}</p>
              <p className="text-xs text-gray-400">Confirmed</p>
            </div>
            <div className="rounded-xl bg-white/[0.02] p-4 text-center">
              <p className="text-2xl font-bold text-violet">{data.orderStatus.shipped}</p>
              <p className="text-xs text-gray-400">Shipped</p>
            </div>
            <div className="rounded-xl bg-white/[0.02] p-4 text-center">
              <p className="text-2xl font-bold text-emerald">{data.orderStatus.delivered}</p>
              <p className="text-xs text-gray-400">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Recent Orders</h3>
          <Link
            href="/admin/orders"
            className="text-sm text-steel hover:text-violet-bright"
          >
            View All →
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {data.recentOrders.map((order) => (
            <div
              key={order._id}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-navy-light px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-500">{order.user?.name || "Guest"}</p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    statusColors[order.status] || "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {order.status}
                </span>
                <span className="font-medium text-white">
                  R{order.total.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
