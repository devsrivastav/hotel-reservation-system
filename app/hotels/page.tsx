"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Hotel,
  MapPin,
  Loader2,
  Search,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";

interface HotelData {
  id: number;
  name: string;
  city?: string;
  address?: string;
  description?: string;
  imageUrl?: string | null;
}

export default function HotelsPage() {
  const [hotels, setHotels] =
    useState<HotelData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  // =====================================================
  // FETCH HOTELS
  // =====================================================

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/hotels");

      console.log(
        "Hotels API:",
        response.data
      );

      const data =
        response.data;

      if (Array.isArray(data)) {
        setHotels(data);
      } else if (
        Array.isArray(data.content)
      ) {
        setHotels(data.content);
      } else if (
        Array.isArray(data.data)
      ) {
        setHotels(data.data);
      } else {
        setHotels([]);
      }
    } catch (err: any) {
      console.error(
        "Hotels error:",
        err
      );

      if (
        err?.response?.status === 401
      ) {
        setError(
          "Please login to view hotels."
        );
      } else if (
        err?.response?.status === 403
      ) {
        setError(
          "You don't have permission to view hotels."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to load hotels."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    fetchHotels();
  }, []);

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
      imageUrl.startsWith(
        "http://"
      ) ||
      imageUrl.startsWith(
        "https://"
      )
    ) {
      return imageUrl;
    }

    const backendUrl =
      "http://localhost:8080";

    if (
      imageUrl.startsWith("/")
    ) {
      return `${backendUrl}${imageUrl}`;
    }

    return `${backendUrl}/${imageUrl}`;
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredHotels =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return hotels;
      }

      return hotels.filter(
        (hotel) =>
          hotel.name
            ?.toLowerCase()
            .includes(value) ||
          hotel.city
            ?.toLowerCase()
            .includes(value) ||
          hotel.address
            ?.toLowerCase()
            .includes(value) ||
          hotel.description
            ?.toLowerCase()
            .includes(value)
      );
    }, [hotels, search]);

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="bg-gray-950 px-6 py-16 text-white">

        <div className="mx-auto max-w-7xl">

          <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            StayEase
          </p>

          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Explore Hotels
          </h1>

          <p className="mt-4 max-w-2xl text-gray-400">
            Find comfortable hotels and choose
            the perfect room for your next stay.
          </p>

        </div>

      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="mx-auto max-w-7xl px-6 py-12">

        {/* =================================================
            SEARCH
        ================================================= */}

        {!loading && !error && (
          <div className="mb-8">

            <div className="relative max-w-xl">

              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search hotel, city or location..."
                className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
              />

            </div>

            <p className="mt-3 text-sm text-gray-500">

              Showing{" "}
              <span className="font-semibold text-gray-900">
                {
                  filteredHotels.length
                }
              </span>{" "}
              hotel
              {filteredHotels.length !==
              1
                ? "s"
                : ""}

            </p>

          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="flex items-center justify-center py-20">

            <Loader2
              size={34}
              className="animate-spin text-gray-900"
            />

            <span className="ml-3 text-gray-600">
              Loading hotels...
            </span>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <p className="font-semibold text-red-700">
              {error}
            </p>

            <button
              onClick={
                fetchHotels
              }
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >

              <RefreshCw
                size={16}
              />

              Try Again

            </button>

          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          filteredHotels.length ===
            0 && (

            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

              <Hotel
                size={50}
                className="mx-auto text-gray-400"
              />

              <h2 className="mt-5 text-xl font-bold text-gray-900">
                {hotels.length ===
                0
                  ? "No hotels available"
                  : "No hotels found"}
              </h2>

              <p className="mt-2 text-gray-500">

                {hotels.length ===
                0
                  ? "No hotels were found in the database."
                  : "Try searching with a different hotel name or city."}

              </p>

            </div>
          )}

        {/* =================================================
            HOTEL CARDS
        ================================================= */}

        {!loading &&
          !error &&
          filteredHotels.length >
            0 && (

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {filteredHotels.map(
                (hotel) => (

                  <div
                    key={hotel.id}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* =================================================
                        IMAGE
                    ================================================= */}

                    <div className="relative h-52 overflow-hidden bg-gray-200">

                      {hotel.imageUrl ? (

                        <img
                          src={getImageUrl(
                            hotel.imageUrl
                          )}
                          alt={
                            hotel.name
                          }
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(
                            e
                          ) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
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

                    {/* =================================================
                        DETAILS
                    ================================================= */}

                    <div className="p-6">

                      <h2 className="text-xl font-bold text-gray-900">
                        {
                          hotel.name
                        }
                      </h2>

                      {/* LOCATION */}

                      {(hotel.city ||
                        hotel.address) && (

                        <div className="mt-3 flex items-start gap-2 text-sm text-gray-500">

                          <MapPin
                            size={17}
                            className="mt-0.5 shrink-0"
                          />

                          <span>
                            {hotel.city ||
                              hotel.address}
                          </span>

                        </div>
                      )}

                      {/* DESCRIPTION */}

                      {hotel.description && (

                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-600">
                          {
                            hotel.description
                          }
                        </p>

                      )}

                      {/* VIEW HOTEL */}

                      <Link
                        href={`/hotels/${hotel.id}`}
                        className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                      >

                        View Hotel

                        <ArrowRight
                          size={17}
                        />

                      </Link>

                    </div>

                  </div>

                )
              )}

            </div>
          )}

      </section>

    </main>
  );
}