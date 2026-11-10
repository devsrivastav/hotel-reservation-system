"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle, CalendarDays, CheckCircle2, Clock3, CreditCard,
  RefreshCw, Search, Users, X, BedDouble, IndianRupee,
} from "lucide-react";
import api from "@/lib/api";

type Booking = {
  id: number;
  roomId?: number | null;
  roomNumber?: string | null;
  userId?: number | null;
  customerName?: string | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  numberOfGuests?: number | null;
  totalPrice?: number | string | null;
  status?: string | null;
  paymentStatus?: string | null;
  paymentId?: number | null;
  razorpayPaymentId?: string | null;
};

type ApiError = {
  response?: { status?: number; data?: { message?: string; error?: string } };
  message?: string;
};

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"];
const PAYMENT_STATUSES = ["CREATED", "PENDING", "PAID", "FAILED", "REFUNDED"];

function normalize(value?: string | null): string {
  return String(value || "UNKNOWN").toUpperCase();
}

function asArray(data: any): Booking[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.bookings)) return data.bookings;
  throw new Error("Unexpected response from bookings API.");
}

function getError(error: ApiError): string {
  const status = error?.response?.status;
  if (status === 401) return "Your session expired. Please sign in again.";
  if (status === 403) return "Access denied. Sign in with an ADMIN or SUPER_ADMIN account.";
  return error?.response?.data?.message || error?.response?.data?.error ||
    error?.message || "Unable to load bookings. Check the backend and try again.";
}

function money(value?: number | string | null): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 2,
  }).format(amount);
}

function bookingStatusClasses(status: string): string {
  if (status === "CONFIRMED") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "CANCELLED") return "border-rose-200 bg-rose-50 text-rose-800";
  if (status === "PENDING") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

function paymentStatusClasses(status: string): string {
  if (status === "PAID") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "REFUNDED") return "border-violet-200 bg-violet-50 text-violet-800";
  if (status === "FAILED") return "border-rose-200 bg-rose-50 text-rose-800";
  if (status === "CREATED" || status === "PENDING") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

