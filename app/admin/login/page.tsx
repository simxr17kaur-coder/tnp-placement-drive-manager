
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to log in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-10 text-white md:flex">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-blue-800">
              P
            </div>

            <h1 className="mt-8 text-3xl font-bold leading-tight">
              Placement Drive Manager
            </h1>

            <p className="mt-4 leading-7 text-blue-100">
              One place to manage recruitment drives, monitor registrations,
              and organize student placement opportunities.
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm font-semibold">Administrator access</p>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Sign in to manage company drives and view student applications.
            </p>
          </div>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mb-8 md:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-xl font-black text-white">
              P
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              PlacementHub
            </h1>
          </div>

          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
            Admin portal
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your administrator credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter admin username"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter admin password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-20 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to dashboard"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            Authorized administrators only.
          </p>
        </section>
      </div>
    </main>
  );
}
