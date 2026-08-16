"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, User, Hotel, LogOut, Shield } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

function getRoleFromToken(token: string) {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      atob(
        parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    if (typeof payload.role === "string") {
      return payload.role
        .replace("ROLE_", "")
        .toUpperCase();
    }

    if (Array.isArray(payload.roles)) {
      const roles = payload.roles.map((item: any) => {
        if (typeof item === "string") {
          return item
            .replace("ROLE_", "")
            .toUpperCase();
        }

        return String(
          item?.authority ||
            item?.role ||
            ""
        )
          .replace("ROLE_", "")
          .toUpperCase();
      });

      if (roles.includes("ADMIN")) {
        return "ADMIN";
      }

      if (roles.includes("CUSTOMER")) {
        return "CUSTOMER";
      }
    }

    if (Array.isArray(payload.authorities)) {
      const authorities =
        payload.authorities.map(
          (item: any) => {
            if (typeof item === "string") {
              return item
                .replace("ROLE_", "")
                .toUpperCase();
            }

            return String(
              item?.authority || ""
            )
              .replace("ROLE_", "")
              .toUpperCase();
          }
        );

      if (authorities.includes("ADMIN")) {
        return "ADMIN";
      }

      if (
        authorities.includes("CUSTOMER")
      ) {
        return "CUSTOMER";
      }
    }

    return null;
  } catch (error) {
    console.error(
      "Unable to read JWT role:",
      error
    );

    return null;
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [token, setToken] =
    useState<string | null>(null);

  const [role, setRole] =
    useState<string | null>(null);

  const [mounted, setMounted] =
    useState(false);

  // =====================================================
  // CHECK LOGIN
  // =====================================================

  useEffect(() => {
    setMounted(true);

    const savedToken =
      localStorage.getItem("token");

    setToken(savedToken);

    if (savedToken) {
      setRole(
        getRoleFromToken(savedToken)
      );
    }
  }, [pathname]);

  // =====================================================
  // HIDE CUSTOMER NAVBAR ON ADMIN PAGES
  // =====================================================

  if (pathname.startsWith("/admin")) {
    return null;
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setRole(null);
    setMobileOpen(false);

    router.push("/login");
  };

  const isLoggedIn =
    mounted && !!token;

  const isAdmin =
    isLoggedIn && role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-gray-900"
        >
          <Hotel size={26} />

          StayEase
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <div className="hidden items-center gap-8 md:flex">

          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Home
          </Link>

          <Link
            href="/hotels"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Hotels
          </Link>

          {isLoggedIn && (
            <Link
              href="/bookings"
              className="text-sm font-medium text-gray-700 hover:text-black"
            >
              My Bookings
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-black"
            >
              <Shield size={16} />

              Admin
            </Link>
          )}

        </div>

        {/* =================================================
            DESKTOP AUTH
        ================================================= */}

        <div className="hidden items-center gap-3 md:flex">

          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
              >
                <User size={17} />

                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold uppercase text-gray-600">
                {isAdmin
                  ? "Admin"
                  : "Customer"}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={17} />

                Logout
              </button>
            </>
          )}

        </div>

        {/* =================================================
            MOBILE BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            setMobileOpen(!mobileOpen)
          }
          className="md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>

      </nav>

      {/* =================================================
          MOBILE NAVIGATION
      ================================================= */}

      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-6 py-5 md:hidden">

          <div className="flex flex-col gap-4">

            <Link
              href="/"
              onClick={() =>
                setMobileOpen(false)
              }
            >
              Home
            </Link>

            <Link
              href="/hotels"
              onClick={() =>
                setMobileOpen(false)
              }
            >
              Hotels
            </Link>

            {isLoggedIn && (
              <Link
                href="/bookings"
                onClick={() =>
                  setMobileOpen(false)
                }
              >
                My Bookings
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="flex items-center gap-2 font-semibold"
              >
                <Shield size={17} />

                Admin Dashboard
              </Link>
            )}

            <hr />

            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="rounded-lg bg-black px-4 py-2 text-center text-white"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-left font-medium text-red-600"
              >
                <LogOut size={17} />

                Logout
              </button>
            )}

          </div>

        </div>
      )}

    </header>
  );
}