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
} from "lucide-react";
import { useEffect } from "react";

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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-gray-200 bg-white lg:block">

        <div className="flex h-20 items-center border-b border-gray-200 px-6">
          <Link
            href="/admin"
            className="text-2xl font-bold text-gray-900"
          >
            StayEase
          </Link>
        </div>

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
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
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

        <div className="absolute bottom-5 left-0 w-full px-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600"
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
          className="ml-auto rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={19} />
        </button>
      </div>

      {/* Content */}
      <div className="lg:pl-64">
        {children}
      </div>

    </div>
  );
}