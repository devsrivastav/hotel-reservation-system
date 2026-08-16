"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  RefreshCw,
  Users,
  BedDouble,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Booking {
  id: number;
  roomId: number;
  roomNumber: string;
  userId: number;
  customerName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
}

type FilterType =
  | "ALL"
  | "CONFIRMED"
  | "CANCELLED";

export default function AdminBookingsPage() {
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [filter, setFilter] =
    useState<FilterType>("ALL");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // FETCH BOOKINGS
  // =====================================================

  const fetchBookings = async (
    selectedFilter: FilterType = filter
  ) => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (selectedFilter === "ALL") {
        response = await api.get(
          "/bookings/admin/all"
        );
      } else {
        response = await api.get(
          `/bookings/admin/status/${selectedFilter}`
        );
      }

      console.log(
        "Bookings:",
        response.data
      );

      setBookings(response.data);

    } catch (err: any) {
      console.error(
        "Bookings loading error:",
        err
      );

      if (
        err?.response?.status === 401
      ) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (
        err?.response?.status === 403
      ) {
        setError(
          "You don't have permission to access bookings."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to load bookings."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchBookings("ALL");
  }, []);

  // =====================================================
  // FILTER
  // =====================================================

  const handleFilterChange = (
    selectedFilter: FilterType
  ) => {
    setFilter(selectedFilter);
    fetchBookings(selectedFilter);
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (
    date: string
  ) => {
    if (!date) {
      return "-";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalBookings =
    bookings.length;

  const confirmedBookings =
    bookings.filter(
      (booking) =>
        booking.status ===
        "CONFIRMED"
    ).length;

  const cancelledBookings =
    bookings.filter(
      (booking) =>
        booking.status ===
        "CANCELLED"
    ).length;

  const totalRevenue =
    bookings
      .filter(
        (booking) =>
          booking.status ===
          "CONFIRMED"
      )
      .reduce(
        (total, booking) =>
          total +
          Number(
            booking.totalPrice || 0
          ),
        0
      );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">

        <div className="text-center">

          <Loader2
            size={40}
            className="mx-auto animate-spin text-gray-900"
          />

          <p className="mt-4 text-gray-700">
            Loading bookings...
          </p>

        </div>

      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-gray-950 px-6 py-10 text-white">

        <div className="mx-auto max-w-7xl">

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft
              size={17}
            />

            Back to Dashboard
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>

              <p className="text-sm text-gray-400">
                Administration
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                Booking Management
              </h1>

              <p className="mt-2 text-gray-400">
                View and manage customer bookings.
              </p>

            </div>

            <button
              onClick={() =>
                fetchBookings(
                  filter
                )
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-200"
            >

              <RefreshCw
                size={18}
              />

              Refresh

            </button>

          </div>

        </div>

      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Total Bookings
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalBookings}
                </p>

              </div>

              <div className="rounded-xl bg-gray-100 p-3">
                <CalendarDays
                  size={24}
                  className="text-gray-700"
                />
              </div>

            </div>

          </div>

          {/* CONFIRMED */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Confirmed
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {confirmedBookings}
                </p>

              </div>

              <div className="rounded-xl bg-green-100 p-3">
                <CalendarDays
                  size={24}
                  className="text-green-600"
                />
              </div>

            </div>

          </div>

          {/* CANCELLED */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Cancelled
                </p>

                <p className="mt-2 text-3xl font-bold text-red-600">
                  {cancelledBookings}
                </p>

              </div>

              <div className="rounded-xl bg-red-100 p-3">
                <CalendarDays
                  size={24}
                  className="text-red-600"
                />
              </div>

            </div>

          </div>

          {/* REVENUE */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  Confirmed Revenue
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  ₹
                  {totalRevenue.toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>

              <div className="rounded-xl bg-gray-100 p-3">
                <IndianRupee
                  size={24}
                  className="text-gray-700"
                />
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            FILTER
        ================================================= */}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Bookings
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Filter bookings by status.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                onClick={() =>
                  handleFilterChange(
                    "ALL"
                  )
                }
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  filter === "ALL"
                    ? "bg-gray-950 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                All
              </button>

              <button
                onClick={() =>
                  handleFilterChange(
                    "CONFIRMED"
                  )
                }
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  filter ===
                  "CONFIRMED"
                    ? "bg-green-600 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Confirmed
              </button>

              <button
                onClick={() =>
                  handleFilterChange(
                    "CANCELLED"
                  )
                }
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  filter ===
                  "CANCELLED"
                    ? "bg-red-600 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Cancelled
              </button>

            </div>

          </div>

        </div>

        {/* =================================================
            NO BOOKINGS
        ================================================= */}

        {bookings.length === 0 ? (

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-14 text-center shadow-sm">

            <CalendarDays
              size={60}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              No bookings found
            </h2>

            <p className="mt-2 text-gray-500">
              There are no bookings for the selected filter.
            </p>

          </div>

        ) : (

          /* =================================================
             BOOKING CARDS
          ================================================= */

          <div className="mt-6 space-y-5">

            {bookings.map(
              (booking) => (

                <div
                  key={booking.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >

                  <div className="p-6">

                    {/* TOP */}

                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                      <div>

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="text-xl font-bold text-gray-900">
                            Booking #
                            {
                              booking.id
                            }
                          </h3>

                          <span
                            className={`rounded-lg px-3 py-1 text-xs font-bold ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            {
                              booking.status
                            }
                          </span>

                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                          Customer ID:{" "}
                          {
                            booking.userId
                          }
                        </p>

                      </div>

                      <div className="text-left md:text-right">

                        <p className="text-sm text-gray-500">
                          Total Amount
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-900">
                          ₹
                          {Number(
                            booking.totalPrice ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>

                    </div>

                    {/* DIVIDER */}

                    <div className="my-6 border-t border-gray-200" />

                    {/* DETAILS */}

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                      {/* CUSTOMER */}

                      <div className="flex gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">

                          <Users
                            size={20}
                            className="text-gray-700"
                          />

                        </div>

                        <div>

                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Customer
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {
                              booking.customerName ||
                              "Unknown Customer"
                            }
                          </p>

                        </div>

                      </div>

                      {/* ROOM */}

                      <div className="flex gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">

                          <BedDouble
                            size={20}
                            className="text-gray-700"
                          />

                        </div>

                        <div>

                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Room
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {
                              booking.roomNumber
                            }
                          </p>

                          <p className="text-xs text-gray-500">
                            Room ID:{" "}
                            {
                              booking.roomId
                            }
                          </p>

                        </div>

                      </div>

                      {/* GUESTS */}

                      <div className="flex gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">

                          <Users
                            size={20}
                            className="text-gray-700"
                          />

                        </div>

                        <div>

                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Guests
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {
                              booking.numberOfGuests
                            }{" "}
                            {
                              booking.numberOfGuests ===
                              1
                                ? "Guest"
                                : "Guests"
                            }
                          </p>

                        </div>

                      </div>

                      {/* DATES */}

                      <div className="flex gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">

                          <CalendarDays
                            size={20}
                            className="text-gray-700"
                          />

                        </div>

                        <div>

                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Stay
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {
                              formatDate(
                                booking.checkInDate
                              )
                            }
                          </p>

                          <p className="text-xs text-gray-500">
                            to{" "}
                            {
                              formatDate(
                                booking.checkOutDate
                              )
                            }
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}