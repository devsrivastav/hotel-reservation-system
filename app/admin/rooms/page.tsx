"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  BedDouble,
  Loader2,
  ArrowLeft,
  Plus,
  X,
  Trash2,
  Pencil,
  Upload,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Hotel {
  id: number;
  name: string;
}

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

interface RoomForm {
  roomNumber: string;
  roomType: string;
  pricePerNight: string;
  capacity: string;
  floor: string;
  description: string;
  status: string;
  hotelId: string;
}

const roomTypes = [
  "STANDARD",
  "DELUXE",
  "SUPER_DELUXE",
  "SUITE",
  "PRESIDENTIAL_SUITE",
];

const roomStatuses = [
  "AVAILABLE",
  "OCCUPIED",
  "MAINTENANCE",
  "RESERVED",
];

const initialForm: RoomForm = {
  roomNumber: "",
  roomType: "STANDARD",
  pricePerNight: "",
  capacity: "1",
  floor: "0",
  description: "",
  status: "AVAILABLE",
  hotelId: "",
};

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [uploadingId, setUploadingId] =
    useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] = useState<RoomForm>({
    ...initialForm,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // FETCH ROOMS + HOTELS
  // =====================================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [roomsResponse, hotelsResponse] =
        await Promise.all([
          api.get("/rooms"),
          api.get("/hotels"),
        ]);

      console.log(
        "Rooms response:",
        roomsResponse.data
      );

      console.log(
        "Hotels response:",
        hotelsResponse.data
      );

      setRooms(roomsResponse.data);
      setHotels(hotelsResponse.data);
    } catch (err: any) {
      console.error(
        "Rooms loading error:",
        err
      );

      if (err?.response?.status === 401) {
        setError(
          "Please login first."
        );
      } else if (
        err?.response?.status === 403
      ) {
        setError(
          "You don't have permission to access rooms."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to load rooms."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const openAddForm = () => {
    setEditingId(null);

    setForm({
      ...initialForm,
      hotelId:
        hotels.length > 0
          ? String(hotels[0].id)
          : "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const openEditForm = (room: Room) => {
    setEditingId(room.id);

    setForm({
      roomNumber:
        room.roomNumber || "",

      roomType:
        room.roomType || "STANDARD",

      pricePerNight:
        room.pricePerNight != null
          ? String(room.pricePerNight)
          : "",

      capacity:
        room.capacity != null
          ? String(room.capacity)
          : "1",

      floor:
        room.floor != null
          ? String(room.floor)
          : "0",

      description:
        room.description || "",

      status:
        room.status || "AVAILABLE",

      hotelId:
        room.hotelId != null
          ? String(room.hotelId)
          : "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);

    setForm({
      ...initialForm,
    });
  };

  // =====================================================
  // CREATE / UPDATE ROOM
  // =====================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -----------------------------
    // Validation
    // -----------------------------

    if (!form.roomNumber.trim()) {
      setError(
        "Room number is required."
      );
      return;
    }

    if (!form.hotelId) {
      setError(
        "Please select a hotel."
      );
      return;
    }

    if (
      !form.pricePerNight ||
      Number(form.pricePerNight) <= 0
    ) {
      setError(
        "Price per night must be greater than 0."
      );
      return;
    }

    if (
      !form.capacity ||
      Number(form.capacity) <= 0
    ) {
      setError(
        "Capacity must be greater than 0."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        roomNumber:
          form.roomNumber.trim(),

        roomType:
          form.roomType,

        pricePerNight:
          Number(
            form.pricePerNight
          ),

        capacity:
          Number(form.capacity),

        floor:
          Number(form.floor),

        description:
          form.description.trim(),

        status:
          form.status,
      };

      console.log(
        "Room payload:",
        payload
      );

      // =================================================
      // UPDATE
      // =================================================

      if (editingId !== null) {
        await api.put(
          `/rooms/${editingId}`,
          payload
        );

        setSuccess(
          "Room updated successfully."
        );
      }

      // =================================================
      // CREATE
      // =================================================

      else {
        await api.post(
          "/rooms",
          {
            ...payload,
            hotelId:
              Number(form.hotelId),
          }
        );

        setSuccess(
          "Room created successfully."
        );
      }

      setShowForm(false);
      setEditingId(null);

      setForm({
        ...initialForm,
      });

      await fetchData();

    } catch (err: any) {
      console.error(
        "Save room error:",
        err
      );

      if (
        err?.response?.status === 401
      ) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (
        err?.response?.status === 403
      ) {
        setError(
          "You don't have permission to modify rooms."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to save room."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE ROOM
  // =====================================================

  const handleDelete = async (
    roomId: number,
    roomNumber: string
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete room ${roomNumber}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(roomId);

      setError("");
      setSuccess("");

      await api.delete(
        `/rooms/${roomId}`
      );

      setSuccess(
        "Room deleted successfully."
      );

      await fetchData();

    } catch (err: any) {
      console.error(
        "Delete room error:",
        err
      );

      if (
        err?.response?.status === 401
      ) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (
        err?.response?.status === 403
      ) {
        setError(
          "You don't have permission to delete rooms."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to delete room."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // IMAGE URL HELPER
  // =====================================================

  const getImageUrl = (
    imageUrl?: string | null
  ) => {
    if (!imageUrl) {
      return "";
    }

    // Already complete URL
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

    // Backend URL
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
  // UPLOAD ROOM IMAGE
  // =====================================================

  const handleImageUpload = async (
    roomId: number,
    file: File
  ) => {
    if (!file) {
      return;
    }

    // File type validation
    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select a valid image file."
      );
      return;
    }

    // 5 MB validation
    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Image size must be less than 5 MB."
      );
      return;
    }

    try {
      setUploadingId(roomId);

      setError("");
      setSuccess("");

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      console.log(
        "Uploading image for room:",
        roomId
      );

      await api.post(
        `/rooms/${roomId}/image`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setSuccess(
        "Room image uploaded successfully."
      );

      await fetchData();

    } catch (err: any) {
      console.error(
        "Image upload error:",
        err
      );

      if (
        err?.response?.status === 401
      ) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (
        err?.response?.status === 403
      ) {
        setError(
          "You don't have permission to upload room images."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to upload room image."
        );
      }
    } finally {
      setUploadingId(null);
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
            size={40}
            className="mx-auto animate-spin text-gray-900"
          />

          <p className="mt-4 text-gray-700">
            Loading rooms...
          </p>

        </div>

      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-gray-950 px-6 py-10 text-white">

        <div className="mx-auto max-w-7xl">

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft
              size={17}
            />

            Back to Dashboard
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>

              <p className="text-sm text-gray-400">
                Administration
              </p>

              <h1 className="mt-1 text-3xl font-bold text-white">
                Rooms Management
              </h1>

              <p className="mt-2 text-gray-400">
                Add, edit and manage hotel rooms.
              </p>

            </div>

            <button
              onClick={
                openAddForm
              }
              disabled={
                hotels.length === 0
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Plus
                size={19}
              />

              Add Room

            </button>

          </div>

        </div>

      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">

            <span>
              {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
              className="text-red-500 hover:text-red-800"
            >
              <X size={18} />
            </button>

          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">

            <span>
              {success}
            </span>

            <button
              onClick={() =>
                setSuccess("")
              }
              className="text-green-500 hover:text-green-800"
            >
              <X size={18} />
            </button>

          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mb-6 flex flex-wrap gap-4">

          {/* TOTAL ROOMS */}

          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">

            <p className="text-sm text-gray-500">
              Total Rooms
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {rooms.length}
            </p>

          </div>

          {/* TOTAL HOTELS */}

          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">

            <p className="text-sm text-gray-500">
              Hotels
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {hotels.length}
            </p>

          </div>

          {/* AVAILABLE */}

          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">

            <p className="text-sm text-gray-500">
              Available Rooms
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {
                rooms.filter(
                  (room) =>
                    room.status ===
                    "AVAILABLE"
                ).length
              }
            </p>

          </div>

        </div>

        {/* =================================================
            NO ROOMS
        ================================================= */}

        {rooms.length === 0 ? (

          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

            <BedDouble
              size={55}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              No rooms found
            </h2>

            <p className="mt-2 text-gray-600">
              Add your first room.
            </p>

            <button
              onClick={
                openAddForm
              }
              disabled={
                hotels.length === 0
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >

              <Plus
                size={18}
              />

              Add Room

            </button>

          </div>

        ) : (

          /* =================================================
             ROOM GRID
          ================================================= */

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {rooms.map(
              (room) => (

                <div
                  key={room.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >

                  {/* =================================================
                      IMAGE
                  ================================================= */}

                  <div className="relative h-48 bg-gray-100">

                    {room.imageUrl ? (

                      <img
                        src={getImageUrl(
                          room.imageUrl
                        )}
                        alt={`Room ${room.roomNumber}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          console.error(
                            "Image failed to load:",
                            getImageUrl(
                              room.imageUrl
                            )
                          );

                          e.currentTarget.style.display =
                            "none";
                        }}
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center">

                        <BedDouble
                          size={65}
                          className="text-gray-400"
                        />

                      </div>

                    )}

                  </div>

                  {/* =================================================
                      DETAILS
                  ================================================= */}

                  <div className="p-6">

                    {/* ROOM NUMBER + STATUS */}

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="text-sm text-gray-500">
                          Room
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900">
                          {
                            room.roomNumber
                          }
                        </h2>

                      </div>

                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-bold ${
                          room.status ===
                          "AVAILABLE"
                            ? "bg-green-100 text-green-700"
                            : room.status ===
                              "OCCUPIED"
                            ? "bg-red-100 text-red-700"
                            : room.status ===
                              "MAINTENANCE"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {
                          room.status
                        }
                      </span>

                    </div>

                    {/* ROOM INFORMATION */}

                    <div className="mt-5 space-y-3 text-sm">

                      {/* TYPE */}

                      <div className="flex justify-between gap-4">

                        <span className="text-gray-500">
                          Type
                        </span>

                        <span className="text-right font-semibold text-gray-900">
                          {
                            room.roomType.replace(
                              /_/g,
                              " "
                            )
                          }
                        </span>

                      </div>

                      {/* PRICE */}

                      <div className="flex justify-between gap-4">

                        <span className="text-gray-500">
                          Price / Night
                        </span>

                        <span className="font-semibold text-gray-900">
                          ₹
                          {Number(
                            room.pricePerNight
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>

                      {/* CAPACITY */}

                      <div className="flex justify-between">

                        <span className="text-gray-500">
                          Capacity
                        </span>

                        <span className="font-semibold text-gray-900">

                          {
                            room.capacity
                          }{" "}

                          {room.capacity ===
                          1
                            ? "Guest"
                            : "Guests"}

                        </span>

                      </div>

                      {/* FLOOR */}

                      <div className="flex justify-between">

                        <span className="text-gray-500">
                          Floor
                        </span>

                        <span className="font-semibold text-gray-900">
                          {
                            room.floor
                          }
                        </span>

                      </div>

                    </div>

                    {/* HOTEL */}

                    <div className="mt-5 border-t border-gray-200 pt-4">

                      <p className="text-sm text-gray-500">
                        Hotel
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">

                        {room.hotelName ||
                          hotels.find(
                            (hotel) =>
                              hotel.id ===
                              room.hotelId
                          )?.name ||
                          "Unknown Hotel"}

                      </p>

                    </div>

                    {/* DESCRIPTION */}

                    {room.description && (
                      <p className="mt-4 line-clamp-2 text-sm text-gray-600">
                        {
                          room.description
                        }
                      </p>
                    )}

                    {/* =================================================
                        IMAGE UPLOAD
                    ================================================= */}

                    <div className="mt-5">

                      <label
                        htmlFor={`room-image-${room.id}`}
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 ${
                          uploadingId ===
                          room.id
                            ? "pointer-events-none opacity-60"
                            : ""
                        }`}
                      >

                        {uploadingId ===
                        room.id ? (

                          <>
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />

                            Uploading...
                          </>

                        ) : (

                          <>
                            <Upload
                              size={17}
                            />

                            {room.imageUrl
                              ? "Change Image"
                              : "Upload Image"}
                          </>

                        )}

                      </label>

                      <input
                        id={`room-image-${room.id}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={
                          uploadingId ===
                          room.id
                        }
                        onChange={(
                          e
                        ) => {

                          const file =
                            e.target.files?.[0];

                          if (file) {
                            handleImageUpload(
                              room.id,
                              file
                            );
                          }

                          e.target.value =
                            "";
                        }}
                      />

                      <p className="mt-1 text-center text-xs text-gray-400">
                        JPG, PNG or WEBP • Max 5 MB
                      </p>

                    </div>

                    {/* =================================================
                        EDIT + DELETE
                    ================================================= */}

                    <div className="mt-5 flex gap-3">

                      {/* EDIT */}

                      <button
                        onClick={() =>
                          openEditForm(
                            room
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                      >

                        <Pencil
                          size={16}
                        />

                        Edit

                      </button>

                      {/* DELETE */}

                      <button
                        onClick={() =>
                          handleDelete(
                            room.id,
                            room.roomNumber
                          )
                        }
                        disabled={
                          deletingId ===
                          room.id
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        {deletingId ===
                        room.id ? (

                          <Loader2
                            size={16}
                            className="animate-spin"
                          />

                        ) : (

                          <Trash2
                            size={16}
                          />

                        )}

                        {deletingId ===
                        room.id
                          ? "Deleting..."
                          : "Delete"}

                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 px-4 py-8">

          <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">

                  {editingId !==
                  null
                    ? "Edit Room"
                    : "Add New Room"}

                </h2>

                <p className="mt-1 text-sm text-gray-600">

                  {editingId !==
                  null
                    ? "Update room information."
                    : "Enter room information below."}

                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeForm
                }
                disabled={
                  saving
                }
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >

                <X
                  size={22}
                />

              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="bg-white p-6"
            >

              <div className="grid gap-5 md:grid-cols-2">

                {/* HOTEL */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Hotel *
                  </label>

                  <select
                    name="hotelId"
                    value={
                      form.hotelId
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={
                      editingId !==
                      null
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-500"
                  >

                    <option value="">
                      Select Hotel
                    </option>

                    {hotels.map(
                      (
                        hotel
                      ) => (

                        <option
                          key={
                            hotel.id
                          }
                          value={
                            hotel.id
                          }
                        >
                          {
                            hotel.name
                          }
                        </option>

                      )
                    )}

                  </select>

                  {editingId !==
                    null && (
                    <p className="mt-1 text-xs text-gray-500">
                      Hotel cannot be changed while editing.
                    </p>
                  )}

                </div>

                {/* ROOM NUMBER */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Room Number *
                  </label>

                  <input
                    name="roomNumber"
                    value={
                      form.roomNumber
                    }
                    onChange={
                      handleChange
                    }
                    required
                    maxLength={
                      20
                    }
                    placeholder="101"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* ROOM TYPE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Room Type *
                  </label>

                  <select
                    name="roomType"
                    value={
                      form.roomType
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  >

                    {roomTypes.map(
                      (
                        type
                      ) => (

                        <option
                          key={
                            type
                          }
                          value={
                            type
                          }
                        >
                          {
                            type.replace(
                              /_/g,
                              " "
                            )
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* PRICE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Price Per Night *
                  </label>

                  <input
                    type="number"
                    name="pricePerNight"
                    value={
                      form.pricePerNight
                    }
                    onChange={
                      handleChange
                    }
                    required
                    min="1"
                    step="0.01"
                    placeholder="3500"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* CAPACITY */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Capacity *
                  </label>

                  <input
                    type="number"
                    name="capacity"
                    value={
                      form.capacity
                    }
                    onChange={
                      handleChange
                    }
                    required
                    min="1"
                    placeholder="2"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* FLOOR */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Floor *
                  </label>

                  <input
                    type="number"
                    name="floor"
                    value={
                      form.floor
                    }
                    onChange={
                      handleChange
                    }
                    required
                    min="0"
                    placeholder="1"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* STATUS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  >

                    {roomStatuses.map(
                      (
                        status
                      ) => (

                        <option
                          key={
                            status
                          }
                          value={
                            status
                          }
                        >
                          {
                            status
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* DESCRIPTION */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    rows={
                      4
                    }
                    placeholder="Spacious deluxe room..."
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={
                    saving
                  }
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving && (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? editingId !==
                      null
                      ? "Updating..."
                      : "Creating..."
                    : editingId !==
                      null
                    ? "Update Room"
                    : "Create Room"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}