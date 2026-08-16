"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Hotel,
  Users,
  BedDouble,
  Building2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
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
  hotelName: string;
  imageUrl?: string | null;
}

export default function RoomsPage() {
  const searchParams = useSearchParams();

  const hotelId = searchParams.get("hotelId");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/rooms");

        console.log("Rooms API:", response.data);

        let data: Room[] = [];

        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data.content)) {
          data = response.data.content;
        } else if (Array.isArray(response.data.data)) {
          data = response.data.data;
        }

        // If hotelId exists, show rooms of that hotel only
        if (hotelId) {
          data = data.filter(
            (room) => String(room.hotelId) === String(hotelId)
          );
        }

        setRooms(data);
      } catch (err: any) {
        console.error("Rooms error:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load rooms."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [hotelId]);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <section className="bg-gray-950 px-6 py-14 text-white">

        <div className="mx-auto max-w-7xl">

          <Link
            href={
              hotelId
                ? `/hotels/${hotelId}`
                : "/hotels"
            }
            className="mb-7 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Hotel
          </Link>

          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            StayEase
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Available Rooms
          </h1>

          <p className="mt-4 max-w-2xl text-gray-400">
            Choose a comfortable room that fits your needs
            and budget.
          </p>

        </div>

      </section>

      {/* Rooms */}
      <section className="mx-auto max-w-7xl px-6 py-12">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">

            <Loader2
              size={32}
              className="animate-spin"
            />

            <span className="ml-3 text-gray-600">
              Loading rooms...
            </span>

          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && rooms.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">

            <BedDouble
              size={48}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-4 text-xl font-semibold">
              No rooms available
            </h2>

            <p className="mt-2 text-gray-500">
              There are currently no rooms available for
              this hotel.
            </p>

          </div>
        )}

        {/* Room Cards */}
        {!loading && !error && rooms.length > 0 && (

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {rooms.map((room) => {

              const isAvailable =
                room.status === "AVAILABLE";

              return (
                <div
                  key={room.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* Image */}
                  <div className="flex h-52 items-center justify-center bg-gray-200">

                    {room.imageUrl ? (
                      <img
                        src={room.imageUrl}
                        alt={`Room ${room.roomNumber}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BedDouble
                        size={65}
                        className="text-gray-400"
                      />
                    )}

                  </div>

                  {/* Content */}
                  <div className="p-6">

                    {/* Room Type + Status */}
                    <div className="flex items-center justify-between gap-3">

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {room.roomType}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {room.status}
                      </span>

                    </div>

                    {/* Room Number */}
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">
                      Room {room.roomNumber}
                    </h2>

                    {/* Hotel */}
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">

                      <Hotel size={16} />

                      <span>
                        {room.hotelName}
                      </span>

                    </div>

                    {/* Description */}
                    {room.description && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-600">
                        {room.description}
                      </p>
                    )}

                    {/* Room Details */}
                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-gray-50 p-3">

                        <div className="flex items-center gap-2 text-gray-500">
                          <Users size={16} />

                          <span className="text-xs">
                            Guests
                          </span>
                        </div>

                        <p className="mt-1 font-semibold">
                          {room.capacity}
                        </p>

                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">

                        <div className="flex items-center gap-2 text-gray-500">
                          <Building2 size={16} />

                          <span className="text-xs">
                            Floor
                          </span>
                        </div>

                        <p className="mt-1 font-semibold">
                          {room.floor}
                        </p>

                      </div>

                    </div>

                    {/* Price */}
                    <div className="mt-6 flex items-end justify-between">

                      <div>

                        <p className="text-xs text-gray-500">
                          Price per night
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-900">
                          ₹
                          {room.pricePerNight.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>

                    </div>

                    {/* Book Button */}
                    <Link
                      href={
                        isAvailable
                          ? `/bookings?roomId=${room.id}`
                          : "#"
                      }
                      className={`mt-5 block rounded-xl px-4 py-3 text-center font-semibold transition ${
                        isAvailable
                          ? "bg-black text-white hover:bg-gray-800"
                          : "cursor-not-allowed bg-gray-200 text-gray-500"
                      }`}
                      onClick={(e) => {
                        if (!isAvailable) {
                          e.preventDefault();
                        }
                      }}
                    >
                      {isAvailable
                        ? "Book Now"
                        : "Not Available"}
                    </Link>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </section>

    </main>
  );
}