"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle, BedDouble, CheckCircle2, ChevronDown, CirclePlus,
  Pencil, RefreshCw, Search, Trash2, Users, X,
} from "lucide-react";
import api from "@/lib/api";

type Room = {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number | string;
  capacity: number;
  floor: number;
  description?: string | null;
  status?: string | null;
  hotelId: number;
  hotelName?: string | null;
  imageUrl?: string | null;
};

type Hotel = {
  id: number;
  name: string;
  city?: string | null;
};

type RoomForm = {
  roomNumber: string;
  roomType: string;
  pricePerNight: string;
  capacity: string;
  floor: string;
  description: string;
  status: string;
  hotelId: string;
};

const ROOM_TYPES = ["STANDARD", "DELUXE", "SUPER_DELUXE", "SUITE", "PRESIDENTIAL_SUITE"];
const ROOM_STATUSES = ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"];
const EMPTY_FORM: RoomForm = {
  roomNumber: "", roomType: "STANDARD", pricePerNight: "",
  capacity: "2", floor: "0", description: "", status: "AVAILABLE", hotelId: "",
};

type ApiError = {
  response?: { status?: number; data?: { message?: string; error?: string } };
  message?: string;
};

function unwrapArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rooms)) return data.rooms;
  if (Array.isArray(data?.hotels)) return data.hotels;
  return [];
}

function getError(error: ApiError): string {
  const status = error?.response?.status;
  if (status === 401) return "Your session expired. Please sign in again.";
  if (status === 403) return "Access denied. Sign in with an authorized admin account.";
  return error?.response?.data?.message || error?.response?.data?.error ||
    error?.message || "Request failed. Please try again.";
}

function money(value: number | string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 2,
  }).format(amount);
}

