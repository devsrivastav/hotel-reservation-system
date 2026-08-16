"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Loader2,
  RefreshCw,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";

interface Payment {
  paymentId: number;
  bookingId: number;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  status: "CREATED" | "PAID" | "FAILED" | "REFUNDED";
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundingId, setRefundingId] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // FETCH PAYMENTS
  // =====================================================

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/payments");

      console.log("Admin Payments:", response.data);

      if (Array.isArray(response.data)) {
        setPayments(response.data);
      } else {
        setPayments([]);
      }
    } catch (err: any) {
      console.error("Payments error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load payments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // =====================================================
  // REFUND PAYMENT
  // =====================================================

  const handleRefund = async (payment: Payment) => {
    if (payment.status !== "PAID") {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to refund ${payment.currency} ${payment.amount.toLocaleString(
        "en-IN"
      )} for Payment #${payment.paymentId}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRefundingId(payment.paymentId);
      setError("");
      setSuccess("");

      const response = await api.post(
        `/payments/${payment.paymentId}/refund`
      );

      console.log("Refund response:", response.data);

      setSuccess(
        `Payment #${payment.paymentId} refunded successfully.`
      );

      // Update current row immediately
      setPayments((currentPayments) =>
        currentPayments.map((item) =>
          item.paymentId === payment.paymentId
            ? {
                ...item,
                status: "REFUNDED",
              }
            : item
        )
      );
    } catch (err: any) {
      console.error("Refund error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to process refund."
      );
    } finally {
      setRefundingId(null);
    }
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusClass = (status: Payment["status"]) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";

      case "REFUNDED":
        return "bg-purple-100 text-purple-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      case "CREATED":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const paidPayments = payments.filter(
    (payment) => payment.status === "PAID"
  );

  const refundedPayments = payments.filter(
    (payment) => payment.status === "REFUNDED"
  );

  const totalPaid = paidPayments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="bg-gray-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            StayEase Admin
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <h1 className="text-4xl font-bold">
                Payments
              </h1>

              <p className="mt-3 text-gray-400">
                Manage customer payments and refunds.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPayments}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Success */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <span className="font-medium">
              {success}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">
                Total Payments
              </p>

              <CreditCard
                size={22}
                className="text-gray-400"
              />
            </div>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {payments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Paid Amount
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              ₹
              {totalPaid.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Refunded Payments
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {refundedPayments.length}
            </p>
          </div>
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2
              size={34}
              className="animate-spin"
            />

            <span className="ml-3 text-gray-600">
              Loading payments...
            </span>
          </div>
        )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading && payments.length === 0 && !error && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <CreditCard
              size={50}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-4 text-xl font-bold">
              No payments found
            </h2>

            <p className="mt-2 text-gray-500">
              Payment records will appear here.
            </p>
          </div>
        )}

        {/* =====================================================
            PAYMENT TABLE
        ===================================================== */}

        {!loading && payments.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Payment
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Booking
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Razorpay Payment
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.paymentId}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      {/* Payment */}
                      <td className="px-6 py-5">
                        <p className="font-semibold text-gray-900">
                          #{payment.paymentId}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Order:{" "}
                          {payment.razorpayOrderId}
                        </p>
                      </td>

                      {/* Booking */}
                      <td className="px-6 py-5">
                        <span className="font-semibold text-gray-900">
                          #{payment.bookingId}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-5">
                        <span className="font-bold text-gray-900">
                          {payment.currency}{" "}
                          {Number(
                            payment.amount
                          ).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Razorpay Payment */}
                      <td className="px-6 py-5">
                        {payment.razorpayPaymentId ? (
                          <span className="font-mono text-xs text-gray-600">
                            {
                              payment.razorpayPaymentId
                            }
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not available
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-right">
                        {payment.status ===
                          "PAID" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRefund(payment)
                            }
                            disabled={
                              refundingId ===
                              payment.paymentId
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {refundingId ===
                            payment.paymentId ? (
                              <>
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                                Refunding...
                              </>
                            ) : (
                              <>
                                <RotateCcw
                                  size={16}
                                />
                                Refund
                              </>
                            )}
                          </button>
                        )}

                        {payment.status ===
                          "REFUNDED" && (
                          <span className="text-sm font-semibold text-purple-600">
                            Refunded
                          </span>
                        )}

                        {payment.status !==
                          "PAID" &&
                          payment.status !==
                            "REFUNDED" && (
                            <span className="text-sm text-gray-400">
                              —
                            </span>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}