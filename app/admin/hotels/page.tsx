"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Hotel as HotelIcon,
  Loader2,
  ArrowLeft,
  Plus,
  X,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

import Link from "next/link";
import api from "@/lib/api";

interface Hotel {
  id: number;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  starRating?: number;
  checkInTime?: string;
  checkOutTime?: string;
  imageUrl?: string | null;
}

interface HotelForm {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  starRating: number;
  checkInTime: string;
  checkOutTime: string;
}

const initialForm: HotelForm = {
  name: "",
  description: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  zipCode: "",
  phone: "",
  email: "",
  starRating: 1,
  checkInTime: "14:00",
  checkOutTime: "11:00",
};

export default function AdminHotelsPage() {
  // =====================================================
  // STATE
  // =====================================================

  const [hotels, setHotels] = useState<Hotel[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] =
    useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] = useState<HotelForm>({
    ...initialForm,
  });

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // FETCH HOTELS
  // =====================================================

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/hotels");

      setHotels(response.data);
    } catch (err: any) {
      console.error(
        "Hotels loading error:",
        err
      );

      if (err?.response?.status === 401) {
        setError(
          "Please login first."
        );
      } else if (err?.response?.status === 403) {
        setError(
          "You don't have permission to access hotels."
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

  useEffect(() => {
    fetchHotels();
  }, []);

  // =====================================================
  // HANDLE INPUT
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
      [name]:
        name === "starRating"
          ? Number(value)
          : value,
    }));
  };

  // =====================================================
  // HANDLE IMAGE
  // =====================================================

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate image type
    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      e.target.value = "";
      return;
    }

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must be less than 5 MB."
      );

      e.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);

    // Create preview
    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // =====================================================
  // ADD HOTEL
  // =====================================================

  const openAddForm = () => {
    setEditingId(null);

    setForm({
      ...initialForm,
    });

    setImageFile(null);
    setImagePreview(null);

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =====================================================
  // EDIT HOTEL
  // =====================================================

  const openEditForm = (hotel: Hotel) => {
    setEditingId(hotel.id);

    setForm({
      name: hotel.name || "",
      description: hotel.description || "",
      address: hotel.address || "",
      city: hotel.city || "",
      state: hotel.state || "",
      country: hotel.country || "India",
      zipCode: hotel.zipCode || "",
      phone: hotel.phone || "",
      email: hotel.email || "",
      starRating: hotel.starRating || 1,
      checkInTime:
        hotel.checkInTime?.slice(0, 5) ||
        "14:00",
      checkOutTime:
        hotel.checkOutTime?.slice(0, 5) ||
        "11:00",
    });

    setImageFile(null);

    setImagePreview(
      hotel.imageUrl || null
    );

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {
    if (saving || uploadingImage) {
      return;
    }

    setShowForm(false);
    setEditingId(null);

    setForm({
      ...initialForm,
    });

    setImageFile(null);
    setImagePreview(null);
  };

  // =====================================================
  // CREATE / UPDATE HOTEL
  // =====================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        description:
          form.description.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        zipCode: form.zipCode.trim(),
        phone: form.phone.trim(),
        email:
          form.email.trim() || null,
        starRating: Number(
          form.starRating
        ),
        checkInTime:
          form.checkInTime,
        checkOutTime:
          form.checkOutTime,
      };

      let hotelId: number;

      // =================================================
      // UPDATE HOTEL
      // =================================================

      if (editingId !== null) {
        const response =
          await api.put(
            `/hotels/${editingId}`,
            payload
          );

        hotelId =
          response.data?.id ||
          editingId;

        setSuccess(
          "Hotel updated successfully."
        );
      }

      // =================================================
      // CREATE HOTEL
      // =================================================

      else {
        const response =
          await api.post(
            "/hotels",
            payload
          );

        hotelId =
          response.data?.id;

        if (!hotelId) {
          throw new Error(
            "Hotel was created but hotel ID was not returned."
          );
        }

        setSuccess(
          "Hotel created successfully."
        );
      }

      // =================================================
      // UPLOAD IMAGE
      // =================================================

      if (imageFile && hotelId) {
        try {
          setUploadingImage(true);

          const formData =
            new FormData();

          formData.append(
            "file",
            imageFile
          );

          await api.post(
            `/hotels/${hotelId}/image`,
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

          setSuccess(
            editingId !== null
              ? "Hotel and image updated successfully."
              : "Hotel and image created successfully."
          );
        } catch (imageError: any) {
          console.error(
            "Hotel image upload error:",
            imageError
          );

          setError(
            imageError?.response?.data ||
            "Hotel saved, but image upload failed."
          );
        } finally {
          setUploadingImage(false);
        }
      }

      // =================================================
      // RESET
      // =================================================

      setShowForm(false);
      setEditingId(null);

      setForm({
        ...initialForm,
      });

      setImageFile(null);
      setImagePreview(null);

      await fetchHotels();
    } catch (err: any) {
      console.error(
        "Save hotel error:",
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
          "You don't have permission to modify hotels."
        );
      } else {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to save hotel."
        );
      }
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  // =====================================================
  // DELETE HOTEL
  // =====================================================

  const handleDelete = async (
    hotelId: number,
    hotelName: string
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${hotelName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(hotelId);
      setError("");
      setSuccess("");

      await api.delete(
        `/hotels/${hotelId}`
      );

      setSuccess(
        "Hotel deleted successfully."
      );

      await fetchHotels();
    } catch (err: any) {
      console.error(
        "Delete hotel error:",
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
          "You don't have permission to delete hotels."
        );
      } else {
        setError(
          err?.response?.data?.message ||
          "Unable to delete hotel."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // LOADING
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
            Loading hotels...
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
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>
              <p className="text-sm text-gray-400">
                Administration
              </p>

              <h1 className="mt-1 text-3xl font-bold text-white">
                Hotels Management
              </h1>

              <p className="mt-2 text-gray-400">
                Add, edit and manage your hotels.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-gray-900 hover:bg-gray-200"
            >
              <Plus size={19} />
              Add Hotel
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
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* COUNT */}

        <div className="mb-6">
          <p className="text-gray-700">
            Total Hotels:{" "}
            <span className="font-bold text-gray-950">
              {hotels.length}
            </span>
          </p>
        </div>

        {/* =================================================
            HOTEL LIST
        ================================================= */}

        {hotels.length === 0 ? (

          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

            <HotelIcon
              size={55}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              No hotels found
            </h2>

            <p className="mt-2 text-gray-600">
              Add your first hotel to get started.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white hover:bg-gray-800"
            >
              <Plus size={18} />
              Add Hotel
            </button>

          </div>

        ) : (

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {hotels.map((hotel) => (

              <div
                key={hotel.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >

                {/* IMAGE */}

                <div className="flex h-52 items-center justify-center overflow-hidden bg-gray-100">

                  {hotel.imageUrl ? (

                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />

                  ) : (

                    <HotelIcon
                      size={55}
                      className="text-gray-400"
                    />

                  )}

                </div>

                {/* DETAILS */}

                <div className="p-6">

                  <div className="flex items-start justify-between gap-3">

                    <h2 className="text-xl font-bold text-gray-900">
                      {hotel.name}
                    </h2>

                    <span className="whitespace-nowrap rounded-lg bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-900">
                      ⭐ {hotel.starRating ?? 0}
                    </span>

                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                    {hotel.description ||
                      "No description available."}
                  </p>

                  <div className="mt-5 space-y-2 text-sm text-gray-700">

                    <p>
                      📍 {hotel.address}
                    </p>

                    <p>
                      🏙️ {hotel.city},{" "}
                      {hotel.state}
                    </p>

                    {hotel.phone && (
                      <p>
                        📞 {hotel.phone}
                      </p>
                    )}

                    {hotel.email && (
                      <p className="truncate">
                        ✉️ {hotel.email}
                      </p>
                    )}

                  </div>

                  {/* ACTIONS */}

                  <div className="mt-6 flex gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(hotel)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          hotel.id,
                          hotel.name
                        )
                      }
                      disabled={
                        deletingId === hotel.id
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {deletingId === hotel.id ? (

                        <Loader2
                          size={16}
                          className="animate-spin"
                        />

                      ) : (

                        <Trash2 size={16} />

                      )}

                      {deletingId === hotel.id
                        ? "Deleting..."
                        : "Delete"}

                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showForm && (

        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 px-4 py-8">

          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">

              <div>

                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId !== null
                    ? "Edit Hotel"
                    : "Add New Hotel"}
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  {editingId !== null
                    ? "Update hotel information."
                    : "Enter hotel information below."}
                </p>

              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={
                  saving ||
                  uploadingImage
                }
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-950 disabled:opacity-50"
              >
                <X size={22} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="bg-white p-6"
            >

              <div className="grid gap-5 md:grid-cols-2">

                {/* NAME */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Hotel Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Grand Palace Hotel"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Luxury hotel in Gorakhpur..."
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* ADDRESS */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Address *
                  </label>

                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    placeholder="MG Road"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* CITY */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    City *
                  </label>

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    placeholder="Gorakhpur"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* STATE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    State *
                  </label>

                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    placeholder="Uttar Pradesh"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* COUNTRY */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Country *
                  </label>

                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                    placeholder="India"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* ZIP */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    ZIP Code
                  </label>

                  <input
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleChange}
                    placeholder="273001"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* PHONE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="hotel@example.com"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* HOTEL IMAGE */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Hotel Image
                  </label>

                  <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-900 text-white">
                        <ImageIcon size={21} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Upload hotel photo
                        </p>

                        <p className="text-xs text-gray-500">
                          JPG, JPEG, PNG or WEBP • Max 5 MB
                        </p>
                      </div>

                    </div>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleImageChange}
                      className="mt-4 w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-800"
                    />

                    {/* IMAGE PREVIEW */}

                    {imagePreview && (
                      <div className="relative mt-5 overflow-hidden rounded-xl border border-gray-200">

                        <img
                          src={imagePreview}
                          alt="Hotel preview"
                          className="h-64 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          disabled={
                            saving ||
                            uploadingImage
                          }
                          className="absolute right-3 top-3 rounded-lg bg-black/70 px-3 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50"
                        >
                          Remove
                        </button>

                      </div>
                    )}

                  </div>

                </div>

                {/* STAR RATING */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Star Rating
                  </label>

                  <select
                    name="starRating"
                    value={form.starRating}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  >

                    <option value={1}>
                      1 Star
                    </option>

                    <option value={2}>
                      2 Stars
                    </option>

                    <option value={3}>
                      3 Stars
                    </option>

                    <option value={4}>
                      4 Stars
                    </option>

                    <option value={5}>
                      5 Stars
                    </option>

                  </select>

                </div>

                {/* CHECK-IN */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Check-in Time
                  </label>

                  <input
                    type="time"
                    name="checkInTime"
                    value={form.checkInTime}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

                {/* CHECK-OUT */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Check-out Time
                  </label>

                  <input
                    type="time"
                    name="checkOutTime"
                    value={form.checkOutTime}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={
                    saving ||
                    uploadingImage
                  }
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploadingImage
                  }
                  className="flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {(saving ||
                    uploadingImage) && (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  {uploadingImage
                    ? "Uploading image..."
                    : saving
                      ? editingId !== null
                        ? "Updating..."
                        : "Creating..."
                      : editingId !== null
                        ? "Update Hotel"
                        : "Create Hotel"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}