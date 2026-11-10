"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  Hotel,
  IndianRupee,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";
import api from "@/lib/api";

type DashboardData = {
  totalUsers: number;
  totalHotels: number;
  totalRooms: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
};

const EMPTY_DASHBOARD: DashboardData = {
  totalUsers: 0,
  totalHotels: 0,
  totalRooms: 0,
  totalBookings: 0,
  confirmedBookings: 0,
  cancelledBookings: 0,
  totalRevenue: 0,
};

function toNumber(value: unknown): number {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getErrorMessage(error: any): string {
  const status = error?.response?.status;

  if (status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (status === 403) {
    return "Access denied. Sign in with an ADMIN or SUPER_ADMIN account.";
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    "Unable to load dashboard data. Check that the backend is running."
  );
}

function StatCard({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  helper: string;
  icon: typeof Users;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{helper}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          <Icon size={22} aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof Hotel;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 sm:p-6"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-xl bg-slate-100 p-3 text-slate-800">
          <Icon size={23} aria-hidden="true" />
        </span>
        <ArrowRight
          size={19}
          className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900"
          aria-hidden="true"
        />
      </div>
      <h3 className="mt-5 font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchDashboard = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      // api.ts should already add the /api base path and attach the JWT token.
      const response = await api.get("/admin/dashboard");
      const data = response?.data ?? {};

      setDashboard({
        totalUsers: toNumber(data.totalUsers),
        totalHotels: toNumber(data.totalHotels),
        totalRooms: toNumber(data.totalRooms),
        totalBookings: toNumber(data.totalBookings),
        confirmedBookings: toNumber(data.confirmedBookings),
        cancelledBookings: toNumber(data.cancelledBookings),
        totalRevenue: toNumber(data.totalRevenue),
      });
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch (requestError: any) {
      console.error("Admin dashboard request failed:", requestError);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const formatter = new Intl.NumberFormat("en-IN");
  const moneyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

  const bookingCompletion =
    dashboard.totalBookings > 0
      ? Math.round(
          (dashboard.confirmedBookings / dashboard.totalBookings) * 100
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              StayEase · Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Monitor hotel inventory, customer bookings, and platform revenue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-slate-500">
                Updated {lastUpdated}
              </span>
            )}
            <button
              type="button"
              onClick={() => void fetchDashboard(true)}
              disabled={loading || refreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
                aria-hidden="true"
              />
              {refreshing ? "Refreshing..." : "Refresh data"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950"
          >
            <AlertCircle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Dashboard data could not be loaded</p>
              <p className="mt-1 text-sm leading-6">{error}</p>
              <button
                type="button"
                onClick={() => void fetchDashboard(true)}
                className="mt-3 text-sm font-semibold underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <section aria-label="Loading dashboard" className="animate-pulse">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
            <div className="mt-9 h-5 w-48 rounded bg-slate-200" />
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-36 rounded-2xl bg-slate-200" />
              ))}
            </div>
          </section>
        ) : (
          <>
            <section aria-labelledby="overview-heading">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2
                    id="overview-heading"
                    className="text-lg font-bold text-slate-950"
                  >
                    Platform overview
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Live totals returned by the StayEase backend.
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  Admin summary
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total users"
                  value={formatter.format(dashboard.totalUsers)}
                  helper="Registered accounts"
                  icon={Users}
                />
                <StatCard
                  title="Hotels"
                  value={formatter.format(dashboard.totalHotels)}
                  helper="Hotels in the system"
                  icon={Hotel}
                />
                <StatCard
                  title="Rooms"
                  value={formatter.format(dashboard.totalRooms)}
                  helper="Rooms in the inventory"
                  icon={BedDouble}
                />
                <StatCard
                  title="Total bookings"
                  value={formatter.format(dashboard.totalBookings)}
                  helper="All recorded bookings"
                  icon={CalendarCheck}
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-emerald-800">
                        Confirmed bookings
                      </p>
                      <p className="mt-2 text-3xl font-bold text-emerald-950">
                        {formatter.format(dashboard.confirmedBookings)}
                      </p>
                    </div>
                    <CheckCircle2 size={27} className="text-emerald-700" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-xs text-emerald-800">
                    {bookingCompletion}% of all bookings
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-rose-800">
                        Cancelled bookings
                      </p>
                      <p className="mt-2 text-3xl font-bold text-rose-950">
                        {formatter.format(dashboard.cancelledBookings)}
                      </p>
                    </div>
                    <XCircle size={27} className="text-rose-700" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-xs text-rose-800">
                    Bookings marked cancelled
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Total revenue
                      </p>
                      <p className="mt-2 break-words text-2xl font-bold text-slate-950 sm:text-3xl">
                        {moneyFormatter.format(dashboard.totalRevenue)}
                      </p>
                    </div>
                    <span className="rounded-xl bg-slate-100 p-3 text-slate-800">
                      <IndianRupee size={23} aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Value returned by the existing dashboard API
                  </p>
                </div>
              </div>
            </section>

            <section aria-labelledby="actions-heading" className="mt-10">
              <div>
                <h2 id="actions-heading" className="text-lg font-bold text-slate-950">
                  Quick actions
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Open a management area to continue working.
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <QuickAction
                  href="/admin/hotels"
                  title="Manage hotels"
                  description="Create hotel records, edit details, and manage hotel listings."
                  icon={Hotel}
                />
                <QuickAction
                  href="/admin/rooms"
                  title="Manage rooms"
                  description="Review room inventory and maintain room details."
                  icon={BedDouble}
                />
                <QuickAction
                  href="/admin/bookings"
                  title="Manage bookings"
                  description="Search bookings and review booking and payment statuses."
                  icon={CalendarCheck}
                />
              </div>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-100 p-3 text-slate-800">
                  <ArrowDownRight size={21} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">
                    Keep your dashboard up to date
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Use “Refresh data” after making changes in the hotel, room, or booking management pages.
                    Refund processing is intentionally not included in this dashboard update.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