function dateLabel(value?: string | null): string {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("ALL");
  const [paymentStatus, setPaymentStatus] = useState("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchBookings = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      // Existing endpoint in BookingController; no duplicate endpoint is added.
      const response = await api.get("/bookings/admin/all");
      setBookings(asArray(response.data));
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch (requestError) {
      console.error("Admin bookings request failed:", requestError);
      setError(getError(requestError as ApiError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const confirmBooking = useCallback(async (booking: Booking) => {
    const status = normalize(booking.status);
    const payment = normalize(booking.paymentStatus);

    if (status !== "PENDING") {
      setError("Only pending bookings can be approved.");
      return;
    }
    if (payment !== "PAID") {
      setError("This booking cannot be approved until its payment status is PAID.");
      return;
    }
    if (!window.confirm(`Approve booking #${booking.id}?`)) return;

    setConfirmingId(booking.id);
    setError("");
    setSuccessMessage("");

    try {
      await api.put(`/bookings/admin/${booking.id}/confirm`);
      setSuccessMessage(`Booking #${booking.id} was approved successfully.`);
      await fetchBookings(true);
    } catch (requestError) {
      console.error("Booking approval failed:", requestError);
      setError(getError(requestError as ApiError));
    } finally {
      setConfirmingId(null);
    }
  }, [fetchBookings]);

  useEffect(() => { void fetchBookings(); }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const searchable = [
        booking.id, booking.userId, booking.roomId, booking.roomNumber,
        booking.customerName, booking.paymentId, booking.razorpayPaymentId,
      ].map((value) => String(value ?? "").toLowerCase()).join(" ");

      const matchesSearch = !query || searchable.includes(query);
      const matchesBookingStatus = bookingStatus === "ALL" || normalize(booking.status) === bookingStatus;
      const matchesPaymentStatus = paymentStatus === "ALL" || normalize(booking.paymentStatus) === paymentStatus;
      return matchesSearch && matchesBookingStatus && matchesPaymentStatus;
    });
  }, [bookings, search, bookingStatus, paymentStatus]);

  const confirmedCount = bookings.filter((b) => normalize(b.status) === "CONFIRMED").length;
  const pendingCount = bookings.filter((b) => normalize(b.status) === "PENDING").length;
  const cancelledCount = bookings.filter((b) => normalize(b.status) === "CANCELLED").length;
  const paidCount = bookings.filter((b) => normalize(b.paymentStatus) === "PAID").length;
  const totalBookingValue = bookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">StayEase · Administration</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Booking management</h1>
            <p className="mt-2 text-sm text-slate-600">Review reservations, guest details and recorded payment statuses.</p>
            {lastUpdated && <p className="mt-1 text-xs text-slate-400">Last updated {lastUpdated}</p>}
          </div>
          <button type="button" onClick={() => void fetchBookings(true)} disabled={loading || refreshing}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh bookings"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {successMessage && <div role="status" className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <CheckCircle2 size={20} className="shrink-0" />
          <p className="flex-1 text-sm font-medium">{successMessage}</p>
          <button type="button" onClick={() => setSuccessMessage("")} aria-label="Dismiss success message"><X size={18} /></button>
        </div>}

        {error && <div role="alert" className="mb-5 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1"><p className="font-semibold">Could not load bookings</p><p className="mt-1 text-sm leading-6">{error}</p></div>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error"><X size={18} /></button>
        </div>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500">Total bookings <CalendarDays size={19} /></div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{bookings.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500">Confirmed <CheckCircle2 size={19} className="text-emerald-700" /></div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{confirmedCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500">Pending <Clock3 size={19} className="text-amber-700" /></div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500">Paid payments <CreditCard size={19} className="text-emerald-700" /></div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{paidCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500">Cancelled <X size={19} className="text-rose-700" /></div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{cancelledCount}</p>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-medium text-slate-500">Total recorded booking value</p><p className="mt-1 text-2xl font-bold text-slate-950">{money(totalBookingValue)}</p></div>
            <p className="max-w-xl text-xs leading-5 text-slate-500">This is the sum of booking totals returned by the API, not verified collected revenue or net revenue after refunds.</p>
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div><h2 className="font-semibold text-slate-950">Reservations</h2><p className="mt-1 text-sm text-slate-500">{filteredBookings.length} of {bookings.length} bookings</p></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <label className="relative block">
                  <span className="sr-only">Search bookings</span>
                  <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search booking, guest, room..."
                    className="min-h-11 w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 xl:w-72" />
                </label>
                <label><span className="sr-only">Booking status</span>
                  <select value={bookingStatus} onChange={(e) => setBookingStatus(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
                    <option value="ALL">All booking statuses</option>{BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label><span className="sr-only">Payment status</span>
                  <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm">
                    <option value="ALL">All payment statuses</option>{PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
            </div>
          </div>

          {loading ? <div className="space-y-3 p-5" aria-label="Loading bookings">{[1, 2, 3, 4].map((n) => <div key={n} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}</div>
            : filteredBookings.length === 0 ? <div className="px-5 py-14 text-center"><CalendarDays size={30} className="mx-auto text-slate-400" /><p className="mt-3 font-semibold text-slate-900">No bookings found</p><p className="mt-1 text-sm text-slate-500">Try another search or filter.</p></div>
            : <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
                    <th className="px-5 py-3 font-semibold">Booking</th><th className="px-5 py-3 font-semibold">Guest</th><th className="px-5 py-3 font-semibold">Stay</th><th className="px-5 py-3 font-semibold">Guests / total</th><th className="px-5 py-3 font-semibold">Booking status</th><th className="px-5 py-3 font-semibold">Payment status</th><th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map((booking) => {
                      const bs = normalize(booking.status);
                      const ps = normalize(booking.paymentStatus);
                      return <tr key={booking.id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4"><p className="font-semibold text-slate-950">#{booking.id}</p><p className="mt-1 text-xs text-slate-500">Room #{booking.roomId ?? "—"} · {booking.roomNumber || "—"}</p></td>
                        <td className="px-5 py-4"><p className="font-medium text-slate-900">{booking.customerName || "Guest"}</p><p className="mt-1 text-xs text-slate-500">User #{booking.userId ?? "—"}</p></td>
                        <td className="px-5 py-4"><p className="text-slate-800">{dateLabel(booking.checkInDate)}</p><p className="mt-1 text-xs text-slate-500">to {dateLabel(booking.checkOutDate)}</p></td>
                        <td className="px-5 py-4"><p className="inline-flex items-center gap-1.5 font-semibold text-slate-900"><Users size={14} className="text-slate-400" />{booking.numberOfGuests ?? "—"}</p><p className="mt-1 text-xs text-slate-500">{money(booking.totalPrice)}</p></td>
                        <td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${bookingStatusClasses(bs)}`}>{bs}</span></td>
                        <td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${paymentStatusClasses(ps)}`}>{ps}</span></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {bs === "PENDING" && ps === "PAID" && (
                              <button type="button" onClick={() => void confirmBooking(booking)}
                                disabled={confirmingId !== null}
                                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                                <CheckCircle2 size={14} />
                                {confirmingId === booking.id ? "Approving..." : "Approve"}
                              </button>
                            )}
                            <button type="button" onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">{expandedId === booking.id ? "Hide" : "View details"}</button>
                          </div>
                        </td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredBookings.map((booking) => {
                  const bs = normalize(booking.status);
                  const ps = normalize(booking.paymentStatus);
                  const expanded = expandedId === booking.id;
                  return <article key={booking.id} className="p-4">
                    <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-950">Booking #{booking.id}</p><p className="mt-1 text-sm text-slate-600">{booking.customerName || "Guest"} · Room {booking.roomNumber || `#${booking.roomId ?? "—"}`}</p></div><span className={`rounded-full border px-2 py-1 text-xs font-semibold ${bookingStatusClasses(bs)}`}>{bs}</span></div>
                    <div className="mt-3 flex items-center justify-between gap-3"><div><p className="text-sm text-slate-800">{dateLabel(booking.checkInDate)} – {dateLabel(booking.checkOutDate)}</p><p className="mt-1 text-lg font-bold text-slate-950">{money(booking.totalPrice)}</p></div><span className={`rounded-full border px-2 py-1 text-xs font-semibold ${paymentStatusClasses(ps)}`}>{ps}</span></div>
                    {bs === "PENDING" && ps === "PAID" && (
                      <button type="button" onClick={() => void confirmBooking(booking)}
                        disabled={confirmingId !== null}
                        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                        <CheckCircle2 size={16} />
                        {confirmingId === booking.id ? "Approving..." : "Approve booking"}
                      </button>
                    )}
                    <button type="button" onClick={() => setExpandedId(expanded ? null : booking.id)} className="mt-3 min-h-10 w-full rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">{expanded ? "Hide details" : "View details"}</button>
                    {expanded && <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                      <p>Booking ID: #{booking.id}</p><p>Guest/user ID: {booking.userId ?? "—"}</p><p>Room ID: {booking.roomId ?? "—"}</p><p>Guests: {booking.numberOfGuests ?? "—"}</p><p>Payment record ID: {booking.paymentId ?? "—"}</p><p className="break-all">Razorpay payment ID: {booking.razorpayPaymentId || "—"}</p>
                    </div>}
                  </article>;
                })}
              </div>
              {filteredBookings.map((booking) => expandedId === booking.id && (
                <div key={`detail-${booking.id}`} className="hidden border-t border-slate-200 bg-slate-50 p-5 md:block">
                  <div className="flex items-start justify-between"><h3 className="font-semibold text-slate-900">Booking #{booking.id} details</h3><button type="button" onClick={() => setExpandedId(null)} aria-label="Close details"><X size={18} /></button></div>
                  <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <p><span className="text-slate-500">Payment record ID:</span> {booking.paymentId ?? "—"}</p>
                    <p className="break-all"><span className="text-slate-500">Razorpay payment ID:</span> {booking.razorpayPaymentId || "—"}</p>
                    <p><span className="text-slate-500">Room ID:</span> {booking.roomId ?? "—"}</p>
                    <p><span className="text-slate-500">User ID:</span> {booking.userId ?? "—"}</p>
                    <p><span className="text-slate-500">Check-in:</span> {dateLabel(booking.checkInDate)}</p>
                    <p><span className="text-slate-500">Check-out:</span> {dateLabel(booking.checkOutDate)}</p>
                  </div>
                </div>
              ))}
            </>}
        </section>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-6">Only bookings with PENDING booking status and PAID payment status can be approved from this page. Approval is completed by the backend, which must verify the payment before changing the booking to CONFIRMED.</p>
        </div>
      </div>
    </main>
  );
}
