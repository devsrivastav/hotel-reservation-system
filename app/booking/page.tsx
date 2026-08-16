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

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [checkInDate, setCheckInDate] =
    useState("");

  const [checkOutDate, setCheckOutDate] =
    useState("");

  const [numberOfGuests, setNumberOfGuests] =
    useState(1);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // TODAY
  // =====================================================

  const getToday = () => {
    return new Date()
      .toISOString()
      .split("T")[0];
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (
    imageUrl?: string | null
  ) => {
    if (!imageUrl) {
      return "";
    }

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
      return `http://localhost:8080${imageUrl}`;
    }

    return `http://localhost:8080/${imageUrl}`;
  };

  // =====================================================
  // FETCH ROOM
  // =====================================================

  useEffect(() => {
    console.log(
      "========================================"
    );

    console.log(
      "BOOKING PAGE OPENED"
    );

    console.log(
      "ROOM ID:",
      roomId
    );

    console.log(
      "HOTEL ID:",
      hotelId
    );

    if (typeof window !== "undefined") {
      console.log(
        "CURRENT URL:",
        window.location.href
      );
    }

    console.log(
      "========================================"
    );

    // ---------------------------------------------------
    // ROOM ID MISSING
    // ---------------------------------------------------

    if (!roomId) {
      setError(
        "Room information is missing. Please go back and select a room again."
      );

      setLoading(false);

      return;
    }

    const numericRoomId =
      Number(roomId);

    if (
      !Number.isInteger(
        numericRoomId
      ) ||
      numericRoomId <= 0
    ) {
      setError(
        "Invalid room ID."
      );

      setLoading(false);

      return;
    }

    // ---------------------------------------------------
    // API CALL
    // ---------------------------------------------------

    const fetchRoom = async () => {
      try {
        setLoading(true);
        setError("");

        console.log(
          "FETCHING ROOM:",
          `/rooms/${numericRoomId}`
        );

        const response =
          await api.get(
            `/rooms/${numericRoomId}`
          );

        console.log(
          "ROOM API STATUS:",
          response.status
        );

        console.log(
          "ROOM API RESPONSE:",
          response.data
        );

        if (!response.data) {
          throw new Error(
            "Room data is empty."
          );
        }

        const roomData =
          response.data;

        // ------------------------------------------------
        // NORMALIZE STATUS
        // ------------------------------------------------

        const normalizedRoom: Room = {
          ...roomData,

          status:
            roomData.status
              ? String(
                  roomData.status
                ).toUpperCase()
              : "AVAILABLE",

          id: Number(
            roomData.id
          ),

          hotelId: Number(
            roomData.hotelId
          ),

          capacity: Number(
            roomData.capacity || 1
          ),

          pricePerNight: Number(
            roomData.pricePerNight || 0
          ),

          floor: Number(
            roomData.floor || 0
          ),
        };

        console.log(
          "NORMALIZED ROOM:",
          normalizedRoom
        );

        setRoom(
          normalizedRoom
        );

        // ------------------------------------------------
        // DEFAULT GUESTS
        // ------------------------------------------------

        if (
          normalizedRoom.capacity <
          numberOfGuests
        ) {
          setNumberOfGuests(
            normalizedRoom.capacity
          );
        }

      } catch (err: any) {
        console.error(
          "========================================"
        );

        console.error(
          "ROOM LOADING ERROR:",
          err
        );

        console.error(
          "STATUS:",
          err?.response?.status
        );

        console.error(
          "RESPONSE:",
          err?.response?.data
        );

        console.error(
          "========================================"
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load room details."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchRoom();

  }, [roomId, hotelId]);

  // =====================================================
  // CALCULATE NIGHTS
  // =====================================================

  const calculateNights = () => {
    if (
      !checkInDate ||
      !checkOutDate
    ) {
      return 0;
    }

    const checkIn =
      new Date(
        `${checkInDate}T00:00:00`
      );

    const checkOut =
      new Date(
        `${checkOutDate}T00:00:00`
      );

    const difference =
      checkOut.getTime() -
      checkIn.getTime();

    return Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );
  };

  const nights =
    calculateNights();

  // =====================================================
  // TOTAL PRICE
  // =====================================================

  const totalAmount =
    room && nights > 0
      ? Number(
          room.pricePerNight
        ) * nights
      : 0;

  // =====================================================
  // CHECK-IN CHANGE
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
  // CREATE BOOKING
  // =====================================================

  const handleBooking = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ---------------------------------------------------
    // ROOM ID
    // ---------------------------------------------------

    if (!roomId) {
      setError(
        "Room ID is missing."
      );

      return;
    }

    // ---------------------------------------------------
    // ROOM
    // ---------------------------------------------------

    if (!room) {
      setError(
        "Room details are not available."
      );

      return;
    }

    // ---------------------------------------------------
    // CHECK-IN
    // ---------------------------------------------------

    if (!checkInDate) {
      setError(
        "Please select check-in date."
      );

      return;
    }

    // ---------------------------------------------------
    // CHECK-OUT
    // ---------------------------------------------------

    if (!checkOutDate) {
      setError(
        "Please select check-out date."
      );

      return;
    }

    // ---------------------------------------------------
    // DATE VALIDATION
    // ---------------------------------------------------

    const today =
      getToday();

    if (
      checkInDate < today
    ) {
      setError(
        "Check-in date cannot be in the past."
      );

      return;
    }

    if (
      checkOutDate <=
      checkInDate
    ) {
      setError(
        "Check-out date must be after check-in date."
      );

      return;
    }

    // ---------------------------------------------------
    // GUEST VALIDATION
    // ---------------------------------------------------

    if (
      numberOfGuests < 1
    ) {
      setError(
        "At least 1 guest is required."
      );

      return;
    }

    if (
      numberOfGuests >
      room.capacity
    ) {
      setError(
        `This room can accommodate maximum ${room.capacity} guests.`
      );

      return;
    }

    // ---------------------------------------------------
    // ROOM STATUS
    // ---------------------------------------------------

    const roomStatus =
      String(
        room.status || ""
      ).toUpperCase();

    if (
      roomStatus !==
      "AVAILABLE"
    ) {
      setError(
        `This room is currently ${roomStatus || "UNAVAILABLE"}.`
      );

      return;
    }

    // ---------------------------------------------------
    // REQUEST
    // ---------------------------------------------------

    const requestData = {
      roomId: Number(roomId),
      checkInDate,
      checkOutDate,
      numberOfGuests:
        Number(
          numberOfGuests
        ),
    };

    console.log(
      "========================================"
    );

    console.log(
      "CREATING BOOKING"
    );

    console.log(
      "REQUEST DATA:",
      requestData
    );

    console.log(
      "========================================"
    );

    try {
      setBookingLoading(true);

      const response =
        await api.post(
          "/bookings",
          requestData
        );

      console.log(
        "========================================"
      );

      console.log(
        "BOOKING SUCCESS"
      );

      console.log(
        "STATUS:",
        response.status
      );

      console.log(
        "RESPONSE:",
        response.data
      );

      console.log(
        "========================================"
      );

      setSuccess(
        "Booking confirmed successfully!"
      );

      // -------------------------------------------------
      // GO TO MY BOOKINGS
      // -------------------------------------------------

      setTimeout(() => {
        router.push(
          "/bookings"
        );
      }, 800);

    } catch (err: any) {
      console.error(
        "========================================"
      );

      console.error(
        "BOOKING ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err?.response?.status
      );

      console.error(
        "RESPONSE:",
        err?.response?.data
      );

      console.error(
        "========================================"
      );

      const status =
        err?.response?.status;

      const message =
        err?.response?.data
          ?.message;

      if (
        status === 401
      ) {
        setError(
          "Please login before making a booking."
        );
      } else if (
        status === 403
      ) {
        setError(
          "You don't have permission to create bookings. Please login as a customer."
        );
      } else if (
        status === 400
      ) {
        setError(
          message ||
            "Invalid booking details."
        );
      } else if (
        status === 409
      ) {
        setError(
          message ||
            "This room is already booked for the selected dates."
        );
      } else if (
        status === 500
      ) {
        setError(
          message ||
            "Booking could not be completed."
        );
      } else {
        setError(
          message ||
            "Unable to create booking."
        );
      }

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
  // ROOM ERROR / UNAVAILABLE
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
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft
                size={18}
              />

              Back to Hotel
            </Link>

          </div>

        </section>

        <section className="flex min-h-[65vh] items-center justify-center px-6">

          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">

            <BedDouble
              size={60}
              className="mx-auto text-gray-400"
            />

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Booking unavailable
            </h1>

            <p className="mt-3 text-gray-600">
              {error ||
                "Room information is unavailable."}
            </p>

            {/* DEBUG INFORMATION */}

            <div className="mt-6 rounded-xl bg-gray-100 p-5 text-left text-sm">

              <p>
                <span className="font-semibold">
                  Room ID:
                </span>{" "}
                {roomId ||
                  "MISSING"}
              </p>

              <p className="mt-2">
                <span className="font-semibold">
                  Hotel ID:
                </span>{" "}
                {hotelId ||
                  "MISSING"}
              </p>

              <p className="mt-2 break-all">
                <span className="font-semibold">
                  API:
                </span>{" "}
                http://localhost:8080/api/rooms/
                {roomId ||
                  "MISSING"}
              </p>

            </div>

            <Link
              href={
                hotelId
                  ? `/hotels/${hotelId}`
                  : "/hotels"
              }
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
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

  const roomStatus =
    String(
      room.status || ""
    ).toUpperCase();

  const isAvailable =
    roomStatus ===
    "AVAILABLE";

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
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft
              size={18}
            />

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

            <CheckCircle2
              size={20}
            />

            <span>
              {success}
            </span>

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

                <CalendarDays
                  size={22}
                />

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
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 outline-none focus:border-black"
                    />

                  </div>

                </div>

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
                        checkInDate ||
                        getToday()
                      }
                      value={checkOutDate}
                      onChange={(e) =>
                        setCheckOutDate(
                          e.target.value
                        )
                      }
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 outline-none focus:border-black"
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
                    onChange={(e) =>
                      setNumberOfGuests(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 outline-none focus:border-black"
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
                    {roomStatus ||
                      "UNKNOWN"}
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
                    ).toLocaleString(
                      "en-IN"
                    )}
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
                {room.hotelName ||
                  "Hotel"}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Room{" "}
                {room.roomNumber}
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

                <div className="flex justify-between">

                  <span className="text-gray-500">
                    Capacity
                  </span>

                  <strong>
                    {room.capacity} Guests
                  </strong>

                </div>

                <div className="flex justify-between">

                  <span className="text-gray-500">
                    Floor
                  </span>

                  <strong>
                    {room.floor}
                  </strong>

                </div>

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

                <div className="flex justify-between border-t border-gray-200 pt-4">

                  <span className="text-gray-500">
                    Price / Night
                  </span>

                  <strong>
                    ₹
                    {Number(
                      room.pricePerNight
                    ).toLocaleString(
                      "en-IN"
                    )}
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