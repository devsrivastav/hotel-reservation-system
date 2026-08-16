"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Hotel as HotelIcon,
  Loader2,
  Users,
  BedDouble,
  CheckCircle2,
} from "lucide-react";

import api from "@/lib/api";

interface Hotel {
  id: number;
  name: string;
  imageUrl?: string;
  city?: string;
  state?: string;
}

interface Room {
  id: number;
  roomNumber: string;
  roomType?: string;
  pricePerNight?: number;
  capacity?: number;
  floor?: number;
  description?: string;
  status?: string;
  imageUrl?: string;
  hotelId?: number;
  hotelName?: string;
}

export default function CreateBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomId = searchParams.get("roomId");
  const hotelId = searchParams.get("hotelId");

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // MINIMUM DATE
  // =====================================================

  const today = useMemo(() => {
    const date = new Date();

    return date.toISOString().split("T")[0];
  }, []);

  // =====================================================
  // LOAD HOTEL + ROOM
  // =====================================================

  useEffect(() => {
    if (!roomId) {
      setError("Room information is missing.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // ---------------------------------------------
        // ROOM
        // ---------------------------------------------

        const roomResponse = await api.get(
          `/rooms/${roomId}`
        );

        const roomData = roomResponse.data;

        setRoom(roomData);

        // ---------------------------------------------
        // HOTEL
        // ---------------------------------------------

        const actualHotelId =
          hotelId || roomData?.hotelId;

        if (actualHotelId) {
          const hotelResponse = await api.get(
            `/hotels/${actualHotelId}`
          );

          setHotel(
            hotelResponse.data
          );
        }

        // Default guests = 1
        setNumberOfGuests(1);

      } catch (err: any) {
        console.error(
          "BOOKING PAGE LOAD ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load booking information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomId, hotelId]);

  // =====================================================
  // CALCULATE NIGHTS
  // =====================================================

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) {
      return 0;
    }

    const start = new Date(
      `${checkInDate}T00:00:00`
    );

    const end = new Date(
      `${checkOutDate}T00:00:00`
    );

    const difference =
      end.getTime() - start.getTime();

    return Math.max(
      0,
      Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      )
    );
  }, [checkInDate, checkOutDate]);

  // =====================================================
  // TOTAL
  // =====================================================

  const pricePerNight =
    Number(
      room?.pricePerNight || 0
    );

  const totalAmount =
    nights * pricePerNight;

  // =====================================================
  // CHECK OUT DATE VALIDATION
  // =====================================================

  const handleCheckInChange = (
    value: string
  ) => {
    setCheckInDate(value);

    if (
      checkOutDate &&
      value >= checkOutDate
    ) {
      setCheckOutDate("");
    }
  };

  // =====================================================
  // BOOKING
  // =====================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ---------------------------------------------
    // Basic validation
    // ---------------------------------------------

    if (!roomId) {
      setError(
        "Room information is missing."
      );
      return;
    }

    if (!checkInDate || !checkOutDate) {
      setError(
        "Please select check-in and check-out dates."
      );
      return;
    }

    if (checkOutDate <= checkInDate) {
      setError(
        "Check-out date must be after check-in date."
      );
      return;
    }

    if (numberOfGuests < 1) {
      setError(
        "Number of guests must be at least 1."
      );
      return;
    }

    if (
      room?.capacity &&
      numberOfGuests > room.capacity
    ) {
      setError(
        `This room allows maximum ${room.capacity} guest${
          room.capacity > 1 ? "s" : ""
        }.`
      );
      return;
    }

    try {
      setBooking(true);

      console.log(
        "CREATING BOOKING:",
        {
          roomId: Number(roomId),
          checkInDate,
          checkOutDate,
          numberOfGuests,
        }
      );

      // =================================================
      // POST /api/bookings
      // =================================================

      const response = await api.post(
        "/bookings",
        {
          roomId: Number(roomId),
          checkInDate,
          checkOutDate,
          numberOfGuests,
        }
      );

      console.log(
        "BOOKING SUCCESS:",
        response.data
      );

      setSuccess(
        "Booking created successfully!"
      );

      // ---------------------------------------------
      // Redirect to My Bookings
      // ---------------------------------------------

      setTimeout(() => {
        router.push("/bookings");
      }, 1200);

    } catch (err: any) {
      console.error(
        "BOOKING ERROR:",
        err
      );

      const status =
        err?.response?.status;

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error;

      if (status === 401) {
        localStorage.removeItem(
          "token"
        );

        router.push("/login");
        return;
      }

      if (status === 403) {
        setError(
          "You must be logged in as a customer to make a booking."
        );
        return;
      }

      setError(
        message ||
          "Unable to create booking. Please try again."
      );
    } finally {
      setBooking(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
        <div className="text-center">

          <Loader2
            size={42}
            className="mx-auto animate-spin text-gray-900"
          />

          <p className="mt-4 text-gray-600">
            Loading booking details...
          </p>

        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !room) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-6">

        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">

          <BedDouble
            size={45}
            className="mx-auto text-gray-400"
          />

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Booking unavailable
          </h1>

          <p className="mt-2 text-gray-600">
            {error}
          </p>

          <button
            onClick={() =>
              router.push(
                hotelId
                  ? `/hotels/${hotelId}`
                  : "/hotels"
              )
            }
            className="mt-6 rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Back to Hotel
          </button>

        </div>

      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">

      <div className="mx-auto max-w-6xl">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            router.push(
              hotelId
                ? `/hotels/${hotelId}`
                : "/hotels"
            )
          }
          className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to Hotel
        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            StayEase Booking
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Complete Your Booking
          </h1>

          <p className="mt-2 text-gray-600">
            Choose your dates and number of guests.
          </p>

        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* =================================================
              FORM
          ================================================= */}

          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

            {/* Selected Room */}

            <div className="border-b border-gray-200 pb-7">

              <div className="flex items-start gap-5">

                <div className="h-28 w-36 shrink-0 overflow-hidden rounded-xl bg-gray-100">

                  <img
                    src={
                      room?.imageUrl ||
                      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={
                      room?.roomNumber
                        ? `Room ${room.roomNumber}`
                        : "Hotel room"
                    }
                    className="h-full w-full object-cover"
                  />

                </div>

                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <HotelIcon
                      size={17}
                      className="text-gray-500"
                    />

                    <p className="text-sm text-gray-500">
                      {hotel?.name ||
                        room?.hotelName ||
                        "Hotel"}
                    </p>

                  </div>

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    {room?.roomType ||
                      "Room"}
                  </h2>

                  <p className="mt-1 text-gray-600">
                    Room{" "}
                    {room?.roomNumber || "-"}
                  </p>

                </div>

              </div>

            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-7"
            >

              {/* =================================================
                  DATES
              ================================================= */}

              <div>

                <h3 className="text-lg font-bold text-gray-900">
                  Select your dates
                </h3>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">

                  {/* Check In */}

                  <div>

                    <label
                      htmlFor="checkIn"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Check-in
                    </label>

                    <div className="relative">

                      <CalendarDays
                        size={19}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="checkIn"
                        type="date"
                        min={today}
                        value={checkInDate}
                        onChange={(e) =>
                          handleCheckInChange(
                            e.target.value
                          )
                        }
                        required
                        className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />

                    </div>

                  </div>

                  {/* Check Out */}

                  <div>

                    <label
                      htmlFor="checkOut"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Check-out
                    </label>

                    <div className="relative">

                      <CalendarDays
                        size={19}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        id="checkOut"
                        type="date"
                        min={
                          checkInDate
                            ? checkInDate
                            : today
                        }
                        value={checkOutDate}
                        onChange={(e) =>
                          setCheckOutDate(
                            e.target.value
                          )
                        }
                        required
                        className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  GUESTS
              ================================================= */}

              <div>

                <label
                  htmlFor="guests"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Number of guests
                </label>

                <div className="relative">

                  <Users
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="guests"
                    type="number"
                    min={1}
                    max={
                      room?.capacity ||
                      undefined
                    }
                    value={numberOfGuests}
                    onChange={(e) =>
                      setNumberOfGuests(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    required
                    className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />

                </div>

                {room?.capacity && (
                  <p className="mt-2 text-sm text-gray-500">
                    Maximum{" "}
                    {room.capacity} guests
                  </p>
                )}

              </div>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {success && (
                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">

                  <CheckCircle2
                    size={19}
                  />

                  {success}

                </div>
              )}

              {/* =================================================
                  SUBMIT
              ================================================= */}

              <button
                type="submit"
                disabled={
                  booking ||
                  !checkInDate ||
                  !checkOutDate ||
                  nights <= 0
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {booking && (
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                )}

                {booking
                  ? "Creating Booking..."
                  : "Confirm Booking"}

              </button>

            </form>

          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-7 shadow-sm lg:sticky lg:top-24">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">

                <CalendarDays
                  size={22}
                  className="text-gray-700"
                />

              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Booking Summary
                </h2>

                <p className="text-sm text-gray-500">
                  Review your stay
                </p>

              </div>

            </div>

            <div className="my-6 border-t border-gray-200" />

            {/* Hotel */}

            <div className="flex justify-between gap-5">

              <span className="text-gray-500">
                Hotel
              </span>

              <span className="text-right font-semibold text-gray-900">
                {hotel?.name ||
                  room?.hotelName ||
                  "-"}
              </span>

            </div>

            {/* Room */}

            <div className="mt-5 flex justify-between gap-5">

              <span className="text-gray-500">
                Room
              </span>

              <span className="text-right font-semibold text-gray-900">
                {room?.roomNumber
                  ? `Room ${room.roomNumber}`
                  : "-"}
              </span>

            </div>

            {/* Dates */}

            <div className="mt-5 flex justify-between gap-5">

              <span className="text-gray-500">
                Check-in
              </span>

              <span className="font-semibold text-gray-900">
                {checkInDate || "-"}
              </span>

            </div>

            <div className="mt-4 flex justify-between gap-5">

              <span className="text-gray-500">
                Check-out
              </span>

              <span className="font-semibold text-gray-900">
                {checkOutDate || "-"}
              </span>

            </div>

            {/* Guests */}

            <div className="mt-4 flex justify-between gap-5">

              <span className="text-gray-500">
                Guests
              </span>

              <span className="font-semibold text-gray-900">
                {numberOfGuests}
              </span>

            </div>

            <div className="my-6 border-t border-gray-200" />

            {/* Price */}

            <div className="flex justify-between gap-5">

              <span className="text-gray-600">
                ₹
                {pricePerNight.toLocaleString(
                  "en-IN"
                )}{" "}
                × {nights || 0} nights
              </span>

              <span className="font-semibold text-gray-900">
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            {/* Total */}

            <div className="mt-5 flex items-end justify-between gap-5">

              <span className="text-lg font-bold text-gray-900">
                Total
              </span>

              <div className="text-right">

                <p className="text-3xl font-bold text-gray-900">
                  ₹
                  {totalAmount.toLocaleString(
                    "en-IN"
                  )}
                </p>

                {nights > 0 && (
                  <p className="text-xs text-gray-500">
                    {nights} night
                    {nights > 1
                      ? "s"
                      : ""}
                  </p>
                )}

              </div>

            </div>

            <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
              Room prices are calculated per night.
              Your final booking amount will be
              determined by the selected dates.
            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}