function statusStyle(status?: string | null): string {
  switch ((status || "").toUpperCase()) {
    case "AVAILABLE": return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "OCCUPIED": return "border-blue-200 bg-blue-50 text-blue-800";
    case "RESERVED": return "border-amber-200 bg-amber-50 text-amber-800";
    case "MAINTENANCE": return "border-rose-200 bg-rose-50 text-rose-800";
    default: return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [form, setForm] = useState<RoomForm>(EMPTY_FORM);

  const loadData = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      // Existing endpoints from RoomController and HotelController.
      const [roomResponse, hotelResponse] = await Promise.all([
        api.get("/rooms"),
        api.get("/hotels"),
      ]);
      setRooms(unwrapArray<Room>(roomResponse.data));
      setHotels(unwrapArray<Hotel>(hotelResponse.data));
    } catch (requestError) {
      console.error("Admin room list failed:", requestError);
      setError(getError(requestError as ApiError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const filteredRooms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rooms.filter((room) => {
      const status = String(room.status || "UNKNOWN").toUpperCase();
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      const text = [
        room.id, room.roomNumber, room.roomType, room.hotelName, room.hotelId, status,
      ].map((v) => String(v ?? "").toLowerCase()).join(" ");
      return matchesStatus && (!query || text.includes(query));
    });
  }, [rooms, search, statusFilter]);

  const openCreate = () => {
    setEditingRoom(null);
    setForm({ ...EMPTY_FORM, hotelId: hotels[0] ? String(hotels[0].id) : "" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setForm({
      roomNumber: room.roomNumber || "",
      roomType: room.roomType || "STANDARD",
      pricePerNight: String(room.pricePerNight ?? ""),
      capacity: String(room.capacity ?? 2),
      floor: String(room.floor ?? 0),
      description: room.description || "",
      status: room.status || "AVAILABLE",
      hotelId: String(room.hotelId ?? ""),
    });
    setError("");
    setModalOpen(true);
  };

  const updateField = (key: keyof RoomForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const price = Number(form.pricePerNight);
    const capacity = Number(form.capacity);
    const floor = Number(form.floor);
    const hotelId = Number(form.hotelId);

    if (!form.roomNumber.trim()) return setError("Room number is required.");
    if (!Number.isFinite(price) || price <= 0) return setError("Price per night must be greater than zero.");
    if (!Number.isInteger(capacity) || capacity < 1) return setError("Capacity must be at least 1.");
    if (!Number.isInteger(floor) || floor < 0) return setError("Floor cannot be negative.");
    if (!editingRoom && (!Number.isInteger(hotelId) || hotelId < 1)) {
      return setError("Choose a hotel before creating a room.");
    }

    const payload: Record<string, unknown> = {
      roomNumber: form.roomNumber.trim(),
      roomType: form.roomType,
      pricePerNight: price,
      capacity,
      floor,
      description: form.description.trim(),
      status: form.status,
    };

    setSaving(true);
    try {
      if (editingRoom) {
        // Existing endpoint: PUT /api/rooms/{id}. Update DTO does not change hotelId.
        const response = await api.put(`/rooms/${editingRoom.id}`, payload);
        const updated = response?.data as Room;
        setRooms((current) => current.map((room) =>
          room.id === editingRoom.id
            ? { ...room, ...(updated || {}), id: editingRoom.id }
            : room
        ));
        setNotice(`Room ${form.roomNumber.trim()} updated.`);
      } else {
        // Existing endpoint: POST /api/rooms.
        const response = await api.post("/rooms", { ...payload, hotelId });
        const created = response?.data as Room;
        if (created?.id != null) setRooms((current) => [created, ...current]);
        else await loadData(true);
        setNotice(`Room ${form.roomNumber.trim()} created.`);
      }
      setModalOpen(false);
    } catch (requestError) {
      console.error("Saving room failed:", requestError);
      setError(getError(requestError as ApiError));
    } finally {
      setSaving(false);
    }
  };

  const deleteRoom = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeletingId(target.id);
    setError("");
    setNotice("");
    try {
      // Existing endpoint: DELETE /api/rooms/{id}.
      await api.delete(`/rooms/${target.id}`);
      setRooms((current) => current.filter((room) => room.id !== target.id));
      setNotice(`Room ${target.roomNumber} deleted.`);
      setDeleteTarget(null);
    } catch (requestError) {
      console.error("Deleting room failed:", requestError);
      setError(getError(requestError as ApiError));
    } finally {
      setDeletingId(null);
    }
  };

  const availableCount = rooms.filter((r) => r.status === "AVAILABLE").length;
  const maintenanceCount = rooms.filter((r) => r.status === "MAINTENANCE").length;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">StayEase · Administration</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Room management</h1>
            <p className="mt-2 text-sm text-slate-600">Create, edit, search and maintain hotel room inventory.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => void loadData(true)} disabled={loading || refreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button type="button" onClick={openCreate}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              <CirclePlus size={17} /> Add room
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {error && (
          <div role="alert" className="mb-5 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1"><p className="font-semibold">Request failed</p><p className="mt-1 text-sm leading-6">{error}</p></div>
            <button type="button" onClick={() => setError("")} aria-label="Dismiss error"><X size={18} /></button>
          </div>
        )}
        {notice && (
          <div role="status" className="mb-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" /><p className="text-sm">{notice}</p>
            <button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice" className="ml-auto"><X size={18} /></button>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500">Total rooms <BedDouble size={20} /></div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{rooms.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500">Available <CheckCircle2 size={20} className="text-emerald-700" /></div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{availableCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500">Maintenance <AlertCircle size={20} className="text-rose-700" /></div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{maintenanceCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500">Hotels <BedDouble size={20} /></div>
            <p className="mt-3 text-3xl font-bold text-slate-950">{hotels.length}</p>
          </div>
        </section>

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div><h2 className="font-semibold text-slate-950">Rooms inventory</h2><p className="mt-1 text-sm text-slate-500">{filteredRooms.length} of {rooms.length} rooms</p></div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="relative block">
                  <span className="sr-only">Search rooms</span>
                  <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search room, hotel, type..."
                    className="min-h-11 w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:w-72" />
                </label>
                <label className="relative block">
                  <span className="sr-only">Filter by status</span>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="min-h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-slate-500 sm:w-48">
                    <option value="ALL">All statuses</option>{ROOM_STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </label>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-5" aria-label="Loading rooms">{[1, 2, 3, 4].map((n) => <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div>
          ) : filteredRooms.length === 0 ? (
            <div className="px-5 py-14 text-center"><BedDouble size={30} className="mx-auto text-slate-400" /><p className="mt-3 font-semibold text-slate-900">No rooms found</p><p className="mt-1 text-sm text-slate-500">Change your search or add a room.</p></div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
                    <th className="px-5 py-3 font-semibold">Room</th><th className="px-5 py-3 font-semibold">Hotel</th><th className="px-5 py-3 font-semibold">Type</th><th className="px-5 py-3 font-semibold">Price / night</th><th className="px-5 py-3 font-semibold">Capacity</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRooms.map((room) => <tr key={room.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4"><p className="font-semibold text-slate-950">{room.roomNumber}</p><p className="mt-1 text-xs text-slate-500">ID #{room.id} · Floor {room.floor}</p></td>
                      <td className="px-5 py-4"><p className="font-medium text-slate-800">{room.hotelName || `Hotel #${room.hotelId}`}</p></td>
                      <td className="px-5 py-4 text-slate-700">{String(room.roomType || "—").replaceAll("_", " ")}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{money(room.pricePerNight)}</td>
                      <td className="px-5 py-4"><span className="inline-flex items-center gap-1.5"><Users size={15} className="text-slate-400" />{room.capacity}</span></td>
                      <td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle(room.status)}`}>{room.status || "UNKNOWN"}</span></td>
                      <td className="px-5 py-4"><div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(room)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><Pencil size={13} /> Edit</button>
                        <button type="button" onClick={() => setDeleteTarget(room)} disabled={deletingId !== null} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-50 disabled:opacity-50"><Trash2 size={13} /> Delete</button>
                      </div></td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredRooms.map((room) => <article key={room.id} className="p-4">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-950">Room {room.roomNumber}</p><p className="mt-1 text-xs text-slate-500">{room.hotelName || `Hotel #${room.hotelId}`} · Floor {room.floor}</p></div><span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusStyle(room.status)}`}>{room.status || "UNKNOWN"}</span></div>
                  <p className="mt-3 text-lg font-bold text-slate-950">{money(room.pricePerNight)} <span className="text-xs font-normal text-slate-500">/ night</span></p>
                  <p className="mt-1 text-sm text-slate-600">{String(room.roomType || "—").replaceAll("_", " ")} · Capacity {room.capacity}</p>
                  <div className="mt-4 flex gap-2"><button type="button" onClick={() => openEdit(room)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 text-sm font-semibold"><Pencil size={14} /> Edit</button><button type="button" onClick={() => setDeleteTarget(room)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 text-sm font-semibold text-rose-800"><Trash2 size={14} /> Delete</button></div>
                </article>)}
              </div>
            </>
          )}
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="room-modal-title" className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><h2 id="room-modal-title" className="text-xl font-bold text-slate-950">{editingRoom ? `Edit room ${editingRoom.roomNumber}` : "Add a room"}</h2><p className="mt-1 text-sm text-slate-500">Fields follow the existing CreateRoomRequest and UpdateRoomRequest DTOs.</p></div><button type="button" onClick={() => setModalOpen(false)} aria-label="Close form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button></div>
            <form onSubmit={saveRoom} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Room number *
                <input required maxLength={20} value={form.roomNumber} onChange={(e) => updateField("roomNumber", e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500" placeholder="e.g. 204" />
              </label>
              <label className="text-sm font-medium text-slate-700">Room type *
                <select required value={form.roomType} onChange={(e) => updateField("roomType", e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
                  {ROOM_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
                </select>
              </label>
              {!editingRoom && <label className="text-sm font-medium text-slate-700 sm:col-span-2">Hotel *
                <select required value={form.hotelId} onChange={(e) => updateField("hotelId", e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
                  <option value="">Choose a hotel</option>{hotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}{hotel.city ? ` — ${hotel.city}` : ""} (#{hotel.id})</option>)}
                </select>
                {hotels.length === 0 && <span className="mt-1 block text-xs text-rose-700">Create a hotel first; no hotels were returned by the API.</span>}
              </label>}
              {editingRoom && <div className="sm:col-span-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Hotel: <strong>{editingRoom.hotelName || `Hotel #${editingRoom.hotelId}`}</strong>. The existing update DTO does not support moving a room to another hotel.</div>}
              <label className="text-sm font-medium text-slate-700">Price per night (INR) *
                <input required type="number" min="0.01" step="0.01" value={form.pricePerNight} onChange={(e) => updateField("pricePerNight", e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="2500" />
              </label>
              <label className="text-sm font-medium text-slate-700">Guest capacity *
                <input required type="number" min="1" step="1" value={form.capacity} onChange={(e) => updateField("capacity", e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
              <label className="text-sm font-medium text-slate-700">Floor *
                <input required type="number" min="0" step="1" value={form.floor} onChange={(e) => updateField("floor", e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2" />
              </label>
              <label className="text-sm font-medium text-slate-700">Room status
                <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2">
                  {ROOM_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">Description
                <textarea rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-slate-500" placeholder="Optional room details" />
              </label>
              {error && <div role="alert" className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setModalOpen(false)} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                <button type="submit" disabled={saving || (!editingRoom && hotels.length === 0)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{saving ? "Saving..." : editingRoom ? "Save changes" : "Create room"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="delete-room-title" className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="flex items-start gap-3"><span className="rounded-xl bg-rose-50 p-3 text-rose-800"><Trash2 size={22} /></span><div><h2 id="delete-room-title" className="font-bold text-slate-950">Delete room {deleteTarget.roomNumber}?</h2><p className="mt-1 text-sm leading-6 text-slate-600">This sends a permanent delete request to the backend. If this room is linked to bookings, the backend may reject the deletion.</p></div></div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setDeleteTarget(null)} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Cancel</button><button type="button" onClick={() => void deleteRoom()} disabled={deletingId !== null} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 disabled:opacity-60"><Trash2 size={15} />{deletingId !== null ? "Deleting..." : "Delete room"}</button></div>
          </section>
        </div>
      )}
    </main>
  );
}
