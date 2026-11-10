"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  IndianRupee,
  RefreshCw,
  Search,
  ShieldAlert,
  RotateCcw,
  X,
} from "lucide-react";
import api from "@/lib/api";

type Payment = {
  paymentId: number;
  bookingId?: number | null;
  amount?: number | string | null;
  currency?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  status?: string | null;
  createdAt?: string | null;
  paidAt?: string | null;
};

type ApiError = {
  response?: {
    status?: number;
    data?: { message?: string; error?: string };
  };
  message?: string;
};

function asArray(data: any): Payment[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.payments)) return data.payments;
  return [];
}

function errorMessage(error: ApiError): string {
  const status = error?.response?.status;
  if (status === 401) return "Your session expired. Please log in again.";
  if (status === 403) return "Access denied. Use an ADMIN or SUPER_ADMIN account.";
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "The request failed. Check the backend and try again."
  );
}

function normalStatus(payment: Payment): string {
  return String(payment.status || "UNKNOWN").toUpperCase();
}

function statusClasses(status: string): string {
  if (status === "PAID") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "REFUNDED") return "border-violet-200 bg-violet-50 text-violet-800";
  if (status === "FAILED") return "border-rose-200 bg-rose-50 text-rose-800";
  if (status === "CREATED" || status === "PENDING") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

