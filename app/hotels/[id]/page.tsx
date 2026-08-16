"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Star,
  CalendarDays,
  Users,
  BedDouble,
  Loader2,
  Hotel as HotelIcon,
} from "lucide-react";

import api from "@/lib/api";

interface Hotel {
  id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  starRating?: number;
  checkInTime?: string;
  checkOutTime?: string;
  imageUrl?: string;
  active?: boolean;
  averageRating?: number;
  totalReviews?: number;
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
  hotelId?: number;
  hotelName?: string;
  imageUrl?: string;
}

export default function HotelDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const hotelId = params?.id;

  const [hotel, setHotel] =
    useState<Hotel | null>(null);

  const [rooms, setRooms] =
    useState<Room[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [roomsLoading, setRoomsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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
  // LOAD HOTEL + ROOMS
  // =====================================================

  useEffect(() => {
    if (!hotelId) {
      return;
    }

    const fetchHotel = async () => {
      try {
        setLoading(true);
        setError("");

        console.log(
          "FETCH HOTEL:",
          `/hotels/${hotelId}`
        );

        const response =
          await api.get(
            `/hotels/${hotelId}`
          );

        console.log(
          "HOTEL RESPONSE:",
          response.data
        );

        setHotel(response.data);

      } catch (err: any) {
        console.error(
          "HOTEL DETAILS ERROR:",
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

        setError(
          err?.response?.data?.message ||
            "Unable to load hotel details."
        );

      } finally {
        setLoading(false);
      }
    };

    const fetchRooms = async () => {
      try {
        setRoomsLoading(true);

        console.log(
          "FETCH ROOMS:",
          `/rooms/hotel/${hotelId}`
        );

        const response =
          await api.get(
            `/rooms/hotel/${hotelId}`
          );

        console.log(
          "ROOMS RESPONSE:",
          response.data
        );

        const roomData =
          Array.isArray(response.data)
            ? response.data
            : response.data?.content ||
              response.data?.data ||
              [];

        setRooms(
          Array.isArray(roomData)
            ? roomData
            : []
        );

      } catch (err: any) {
        console.error(
          "ROOMS ERROR:",
          err
        );

        console.error(
          "ROOM STATUS:",
          err?.response?.status
        );

        console.error(
          "ROOM RESPONSE:",
          err?.response?.data
        );

        setRooms([]);

      } finally {
        setRoomsLoading(false);
      }
    };

    fetchHotel();
    fetchRooms();

  }, [hotelId]);

  // =====================================================
  // LOADING
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
            Loading hotel details...
          </p>

        </div>

      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (!hotel) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">

        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">

          <HotelIcon
            size={48}
            className="mx-auto text-gray-400"
          />

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Hotel not found
          </h1>

          <p className="mt-3 text-gray-600">
            {error ||
              "Unable to load this hotel."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/hotels")
            }
            className="mt-6 rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Back to Hotels
          </button>

        </div>

      </main>
    );
  }

  // =====================================================
  // HOTEL DATA
  // =====================================================

  const hotelImage =
    getImageUrl(
      hotel.imageUrl
    );

  const location = [
    hotel.address,
    hotel.city,
    hotel.state,
    hotel.country,
    hotel.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  const rating =
    hotel.averageRating ??
    hotel.starRating ??
    0;

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="bg-gray-950 px-6 py-10 text-white">

        <div className="mx-auto max-w-7xl">

          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              router.push("/hotels")
            }
            className="mb-7 flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
          >
            <ArrowLeft
              size={18}
            />

            Back to Hotels
          </button>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">

            {/* =================================================
                HOTEL IMAGE
            ================================================= */}

            <div className="h-[320px] overflow-hidden rounded-3xl bg-gray-800 sm:h-[400px]">

              {hotelImage ? (
                <img
                  src={hotelImage}
                  alt={hotel.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center">

                  <HotelIcon
                    size={70}
                    className="text-gray-500"
                  />

                </div>
              )}

            </div>

            {/* =================================================
                HOTEL DETAILS
            ================================================= */}

            <div>

              <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">

                <HotelIcon
                  size={17}
                />

                StayEase

              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {hotel.name}
              </h1>

              {/* RATING */}

              <div className="mt-5 flex flex-wrap items-center gap-4">

                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">

                  <Star
                    size={19}
                    className="fill-yellow-400 text-yellow-400"
                  />

                  <span className="font-semibold">
                    {Number(
                      rating
                    ).toFixed(1)}
                  </span>

                  {hotel.totalReviews !==
                    undefined && (
                    <span className="text-gray-400">
                      (
                      {
                        hotel.totalReviews
                      }{" "}
                      reviews)
                    </span>
                  )}

                </div>

                {hotel.starRating && (
                  <span className="text-gray-300">
                    {hotel.starRating}
                    -Star Hotel
                  </span>
                )}

              </div>

              {/* DESCRIPTION */}

              {hotel.description && (
                <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
                  {hotel.description}
                </p>
              )}

              {/* LOCATION */}

              {location && (
                <div className="mt-6 flex items-start gap-3 text-gray-300">

                  <MapPin
                    size={21}
                    className="mt-1 shrink-0"
                  />

                  <span>
                    {location}
                  </span>

                </div>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          HOTEL INFORMATION
      ================================================= */}

      <section className="px-6 py-10">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-5 md:grid-cols-3">

            {/* CHECK IN */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">

                  <CalendarDays
                    size={21}
                  />

                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Check-in
                  </p>

                  <p className="font-semibold text-gray-900">
                    {hotel.checkInTime ||
                      "Not specified"}
                  </p>

                </div>

              </div>

            </div>

            {/* CHECK OUT */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">

                  <CalendarDays
                    size={21}
                  />

                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Check-out
                  </p>

                  <p className="font-semibold text-gray-900">
                    {hotel.checkOutTime ||
                      "Not specified"}
                  </p>

                </div>

              </div>

            </div>

            {/* CONTACT */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

              <div className="space-y-3">

                {hotel.phone && (
                  <div className="flex items-center gap-3 text-gray-700">

                    <Phone
                      size={18}
                    />

                    <span>
                      {hotel.phone}
                    </span>

                  </div>
                )}

                {hotel.email && (
                  <div className="flex items-center gap-3 text-gray-700">

                    <Mail
                      size={18}
                    />

                    <span className="break-all">
                      {hotel.email}
                    </span>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          ROOMS
      ================================================= */}

      <section className="px-6 pb-16">

        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <div className="mb-7">

            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              StayEase Rooms
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Available Rooms
            </h2>

            <p className="mt-2 text-gray-600">
              Choose a room that fits your stay.
            </p>

          </div>

          {/* =================================================
              ROOM LOADING
          ================================================= */}

          {roomsLoading && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">

              <Loader2
                size={35}
                className="mx-auto animate-spin text-gray-800"
              />

              <p className="mt-4 text-gray-600">
                Loading available rooms...
              </p>

            </div>
          )}

          {/* =================================================
              NO ROOMS
          ================================================= */}

          {!roomsLoading &&
            rooms.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">

                <BedDouble
                  size={45}
                  className="mx-auto text-gray-400"
                />

                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  No rooms available
                </h3>

                <p className="mt-2 text-gray-600">
                  There are currently no rooms available for this hotel.
                </p>

              </div>
            )}

          {/* =================================================
              ROOM CARDS
          ================================================= */}

          {!roomsLoading &&
            rooms.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                {rooms.map(
                  (room) => {

                    const roomImage =
                      getImageUrl(
                        room.imageUrl
                      );

                    const roomStatus =
                      String(
                        room.status ||
                          ""
                      ).toUpperCase();

                    const isAvailable =
                      roomStatus ===
                      "AVAILABLE";

                    return (
                      <article
                        key={
                          room.id
                        }
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      >

                        {/* ROOM IMAGE */}

                        <div className="relative h-52 overflow-hidden bg-gray-100">

                          {roomImage ? (
                            <img
                              src={
                                roomImage
                              }
                              alt={`Room ${room.roomNumber}`}
                              className="h-full w-full object-cover transition duration-300 hover:scale-105"
                              onError={(
                                e
                              ) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">

                              <BedDouble
                                size={
                                  60
                                }
                                className="text-gray-400"
                              />

                            </div>
                          )}

                          {/* STATUS */}

                          <span
                            className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
                              isAvailable
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {roomStatus ||
                              "UNKNOWN"}
                          </span>

                        </div>

                        {/* ROOM CONTENT */}

                        <div className="p-6">

                          <div className="flex items-start justify-between gap-4">

                            <div>

                              <p className="text-sm text-gray-500">
                                Room{" "}
                                {
                                  room.roomNumber
                                }
                              </p>

                              <h3 className="mt-1 text-xl font-bold text-gray-900">
                                {
                                  room.roomType ||
                                    "Standard Room"
                                }
                              </h3>

                            </div>

                            <div className="text-right">

                              <p className="text-2xl font-bold text-gray-900">
                                ₹
                                {Number(
                                  room.pricePerNight ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                              <p className="text-xs text-gray-500">
                                per night
                              </p>

                            </div>

                          </div>

                          {/* ROOM INFO */}

                          <div className="mt-5 grid grid-cols-2 gap-3">

                            <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3">

                              <Users
                                size={
                                  17
                                }
                                className="text-gray-500"
                              />

                              <div>

                                <p className="text-xs text-gray-500">
                                  Capacity
                                </p>

                                <p className="text-sm font-semibold">
                                  {
                                    room.capacity ||
                                      "-"
                                  }{" "}
                                  Guests
                                </p>

                              </div>

                            </div>

                            <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3">

                              <BedDouble
                                size={
                                  17
                                }
                                className="text-gray-500"
                              />

                              <div>

                                <p className="text-xs text-gray-500">
                                  Floor
                                </p>

                                <p className="text-sm font-semibold">
                                  {room.floor ??
                                    "-"}
                                </p>

                              </div>

                            </div>

                          </div>

                          {/* DESCRIPTION */}

                          {room.description && (
                            <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-600">
                              {
                                room.description
                              }
                            </p>
                          )}

                          {/* =================================================
                              BOOK NOW
                          ================================================= */}

                          <button
                            type="button"
                            disabled={
                              !isAvailable
                            }
                            onClick={() => {

                              console.log(
                                "BOOK NOW ROOM:",
                                room
                              );

                              console.log(
                                "BOOK NOW HOTEL:",
                                hotel
                              );

                              if (
                                !room.id
                              ) {
                                console.error(
                                  "ROOM ID MISSING"
                                );

                                return;
                              }

                              if (
                                !hotel.id
                              ) {
                                console.error(
                                  "HOTEL ID MISSING"
                                );

                                return;
                              }

                              const bookingUrl =
                                `/booking?roomId=${encodeURIComponent(
                                  String(
                                    room.id
                                  )
                                )}&hotelId=${encodeURIComponent(
                                  String(
                                    hotel.id
                                  )
                                )}`;

                              console.log(
                                "BOOKING URL:",
                                bookingUrl
                              );

                              router.push(
                                bookingUrl
                              );
                            }}
                            className={`mt-6 w-full rounded-xl py-3 font-semibold transition ${
                              isAvailable
                                ? "bg-black text-white hover:bg-gray-800"
                                : "cursor-not-allowed bg-gray-200 text-gray-500"
                            }`}
                          >
                            {isAvailable
                              ? "Book Now"
                              : "Not Available"}
                          </button>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            )}

        </div>

      </section>

    </main>
  );
}