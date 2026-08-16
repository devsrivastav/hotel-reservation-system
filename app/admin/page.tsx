"use client";

import { useEffect, useState } from "react";
import {
  Hotel,
  BedDouble,
  CalendarCheck,
  CreditCard,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";

type DashboardData = {
  totalHotels?: number;
  totalRooms?: number;
  totalBookings?: number;
  totalPayments?: number;
  totalRevenue?: number;
  [key: string]: any;
};

type Payment = {
  id?: number;
  amount?: number;
  status?: string;
  paymentStatus?: string;
  bookingId?: number;
  createdAt?: string;
  paidAt?: string;
  [key: string]: any;
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [dashboardError, setDashboardError] =
    useState("");

  const [paymentsError, setPaymentsError] =
    useState("");

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
  setLoading(true);

  setError("");
  setDashboardError("");
  setPaymentsError("");

  try {
    // =====================================================
    // CHECK TOKEN
    // =====================================================

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    console.log(
      "========================================"
    );

    console.log(
      "ADMIN DASHBOARD REQUEST"
    );

    console.log(
      "API BASE URL:",
      api.defaults.baseURL
    );

    console.log(
      "TOKEN EXISTS:",
      !!token
    );

    console.log(
      "TOKEN LENGTH:",
      token?.length || 0
    );

    console.log(
      "========================================"
    );

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    // =====================================================
    // DASHBOARD
    // =====================================================

    try {
      const dashboardResponse =
        await api.get(
          "/admin/dashboard"
        );

      console.log(
        "ADMIN DASHBOARD SUCCESS:",
        dashboardResponse.data
      );

      setDashboard(
        dashboardResponse.data
      );

    } catch (dashboardErr: any) {

      console.error(
        "ADMIN DASHBOARD ERROR:",
        dashboardErr
      );

      console.error(
        "STATUS:",
        dashboardErr?.response?.status
      );

      console.error(
        "URL:",
        dashboardErr?.config?.url
      );

      console.error(
        "AUTH HEADER PRESENT:",
        !!dashboardErr?.config?.headers?.Authorization
      );

      console.error(
        "RESPONSE:",
        dashboardErr?.response?.data
      );

      const status =
        dashboardErr?.response?.status;

      const message =
        dashboardErr?.response?.data?.message ||
        dashboardErr?.response?.data?.error ||
        dashboardErr?.message ||
        "Unable to load admin dashboard.";

      setDashboardError(
        `Dashboard API failed${
          status ? ` (${status})` : ""
        }: ${message}`
      );
    }

    // =====================================================
    // PAYMENTS
    // =====================================================

    try {
      const paymentsResponse =
        await api.get("/payments");

      console.log(
        "PAYMENTS SUCCESS:",
        paymentsResponse.data
      );

      const paymentData =
        paymentsResponse.data;

      if (Array.isArray(paymentData)) {
        setPayments(paymentData);
      } else if (
        Array.isArray(paymentData?.content)
      ) {
        setPayments(
          paymentData.content
        );
      } else if (
        Array.isArray(paymentData?.data)
      ) {
        setPayments(
          paymentData.data
        );
      } else {
        setPayments([]);
      }

    } catch (paymentsErr: any) {

      console.error(
        "PAYMENTS ERROR:",
        paymentsErr
      );

      console.error(
        "STATUS:",
        paymentsErr?.response?.status
      );

      console.error(
        "URL:",
        paymentsErr?.config?.url
      );

      console.error(
        "AUTH HEADER PRESENT:",
        !!paymentsErr?.config?.headers?.Authorization
      );

      console.error(
        "RESPONSE:",
        paymentsErr?.response?.data
      );

      const status =
        paymentsErr?.response?.status;

      const message =
        paymentsErr?.response?.data?.message ||
        paymentsErr?.response?.data?.error ||
        paymentsErr?.message ||
        "Unable to load payments.";

      setPaymentsError(
        `Payments API failed${
          status ? ` (${status})` : ""
        }: ${message}`
      );
    }

  } catch (err: any) {

    console.error(
      "Dashboard loading error:",
      err
    );

    setError(
      err?.response?.data?.message ||
      err?.message ||
      "Unable to load dashboard."
    );

  } finally {
    setLoading(false);
  }
};
  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // CALCULATE PAYMENT STATS
  // =====================================================

  const paidPayments =
    payments.filter(
      (payment) =>
        String(
          payment.status ||
            payment.paymentStatus ||
            ""
        ).toUpperCase() === "PAID"
    );

  const paymentRevenue =
    paidPayments.reduce(
      (total, payment) =>
        total +
        Number(payment.amount || 0),
      0
    );

  // =====================================================
  // STATS
  // =====================================================

  const stats = [
    {
      title: "Total Hotels",
      value:
        dashboard?.totalHotels ?? "—",
      icon: Hotel,
    },
    {
      title: "Total Rooms",
      value:
        dashboard?.totalRooms ?? "—",
      icon: BedDouble,
    },
    {
      title: "Total Bookings",
      value:
        dashboard?.totalBookings ?? "—",
      icon: CalendarCheck,
    },
    {
      title: "Total Payments",
      value:
        dashboard?.totalPayments ??
        payments.length,
      icon: CreditCard,
    },
  ];

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 lg:p-10">

        <div className="mx-auto max-w-7xl">

          <div className="animate-pulse">

            <div className="h-8 w-64 rounded bg-gray-200" />

            <div className="mt-3 h-4 w-96 rounded bg-gray-200" />

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-32 rounded-2xl bg-gray-200"
                  />
                )
              )}

            </div>

          </div>

        </div>

      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50 p-6 lg:p-10">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your StayEase hotel
              reservation system.
            </p>

          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            className="flex w-fit items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <RefreshCw size={17} />

            Refresh
          </button>

        </div>

        {/* =================================================
            GENERAL ERROR
        ================================================= */}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm">
              {error}
            </p>

          </div>
        )}

        {/* =================================================
            DASHBOARD API ERROR
        ================================================= */}

        {dashboardError && (
          <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-orange-600"
              />

              <div>

                <p className="font-semibold text-orange-800">
                  Dashboard API Error
                </p>

                <p className="mt-1 text-sm text-orange-700">
                  {dashboardError}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>

                  </div>

                  <div className="rounded-xl bg-gray-100 p-3">

                    <Icon
                      size={22}
                      className="text-gray-700"
                    />

                  </div>

                </div>

              </div>
            );
          })}

        </div>

        {/* =================================================
            REVENUE
        ================================================= */}

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-gray-500">
            Paid Revenue
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₹
            {Number(
              dashboard?.totalRevenue ??
                paymentRevenue
            ).toLocaleString("en-IN")}
          </p>

        </div>

        {/* =================================================
            PAYMENTS ERROR
        ================================================= */}

        {paymentsError && (
          <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-orange-600"
              />

              <div>

                <p className="font-semibold text-orange-800">
                  Payments API Error
                </p>

                <p className="mt-1 text-sm text-orange-700">
                  {paymentsError}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            RECENT PAYMENTS
        ================================================= */}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 p-6">

            <h2 className="text-xl font-bold text-gray-900">
              Recent Payments
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Latest payment transactions.
            </p>

          </div>

          {payments.length === 0 ? (
            <div className="p-10 text-center">

              <CreditCard
                size={35}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 font-medium text-gray-600">
                No payments found
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-gray-200 bg-gray-50">

                  <tr>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Payment ID
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Booking ID
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {payments
                    .slice(0, 10)
                    .map(
                      (
                        payment,
                        index
                      ) => {

                        const status =
                          String(
                            payment.status ||
                              payment.paymentStatus ||
                              "UNKNOWN"
                          ).toUpperCase();

                        return (
                          <tr
                            key={
                              payment.id ??
                              index
                            }
                            className="hover:bg-gray-50"
                          >

                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {payment.id ??
                                "—"}
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-600">
                              {payment.bookingId ??
                                "—"}
                            </td>

                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              ₹
                              {Number(
                                payment.amount ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </td>

                            <td className="px-6 py-4">

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  status ===
                                  "PAID"
                                    ? "bg-green-100 text-green-700"
                                    : status ===
                                      "FAILED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {status}
                              </span>

                            </td>

                            <td className="px-6 py-4 text-sm text-gray-500">
                              {payment.paidAt ||
                                payment.createdAt
                                ? new Date(
                                    payment.paidAt ||
                                      payment.createdAt!
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )
                                : "—"}
                            </td>

                          </tr>
                        );
                      }
                    )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </main>
  );
}