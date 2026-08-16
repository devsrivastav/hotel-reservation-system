"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Hotel, Mail, Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // =====================================================
      // LOGIN API
      // =====================================================

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      console.log(
        "========================================"
      );

      console.log(
        "LOGIN RESPONSE:",
        response.data
      );

      // =====================================================
      // GET JWT TOKEN
      // =====================================================

      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.data?.token ||
        response.data?.data?.accessToken;

      console.log(
        "LOGIN TOKEN:",
        token
      );

      console.log(
        "TOKEN FOUND:",
        !!token
      );

      // =====================================================
      // TOKEN NOT FOUND
      // =====================================================

      if (!token) {
        console.error(
          "JWT token was not found in login response."
        );

        setError(
          "Login successful, but JWT token was not received from server."
        );

        return;
      }

      // =====================================================
      // SAVE TOKEN
      // =====================================================

      localStorage.setItem(
        "token",
        token
      );

      const savedToken =
        localStorage.getItem("token");

      console.log(
        "TOKEN SAVED:",
        !!savedToken
      );

      console.log(
        "TOKEN LENGTH:",
        savedToken?.length || 0
      );

      console.log(
        "========================================"
      );

      // =====================================================
      // REDIRECT
      // =====================================================

      router.push("/hotels");

    } catch (err: any) {

      console.error(
        "LOGIN ERROR:",
        err
      );

      console.error(
        "LOGIN ERROR RESPONSE:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid email or password."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 px-6 py-12">

      <div className="mx-auto max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
            <Hotel size={28} />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-gray-600">
            Login to manage your hotel reservations
          </p>

        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email address
              </label>

              <div className="relative">

                <Mail
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />

              </div>

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <div className="relative">

                <Lock
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />

              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading && (
                <Loader2
                  size={19}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Signing in..."
                : "Sign In"}

            </button>

          </form>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-gray-600">

            Don't have an account?{" "}

            <Link
              href="/register"
              className="font-semibold text-black hover:underline"
            >
              Create account
            </Link>

          </p>

        </div>

      </div>

    </main>
  );
}