function money(amount: Payment["amount"], currency?: string | null): string {
  const value = Number(amount ?? 0);
  const code = currency || "INR";
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${code} ${value.toLocaleString("en-IN")}`;
  }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [refundingId, setRefundingId] = useState<number | null>(null);
  const [confirmPayment, setConfirmPayment] = useState<Payment | null>(null);

  const loadPayments = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    setError("");
    setNotice("");

    try {
      // Existing endpoint from PaymentController: GET /api/payments
      const response = await api.get("/payments");
      setPayments(asArray(response.data));
    } catch (requestError) {
      console.error("Admin payments request failed:", requestError);
      setError(errorMessage(requestError as ApiError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return payments.filter((payment) => {
      const status = normalStatus(payment);
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      const haystack = [
        payment.paymentId,
        payment.bookingId,
        payment.razorpayOrderId,
        payment.razorpayPaymentId,
        status,
      ].map((value) => String(value ?? "").toLowerCase()).join(" ");
      return matchesStatus && (!query || haystack.includes(query));
    });
  }, [payments, search, statusFilter]);

  const paidCount = payments.filter((p) => normalStatus(p) === "PAID").length;
  const refundedCount = payments.filter((p) => normalStatus(p) === "REFUNDED").length;
  const totalPaid = payments
    .filter((p) => normalStatus(p) === "PAID" || normalStatus(p) === "REFUNDED")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const submitRefund = async () => {
    if (!confirmPayment) return;
    const target = confirmPayment;
    setRefundingId(target.paymentId);
    setError("");
    setNotice("");
    setConfirmPayment(null);

    try {
      // Existing endpoint: POST /api/payments/{paymentId}/refund.
      // Never automatically retry a refund request; the provider may have accepted it.
      const response = await api.post(`/payments/${target.paymentId}/refund`);
      const updated = response?.data as Payment | undefined;

      setPayments((current) =>
        current.map((payment) =>
          payment.paymentId === target.paymentId
            ? { ...payment, ...(updated || {}), paymentId: target.paymentId }
            : payment
        )
      );
      setNotice(
        `Refund request returned successfully for payment #${target.paymentId}. Verify the final refund status in Razorpay before retrying.`
      );
    } catch (requestError) {
      console.error("Refund request failed:", requestError);
      setError(
        `${errorMessage(requestError as ApiError)} Do not retry immediately; first check the Razorpay Dashboard for an existing refund.`
      );
    } finally {
      setRefundingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              StayEase · Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Payments
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review payment records and carefully initiate eligible refunds.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadPayments(true)}
            disabled={loading || refreshing}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh payments"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {error && (
          <div role="alert" className="mb-5 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold">Action needs attention</p>
              <p className="mt-1 text-sm leading-6">{error}</p>
            </div>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss error" className="ml-auto h-fit">
              <X size={18} />
            </button>
          </div>
        )}

        {notice && (
          <div role="status" className="mb-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm leading-6">{notice}</p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Payment records</p>
              <CreditCard size={20} className="text-slate-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{payments.length}</p>
            <p className="mt-1 text-xs text-slate-500">Returned by payments API</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Paid</p>
              <CheckCircle2 size={20} className="text-emerald-700" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{paidCount}</p>
            <p className="mt-1 text-xs text-slate-500">Currently marked PAID</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Refunded</p>
              <RotateCcw size={20} className="text-violet-700" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{refundedCount}</p>
            <p className="mt-1 text-xs text-slate-500">Currently marked REFUNDED</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Paid/refunded value</p>
              <IndianRupee size={20} className="text-slate-600" />
            </div>
            <p className="mt-3 break-words text-2xl font-bold text-slate-950">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(totalPaid)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Sum of PAID and REFUNDED records; not net revenue</p>
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-slate-950">Payment history</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {filteredPayments.length} of {payments.length} records
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative block">
                  <span className="sr-only">Search payments</span>
                  <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search payment, booking, Razorpay ID"
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:w-80"
                  />
                </label>
                <label>
                  <span className="sr-only">Filter payment status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:w-44"
                  >
                    <option value="ALL">All statuses</option>
                    <option value="PAID">Paid</option>
                    <option value="REFUNDED">Refunded</option>
                    <option value="FAILED">Failed</option>
                    <option value="CREATED">Created</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-5" aria-label="Loading payments">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <CreditCard size={30} className="mx-auto text-slate-400" />
              <p className="mt-3 font-semibold text-slate-900">No payments found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try another search or status filter.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Payment / booking</th>
                      <th className="px-5 py-3 font-semibold">Amount</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Razorpay payment ID</th>
                      <th className="px-5 py-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map((payment) => {
                      const status = normalStatus(payment);
                      const busy = refundingId === payment.paymentId;
                      return (
                        <tr key={payment.paymentId} className="hover:bg-slate-50/70">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">Payment #{payment.paymentId}</p>
                            <p className="mt-1 text-xs text-slate-500">Booking #{payment.bookingId ?? "—"}</p>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {money(payment.amount, payment.currency)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(status)}`}>
                              {status}
                            </span>
                          </td>
                          <td className="max-w-64 truncate px-5 py-4 font-mono text-xs text-slate-600" title={payment.razorpayPaymentId || ""}>
                            {payment.razorpayPaymentId || "—"}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {status === "PAID" ? (
                              <button
                                type="button"
                                disabled={busy || refundingId !== null}
                                onClick={() => setConfirmPayment(payment)}
                                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <RotateCcw size={14} />
                                {busy ? "Processing..." : "Refund"}
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">No action</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredPayments.map((payment) => {
                  const status = normalStatus(payment);
                  return (
                    <article key={payment.paymentId} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">Payment #{payment.paymentId}</p>
                          <p className="mt-1 text-xs text-slate-500">Booking #{payment.bookingId ?? "—"}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses(status)}`}>
                          {status}
                        </span>
                      </div>
                      <p className="mt-3 text-lg font-bold text-slate-950">{money(payment.amount, payment.currency)}</p>
                      <p className="mt-2 break-all font-mono text-xs text-slate-500">
                        {payment.razorpayPaymentId || "Razorpay payment ID unavailable"}
                      </p>
                      {status === "PAID" && (
                        <button
                          type="button"
                          disabled={refundingId !== null}
                          onClick={() => setConfirmPayment(payment)}
                          className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-50 disabled:opacity-50"
                        >
                          <RotateCcw size={15} /> Request refund
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <ShieldAlert size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-6">
            Refund requests contact Razorpay and may move through asynchronous states. A successful API response is not proof that the refund has reached the customer. Check the Razorpay Dashboard for the final status. If a request fails or times out, check Razorpay before trying again.
          </p>
        </div>
      </div>

      {confirmPayment && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="refund-dialog-title"
            className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="rounded-xl bg-rose-50 p-3 text-rose-800">
                <ShieldAlert size={23} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="refund-dialog-title" className="text-lg font-bold text-slate-950">
                  Confirm refund request
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  You are about to request a refund for payment #{confirmPayment.paymentId}, booking #{confirmPayment.bookingId ?? "—"}.
                </p>
              </div>
              <button type="button" onClick={() => setConfirmPayment(null)} aria-label="Close confirmation" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Recorded payment amount</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {money(confirmPayment.amount, confirmPayment.currency)}
              </p>
              <p className="mt-2 break-all font-mono text-xs text-slate-500">
                {confirmPayment.razorpayPaymentId || "No Razorpay payment ID in response"}
              </p>
            </div>

            <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-amber-900">
              <Clock3 size={17} className="mt-0.5 shrink-0" />
              Refunds can be irreversible once processed. Confirm the payment in Razorpay and verify that no previous refund exists before continuing.
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmPayment(null)}
                className="min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitRefund()}
                disabled={refundingId !== null}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"
              >
                <RotateCcw size={16} />
                Confirm refund request
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
