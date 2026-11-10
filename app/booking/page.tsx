"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Hotel,
  Loader2,
  Users,
  CheckCircle2,
  BedDouble,
} from "lucide-react";

import api from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });


interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  floor: number;
  description?: string;
  status: string;
  hotelId: number;
  hotelName?: string;
  imageUrl?: string | null;
}

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // =====================================================
  // URL PARAMETERS
  // =====================================================

  const roomId = searchParams.get("roomId");
  const hotelId = searchParams.get("hotelId");

  // =====================================================
  // STATE
  // =====================================================

  const [room, setRoom] = useState<Room | null>(null);

  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // TODAY - LOCAL DATE
  // =====================================================

  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) {
      return "";
    }

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      return imageUrl;
    }

    const backendUrl = "http://localhost:8080";

    if (imageUrl.startsWith("/")) {
      return `${backendUrl}${imageUrl}`;
    }

    return `${backendUrl}/${imageUrl}`;
  };

  // =====================================================
  // FETCH ROOM
  // =====================================================

  useEffect(() => {
    if (!roomId) {
      setError(
        "Room information is missing. Please go back and select a room again."
      );
      setLoading(false);
      return;
    }

    const numericRoomId = Number(roomId);

    if (!Number.isInteger(numericRoomId) || numericRoomId <= 0) {
      setError("Invalid room ID.");
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/rooms/${numericRoomId}`
        );

        if (!response.data) {
          throw new Error("Room data is empty.");
        }

        const roomData = response.data;

        const normalizedRoom: Room = {
          ...roomData,

          id: Number(roomData.id),

          hotelId: Number(roomData.hotelId),

          capacity: Number(roomData.capacity || 1),

          pricePerNight: Number(
            roomData.pricePerNight || 0
          ),

          floor: Number(roomData.floor || 0),

          status: roomData.status
            ? String(roomData.status).toUpperCase()
            : "AVAILABLE",
        };

        setRoom(normalizedRoom);

        // Make sure default guests do not exceed room capacity
        if (
          normalizedRoom.capacity > 0 &&
          numberOfGuests > normalizedRoom.capacity
        ) {
          setNumberOfGuests(normalizedRoom.capacity);
        }
      } catch (err: any) {
        console.error("Room loading error:", err);

        const status = err?.response?.status;

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load room details.";

        if (status === 404) {
          setError("Room not found.");
        } else if (status === 401) {
          setError("Please login to continue.");
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  // =====================================================
  // CALCULATE NIGHTS
  // =====================================================

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) {
      return 0;
    }

    const checkIn = new Date(
      `${checkInDate}T00:00:00`
    );

    const checkOut = new Date(
      `${checkOutDate}T00:00:00`
    );

    const difference =
      checkOut.getTime() - checkIn.getTime();

    if (difference <= 0) {
      return 0;
    }

    return Math.round(
      difference / (1000 * 60 * 60 * 24)
    );
  };

  const nights = calculateNights();

  // =====================================================
  // TOTAL PRICE
  // =====================================================

  const totalAmount =
    room && nights > 0
      ? Number(room.pricePerNight) * nights
      : 0;

  // =====================================================
  // CHECK-IN CHANGE
  // =====================================================

  const handleCheckInChange = (value: string) => {
    setCheckInDate(value);

    // Reset checkout if it becomes invalid
    if (
      checkOutDate &&
      checkOutDate <= value
    ) {
      setCheckOutDate("");
    }
  };

  // =====================================================
  // CREATE BOOKING
  // =====================================================

const handleBooking = async (
  e: FormEvent<HTMLFormElement>
) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  if (!room || !roomId) {
    setError("Room information is missing.");
    return;
  }

  if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
    setError("Please select valid check-in and check-out dates.");
    return;
  }

  if (checkInDate < getToday()) {
    setError("Check-in date cannot be in the past.");
    return;
  }

  if (numberOfGuests < 1 || numberOfGuests > room.capacity) {
    setError("Please select a valid number of guests.");
    return;
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!keyId) {
    setError("Razorpay Key ID missing. Configure .env.local first.");
    return;
  }

  let bookingCreated = false;

  try {
    setBookingLoading(true);

    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error("Razorpay checkout failed to load. Check your internet.");
    }

    // Create booking
    const bookingResponse = await api.post("/bookings", {
      roomId: Number(roomId),
      checkInDate,
      checkOutDate,
      numberOfGuests: Number(numberOfGuests),
    });

    const booking = bookingResponse.data;
    const bookingId = Number(booking.id);
    bookingCreated = true;

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      throw new Error("Booking created, but the API did not return a valid booking ID.");
    }

    // Create Razorpay order through backend
    const orderResponse = await api.post("/payments/create-order", {
      bookingId,
    });

    const payment = orderResponse.data;

    if (!payment?.razorpayOrderId || payment.amount == null) {
      throw new Error("Backend did not return valid Razorpay order details.");
    }

    // Open checkout
    const checkout = new window.Razorpay({
      key: keyId,
      amount: Math.round(Number(payment.amount) * 100),
      currency: payment.currency || "INR",
      name: "StayEase",
      description: `Booking #${bookingId}`,
      order_id: payment.razorpayOrderId,

      handler: async (result: any) => {
        try {
          setBookingLoading(true);
          setError("");

          await api.post(`/payments/verify?bookingId=${bookingId}`, {
            razorpayOrderId: result.razorpay_order_id,
            razorpayPaymentId: result.razorpay_payment_id,
            razorpaySignature: result.razorpay_signature,
          });

          setSuccess("Payment verified successfully!");
          router.push("/bookings");
        } catch (verificationError: any) {
          console.error("Payment verification failed:", verificationError);
          setError(
            verificationError?.response?.data?.message ||
            "Payment verification failed. Please contact support before retrying payment."
          );
        } finally {
          setBookingLoading(false);
        }
      },

      modal: {
        ondismiss: () => {
          setBookingLoading(false);
          setError("Checkout closed. Your booking remains pending until payment is verified.");
        },
      },

      theme: { color: "#111827" },
    });

    checkout.on("payment.failed", (result: any) => {
      console.error("Razorpay payment failed:", result?.error);
      setError(result?.error?.description || "Payment failed. Please try again.");
      setBookingLoading(false);
    });

    checkout.open();
  } catch (err: any) {
    console.error("Booking/payment error:", err);

    const status = err?.response?.status;
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message;

    if (status === 401) {
      router.push("/login");
      return;
    }

    if (status === 403) {
      setError("Please log in with a customer account to make a booking.");
      return;
    }

    setError(
      bookingCreated
        ? `Booking was created but payment could not start: ${message || "Please check the backend."} Your booking may remain pending.`
        : message || "Unable to create booking. Please try again."
    );
  } finally {
    setBookingLoading(false);
  }
};

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2
            size={42}
            className="mx-auto animate-spin text-gray-900"
          />

          <p className="mt-4 text-gray-600">
            Loading room details...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ROOM ERROR
  // =====================================================

  if (!room) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="bg-gray-950 px-6 py-12 text-white">
          <div className="mx-auto max-w-6xl">
            <Link
              href={
                hotelId
                  ? `/hotels/${hotelId}`
                  : "/hotels"
              }
              className="inline-flex items-center gap-2 text-gray-300 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to Hotel
            </Link>

            <p className="mt-8 text-sm uppercase tracking-widest text-gray-400">
              StayEase
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Booking
            </h1>
          </div>
        </section>

        <section className="flex min-h-[65vh] items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <BedDouble
              size={60}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              Booking unavailable
            </h2>

            <p className="mt-3 text-gray-600">
              {error ||
                "Room information is unavailable."}
            </p>

            <Link
              href={
                hotelId
                  ? `/hotels/${hotelId}`
                  : "/hotels"
              }
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Back to Hotel
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // =====================================================
  // ROOM STATUS
  // =====================================================

  const roomStatus = String(
    room.status || ""
  ).toUpperCase();

  const isAvailable =
    roomStatus === "AVAILABLE";

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-gray-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">

          <Link
            href={
              hotelId
                ? `/hotels/${hotelId}`
                : `/hotels/${room.hotelId}`
            }
            className="inline-flex items-center gap-2 text-gray-300 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Hotel
          </Link>

          <p className="mt-8 text-sm uppercase tracking-widest text-gray-400">
            StayEase
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Complete Your Booking
          </h1>

          <p className="mt-3 text-gray-400">
            Select your dates and number of guests.
          </p>
        </div>
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="mx-auto max-w-6xl px-6 py-12">

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle2 size={20} />

            <span>{success}</span>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* =================================================
              BOOKING FORM
          ================================================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <CalendarDays size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Booking Details
                </h2>

                <p className="text-sm text-gray-500">
                  Choose your stay dates.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleBooking}
              className="mt-8 space-y-6"
            >

              {/* CHECK-IN / CHECK-OUT */}

              <div className="grid gap-5 md:grid-cols-2">

                {/* CHECK-IN */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Check-in Date
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="date"
                      min={getToday()}
                      value={checkInDate}
                      onChange={(e) =>
                        handleCheckInChange(
                          e.target.value
                        )
                      }
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 outline-none transition focus:border-black"
                    />
                  </div>
                </div>

                {/* CHECK-OUT */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Check-out Date
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="date"
                      min={
                        checkInDate
                          ? checkInDate
                          : getToday()
                      }
                      value={checkOutDate}
                      onChange={(e) =>
                        setCheckOutDate(
                          e.target.value
                        )
                      }
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 outline-none transition focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* GUESTS */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Number of Guests
                </label>

                <div className="relative">
                  <Users
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="number"
                    min={1}
                    max={room.capacity}
                    value={numberOfGuests}
                    onChange={(e) => {
                      const value = Number(
                        e.target.value
                      );

                      if (value < 1) {
                        setNumberOfGuests(1);
                        return;
                      }

                      if (
                        value >
                        room.capacity
                      ) {
                        setNumberOfGuests(
                          room.capacity
                        );
                        return;
                      }

                      setNumberOfGuests(value);
                    }}
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 outline-none transition focus:border-black"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Maximum capacity:{" "}
                  {room.capacity} guests
                </p>
              </div>

              {/* ROOM STATUS */}

              <div
                className={`rounded-xl p-4 ${
                  isAvailable
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    Room Status
                  </span>

                  <span className="font-bold">
                    {roomStatus || "UNKNOWN"}
                  </span>
                </div>
              </div>

              {/* PRICE */}

              <div className="rounded-xl bg-gray-50 p-5">

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Price / Night
                  </span>

                  <strong className="text-gray-900">
                    ₹
                    {Number(
                      room.pricePerNight
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="mt-3 flex justify-between">
                  <span className="text-gray-600">
                    Nights
                  </span>

                  <strong className="text-gray-900">
                    {nights}
                  </strong>
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">

                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>

                    <strong className="text-2xl text-gray-900">
                      ₹
                      {totalAmount.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                </div>
              </div>

              {/* CONFIRM BUTTON */}

              <button
                type="submit"
                disabled={
                  bookingLoading ||
                  !isAvailable ||
                  nights <= 0
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >

                {bookingLoading && (
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                )}

                {!isAvailable
                  ? "Room Not Available"
                  : bookingLoading
                  ? "Creating Booking..."
                  : "Confirm Booking"}

              </button>

            </form>
          </div>

          {/* =================================================
              ROOM SUMMARY
          ================================================= */}

          <aside className="h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-24">

            {/* IMAGE */}

            <div className="h-52 bg-gray-100">

              {room.imageUrl ? (
                <img
                  src={getImageUrl(
                    room.imageUrl
                  )}
                  alt={`Room ${room.roomNumber}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Hotel
                    size={60}
                    className="text-gray-400"
                  />
                </div>
              )}

            </div>

            {/* ROOM DETAILS */}

            <div className="p-6">

              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {room.hotelName || "Hotel"}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Room {room.roomNumber}
              </h2>

              <p className="mt-1 text-gray-500">
                {room.roomType}
              </p>

              {room.description && (
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {room.description}
                </p>
              )}

              <div className="mt-6 space-y-4">

                {/* CAPACITY */}

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Capacity
                  </span>

                  <strong>
                    {room.capacity} Guests
                  </strong>
                </div>

                {/* FLOOR */}

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Floor
                  </span>

                  <strong>
                    {room.floor}
                  </strong>
                </div>

                {/* STATUS */}

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Status
                  </span>

                  <strong
                    className={
                      isAvailable
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {roomStatus}
                  </strong>
                </div>

                {/* PRICE */}

                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <span className="text-gray-500">
                    Price / Night
                  </span>

                  <strong>
                    ₹
                    {Number(
                      room.pricePerNight
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}