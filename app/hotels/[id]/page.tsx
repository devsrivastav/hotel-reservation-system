"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import Link from "next/link";

import {

  ArrowLeft,

  MapPin,

  Phone,

  Mail,

  Star,

  Clock,

  Hotel as HotelIcon,

  Loader2,

  CalendarDays,

} from "lucide-react";

import api from "@/lib/api";

interface HotelData {

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

  imageUrl?: string | null;

  active?: boolean;

  averageRating?: number;

  totalReviews?: number;

}

interface RoomData {

  id: number;

  roomNumber: string;

  roomType: string;

  pricePerNight: number;

  capacity: number;

  floor: number;

  description?: string;

  imageUrl?: string | null;

  status: string;

  hotelId: number;

  hotelName: string;

}

export default function HotelDetailsPage() {

  const params = useParams();

  const router = useRouter();

  const hotelId = params.id;

  const [hotel, setHotel] = useState<HotelData | null>(null);

  const [rooms, setRooms] = useState<RoomData[]>([]);

  const [loading, setLoading] = useState(true);

  const [roomsLoading, setRoomsLoading] = useState(true);

  const [error, setError] = useState("");

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

  const fetchHotel = async () => {

    try {

      setLoading(true);

      setError("");

      const response = await api.get(`/hotels/${hotelId}`);

      setHotel(response.data);

    } catch (err: any) {

      console.error("Hotel details error:", err);

      if (err?.response?.status === 404) {

        setError("Hotel not found.");

      } else if (err?.response?.status === 401) {

        setError("Please login to view this hotel.");

      } else {

        setError(

          err?.response?.data?.message ||

            "Unable to load hotel details."

        );

      }

    } finally {

      setLoading(false);

    }

  };

  const fetchRooms = async () => {

    try {

      setRoomsLoading(true);

      const response = await api.get(

        `/rooms/hotel/${hotelId}`

      );

      const data = response.data;

      if (Array.isArray(data)) {

        setRooms(data);

      } else if (Array.isArray(data?.content)) {

        setRooms(data.content);

      } else {

        setRooms([]);

      }

    } catch (err) {

      console.error("Rooms error:", err);

      setRooms([]);

    } finally {

      setRoomsLoading(false);

    }

  };

  useEffect(() => {

    if (!hotelId) {

      return;

    }

    fetchHotel();

    fetchRooms();

  }, [hotelId]);

  if (loading) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-gray-50">

        <div className="flex items-center gap-3 text-gray-600">

          <Loader2

            size={32}

            className="animate-spin text-gray-900"

          />

          <span>Loading hotel...</span>

        </div>

      </main>

    );

  }

  if (error || !hotel) {

    return (

      <main className="min-h-screen bg-gray-50 px-6 py-12">

        <div className="mx-auto max-w-4xl">

          <Link

            href="/hotels"

            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-950"

          >

            <ArrowLeft size={18} />

            Back to Hotels

          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">

            <h1 className="text-xl font-bold text-red-700">

              {error || "Hotel not found"}

            </h1>

            <p className="mt-2 text-red-600">

              We could not load this hotel.

            </p>

          </div>

        </div>

      </main>

    );

  }

  const location = [

    hotel.address,

    hotel.city,

    hotel.state,

    hotel.country,

    hotel.zipCode,

  ]

    .filter(Boolean)

    .join(", ");

  return (

    <main className="min-h-screen bg-gray-50">

      {/* HERO */}

      <section className="bg-gray-950 px-6 py-8 text-white">

        <div className="mx-auto max-w-7xl">

          <Link

            href="/hotels"

            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-white"

          >

            <ArrowLeft size={18} />

            Back to Hotels

          </Link>

        </div>

      </section>

      {/* HOTEL DETAILS */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

          {/* IMAGE */}

          <div className="relative h-72 overflow-hidden bg-gray-200 md:h-[420px]">

            {hotel.imageUrl ? (

              <img

                src={getImageUrl(hotel.imageUrl)}

                alt={hotel.name}

                className="h-full w-full object-cover"

              />

            ) : (

              <div className="flex h-full items-center justify-center">

                <HotelIcon

                  size={90}

                  className="text-gray-400"

                />

              </div>

            )}

            {hotel.active && (

              <span className="absolute right-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow">

                Available

              </span>

            )}

          </div>

          {/* INFORMATION */}

          <div className="p-6 md:p-10">

            <div className="flex flex-col justify-between gap-6 md:flex-row">

              <div>

                <h1 className="text-3xl font-bold text-gray-950 md:text-4xl">

                  {hotel.name}

                </h1>

                {location && (

                  <div className="mt-4 flex items-start gap-2 text-gray-600">

                    <MapPin

                      size={19}

                      className="mt-0.5 shrink-0"

                    />

                    <span>{location}</span>

                  </div>

                )}

              </div>

              {/* RATING */}

              <div className="rounded-2xl bg-gray-50 px-5 py-4">

                <div className="flex items-center gap-2">

                  <Star

                    size={20}

                    className="fill-yellow-400 text-yellow-400"

                  />

                  <span className="text-xl font-bold text-gray-950">

                    {hotel.averageRating ??

                      hotel.starRating ??

                      "N/A"}

                  </span>

                </div>

                <p className="mt-1 text-sm text-gray-500">

                  {hotel.totalReviews ?? 0} reviews

                </p>

              </div>

            </div>

            {/* DESCRIPTION */}

            {hotel.description && (

              <div className="mt-8">

                <h2 className="text-xl font-bold text-gray-950">

                  About this hotel

                </h2>

                <p className="mt-3 max-w-4xl leading-7 text-gray-600">

                  {hotel.description}

                </p>

              </div>

            )}

            {/* HOTEL INFO */}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl bg-gray-50 p-5">

                <Clock

                  size={22}

                  className="text-gray-700"

                />

                <p className="mt-3 text-sm text-gray-500">

                  Check-in

                </p>

                <p className="mt-1 font-semibold text-gray-950">

                  {hotel.checkInTime || "Not specified"}

                </p>

              </div>

              <div className="rounded-2xl bg-gray-50 p-5">

                <Clock

                  size={22}

                  className="text-gray-700"

                />

                <p className="mt-3 text-sm text-gray-500">

                  Check-out

                </p>

                <p className="mt-1 font-semibold text-gray-950">

                  {hotel.checkOutTime || "Not specified"}

                </p>

              </div>

              <div className="rounded-2xl bg-gray-50 p-5">

                <Phone

                  size={22}

                  className="text-gray-700"

                />

                <p className="mt-3 text-sm text-gray-500">

                  Phone

                </p>

                <p className="mt-1 break-all font-semibold text-gray-950">

                  {hotel.phone || "Not available"}

                </p>

              </div>

              <div className="rounded-2xl bg-gray-50 p-5">

                <Mail

                  size={22}

                  className="text-gray-700"

                />

                <p className="mt-3 text-sm text-gray-500">

                  Email

                </p>

                <p className="mt-1 break-all font-semibold text-gray-950">

                  {hotel.email || "Not available"}

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ROOMS */}

      <section className="mx-auto max-w-7xl px-6 pb-16">

        <div className="mb-7">

          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">

            StayEase

          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-950">

            Available Rooms

          </h2>

          <p className="mt-2 text-gray-600">

            Choose a room that fits your stay.

          </p>

        </div>

        {roomsLoading ? (

          <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-16">

            <Loader2

              size={30}

              className="animate-spin text-gray-900"

            />

            <span className="ml-3 text-gray-600">

              Loading rooms...

            </span>

          </div>

        ) : rooms.length === 0 ? (

          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">

            <HotelIcon

              size={55}

              className="mx-auto text-gray-400"

            />

            <h3 className="mt-5 text-xl font-bold text-gray-950">

              No rooms available

            </h3>

            <p className="mt-2 text-gray-500">

              There are currently no rooms available for this hotel.

            </p>

          </div>

        ) : (

          <div className="grid gap-6 md:grid-cols-2">

            {rooms.map((room) => (

              <div

                key={room.id}

                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg"

              >

                {/* ROOM IMAGE */}

                <div className="h-52 overflow-hidden bg-gray-200">

                  {room.imageUrl ? (

                    <img

                      src={getImageUrl(room.imageUrl)}

                      alt={room.roomType}

                      className="h-full w-full object-cover"

                    />

                  ) : (

                    <div className="flex h-full items-center justify-center">

                      <HotelIcon

                        size={60}

                        className="text-gray-400"

                      />

                    </div>

                  )}

                </div>

                <div className="p-6">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-sm font-medium text-gray-500">

                        Room {room.roomNumber}

                      </p>

                      <h3 className="mt-1 text-xl font-bold text-gray-950">

                        {room.roomType.replaceAll("_", " ")}

                      </h3>

                    </div>

                    <span

                      className={`rounded-full px-3 py-1 text-xs font-semibold ${

                        room.status === "AVAILABLE"

                          ? "bg-green-100 text-green-700"

                          : "bg-gray-100 text-gray-600"

                      }`}

                    >

                      {room.status}

                    </span>

                  </div>

                  {room.description && (

                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-600">

                      {room.description}

                    </p>

                  )}

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">

                    <div className="rounded-xl bg-gray-50 p-3">

                      <p className="text-gray-500">

                        Capacity

                      </p>

                      <p className="mt-1 font-semibold text-gray-950">

                        {room.capacity} guests

                      </p>

                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">

                      <p className="text-gray-500">

                        Floor

                      </p>

                      <p className="mt-1 font-semibold text-gray-950">

                        {room.floor}

                      </p>

                    </div>

                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">

                    <div>

                      <p className="text-xs text-gray-500">

                        Starting from

                      </p>

                      <p className="text-2xl font-bold text-gray-950">

                        ₹{room.pricePerNight}

                        <span className="text-sm font-normal text-gray-500">

                          {" "}

                          / night

                        </span>

                      </p>

                    </div>

                    {room.status === "AVAILABLE" ? (

                      <button

                        type="button"

                        onClick={() =>

                          router.push(

                            `/booking?roomId=${room.id}&hotelId=${hotel.id}`

                          )

                        }

                        className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"

                      >

                        <CalendarDays size={17} />

                        Book Now

                      </button>

                    ) : (

                      <button

                        type="button"

                        disabled

                        className="cursor-not-allowed rounded-xl bg-gray-200 px-5 py-3 text-sm font-semibold text-gray-500"

                      >

                        Not Available

                      </button>

                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>

  );

}
