
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Hotel,
  BedDouble,
  CalendarCheck,
  CreditCard,
  LogOut,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Hotels",
    href: "/admin/hotels",
    icon: Hotel,
  },
  {
    name: "Rooms",
    href: "/admin/rooms",
    icon: BedDouble,
  },
  {
    name: "Bookings",
    href: "/admin/bookings",
    icon: CalendarCheck,
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role")?.toUpperCase();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      setAuthorized(false);

      // Customer should go to customer area.
      // Unknown roles should return to login.
      if (role === "CUSTOMER") {
        router.replace("/hotels");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        router.replace("/login");
      }

      return;
    }

    setAuthorized(true);
    setCheckingAuth(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    setAuthorized(false);
    router.replace("/login");
  };

  // Prevent protected page content from flashing
  // before the client-side role check completes.
  if (checkingAuth || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
          <p className="text-sm font-medium text-gray-600">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-gray-200 bg-white lg:block">

        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-gray-200 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <Hotel size={22} />
          </div>

          <div>
            <Link
              href="/admin"
              className="text-xl font-bold text-gray-900"
            >
              StayEase
            </Link>

            <p className="text-xs text-gray-500">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="mx-4 mt-6 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
            <ShieldCheck size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">
              Administrator
            </p>
            <p className="text-xs text-gray-500">
              Admin Access
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 pt-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Administration
          </p>
        </div>

        <nav className="mt-4 space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-5 left-0 w-full px-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white px-5 lg:hidden">

        <Link
          href="/admin"
          className="text-xl font-bold text-gray-900"
        >
          StayEase
        </Link>

        <span className="ml-3 text-sm text-gray-400">
          Admin
        </span>

        <button
          type="button"
          onClick={handleLogout}
          className="ml-auto rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          aria-label="Logout"
        >
          <LogOut size={19} />
        </button>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {children}
      </div>

    </div>
  );
}
