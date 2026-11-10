
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Hotel,
  Loader2,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";
import api from "@/lib/api";

interface Booking {
  id: number;
  roomId: number;
  roomNumber?: string;
  customerName?: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  paymentStatus?: string;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelLoading, setCancelLoading] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // GET http://localhost:8080/api/bookings/my
      const response = await api.get("/bookings/my");

      if (Array.isArray(response.data)) {
        setBookings(response.data);
      } else {
        setBookings([]);
        setError("Unexpected response received from the server.");
      }
    } catch (err: any) {
      console.error("Fetch bookings error:", err);

      if (err?.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err?.response?.status === 403) {
        setError("Customer access is required to view your bookings.");
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to load bookings. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  const cancelBooking = async (bookingId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      setCancelLoading(bookingId);
      setError("");
      setSuccess("");

      // PUT /api/bookings/{id}/cancel
      await api.put(`/bookings/${bookingId}/cancel`);

      setSuccess(`Booking #${bookingId} cancelled successfully.`);
      await fetchBookings();
    } catch (err: any) {
      console.error("Cancel booking error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to cancel this booking. Please try again."
      );
    } finally {
      setCancelLoading(null);
    }
  };

  const formatDate = (value: string) => {
    if (!value) return "—";

    const date = new Date(`${value}T00:00:00`);

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const statusClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin" size={36} />
        <span className="ml-3 text-gray-600">
          Loading your bookings...
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/hotels"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          Browse hotels
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Bookings
            </h1>
            <p className="mt-2 text-gray-600">
              View and manage your hotel reservations.
            </p>
          </div>

          <button
            onClick={() => void fetchBookings()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-100"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"
          >
            {success}
          </div>
        )}

        {!error && bookings.length === 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
            <Hotel
              size={48}
              className="mx-auto text-gray-400"
            />
            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No bookings yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-gray-600">
              Your reservations will appear here after you successfully
              book a room.
            </p>
            <Link
              href="/hotels"
              className="mt-6 inline-flex rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-700"
            >
              Explore Hotels
            </Link>
          </section>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => {
              const status = booking.status?.toUpperCase() || "UNKNOWN";
              const canCancel =
                status === "PENDING" || status === "CONFIRMED";

              return (
                <article
                  key={booking.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Booking #{booking.id}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-gray-900">
                        Room {booking.roomNumber || booking.roomId}
                      </h2>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClass(status)}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <CalendarDays
                        size={20}
                        className="mt-1 text-gray-500"
                      />
                      <div>
                        <p className="text-sm text-gray-500">
                          Check-in
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatDate(booking.checkInDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarDays
                        size={20}
                        className="mt-1 text-gray-500"
                      />
                      <div>
                        <p className="text-sm text-gray-500">
                          Check-out
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatDate(booking.checkOutDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users
                        size={20}
                        className="mt-1 text-gray-500"
                      />
                      <div>
                        <p className="text-sm text-gray-500">
                          Guests
                        </p>
                        <p className="font-medium text-gray-900">
                          {booking.numberOfGuests}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Total price
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(booking.totalPrice)}
                      </p>
                    </div>
                  </div>

                  {booking.paymentStatus && (
                    <p className="mt-4 text-sm text-gray-600">
                      Payment status: {booking.paymentStatus}
                    </p>
                  )}

                  {canCancel && (
                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <button
                        onClick={() => void cancelBooking(booking.id)}
                        disabled={cancelLoading === booking.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cancelLoading === booking.id ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <XCircle size={17} />
                        )}
                        {cancelLoading === booking.id
                          ? "Cancelling..."
                          : "Cancel booking"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}