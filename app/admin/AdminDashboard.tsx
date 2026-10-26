
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DriveForm from "../components/DriveForm";

type PlacementDrive = {
  id: string;
  companyName: string;
  role: string;
  driveDate: string;
  eligibleBranch: string;
  minCGPA: number | null;
  jobType: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    applications: number;
  };
};

type StudentApplication = {
  id: string;
  studentName: string;
  email: string;
  course: string;
  studyYear: string;
  branch: string;
  cgpa: number;
  preferredDomain: string;
  status: string;
  createdAt: string;
};

type FilterStatus = "ALL" | "PUBLISHED" | "DRAFT";

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isUpcoming(date: string) {
  return new Date(date).getTime() >= Date.now();
}

export default function AdminDashboard() {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  const [selectedDrive, setSelectedDrive] =
    useState<PlacementDrive | null>(null);
  const [students, setStudents] = useState<StudentApplication[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");

  // Status dropdown and publishing state
  const [openStatusMenuId, setOpenStatusMenuId] =
    useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState("");

  const fetchDrives = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/drives", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load drives.");
      }

      setDrives(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDrives();
  }, [fetchDrives]);

  const totalDrives = drives.length;

  const upcomingDrives = drives.filter(
    (drive) =>
      drive.status === "PUBLISHED" && isUpcoming(drive.driveDate)
  ).length;

  const publishedDrives = drives.filter(
    (drive) => drive.status === "PUBLISHED"
  ).length;

  const totalRegistrations = drives.reduce(
    (total, drive) => total + drive._count.applications,
    0
  );

  const uniqueCompanies = new Set(
    drives.map((drive) => drive.companyName.trim().toLowerCase())
  ).size;

  const filteredDrives = useMemo(() => {
    const term = search.trim().toLowerCase();

    return drives.filter((drive) => {
      const matchesSearch =
        !term ||
        drive.companyName.toLowerCase().includes(term) ||
        drive.role.toLowerCase().includes(term) ||
        drive.eligibleBranch.toLowerCase().includes(term);

      const matchesStatus =
        filter === "ALL" || drive.status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [drives, search, filter]);

  // Publish an existing draft without creating another drive.
  async function publishDrive(drive: PlacementDrive) {
    setPublishingId(drive.id);
    setPublishError("");
    setOpenStatusMenuId(null);

    try {
      const response = await fetch(
        `/api/admin/drives/${encodeURIComponent(drive.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "PUBLISHED",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to publish the placement drive."
        );
      }

      await fetchDrives();
    } catch (err) {
      setPublishError(
        err instanceof Error
          ? err.message
          : "Unable to publish the placement drive."
      );
    } finally {
      setPublishingId(null);
    }
  }

  async function viewStudents(drive: PlacementDrive) {
    if (selectedDrive?.id === drive.id) {
      setSelectedDrive(null);
      setStudents([]);
      setStudentsError("");
      return;
    }

    setSelectedDrive(drive);
    setStudents([]);
    setStudentsError("");
    setStudentsLoading(true);

    try {
      const response = await fetch(
        `/api/admin/drives/${encodeURIComponent(drive.id)}/applications`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load registrations."
        );
      }

      setStudents(data.applications);
    } catch (err) {
      setStudentsError(
        err instanceof Error
          ? err.message
          : "Unable to load students."
      );
    } finally {
      setStudentsLoading(false);
    }
  }

  function handleFormClose() {
    setShowForm(false);
    void fetchDrives();
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top navigation */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-xl font-bold text-white shadow-sm">
              P
            </div>

            <div>
              <h1 className="font-bold tracking-tight text-slate-900">
                Placement Drive Manager
              </h1>
              <p className="text-xs text-slate-500">
                Recruitment administration
              </p>
            </div>
          </div>

          <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:inline-flex">
            ADMIN DASHBOARD
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Welcome section */}
        <section className="flex flex-col justify-between gap-6 rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-lg sm:p-9 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              Recruitment overview
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Manage your placement drives
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Organize company opportunities, monitor registrations, and
              keep your recruitment activities in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="shrink-0 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-blue-800 shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/30"
          >
            + Create New Drive
          </button>
        </section>

        {/* Summary cards */}
        <section
          aria-label="Dashboard statistics"
          className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            label="Total drives"
            value={loading ? "…" : error ? "—" : totalDrives}
            note="Drafts and published drives"
            symbol="▤"
            color="blue"
          />

          <StatCard
            label="Upcoming drives"
            value={loading ? "…" : error ? "—" : upcomingDrives}
            note="Published, scheduled for today or later"
            symbol="◷"
            color="violet"
          />

          <StatCard
            label="Published drives"
            value={loading ? "…" : error ? "—" : publishedDrives}
            note="Visible to students"
            symbol="✓"
            color="emerald"
          />

          <StatCard
            label="Student registrations"
            value={loading ? "…" : error ? "—" : totalRegistrations}
            note={`${uniqueCompanies} unique compan${
              uniqueCompanies === 1 ? "y" : "ies"
            } across all drives`}
            symbol="♙"
            color="amber"
          />
        </section>

        {/* Drive management */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h3 className="text-xl font-bold tracking-tight">
                  Placement drives
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Search companies, manage statuses, and inspect registrations.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void fetchDrives()}
                disabled={loading}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {loading ? "Refreshing…" : "↻ Refresh"}
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  ⌕
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search company, role, or eligible branch…"
                  aria-label="Search placement drives"
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div
                className="flex flex-wrap gap-2"
                aria-label="Filter by status"
              >
                {(
                  [
                    ["ALL", "All drives"],
                    ["PUBLISHED", "Published"],
                    ["DRAFT", "Drafts"],
                  ] as [FilterStatus, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    aria-pressed={filter === value}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      filter === value
                        ? "bg-blue-700 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {publishError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {publishError}
              </div>
            )}

            {loading && (
              <div className="rounded-2xl bg-slate-50 px-5 py-12 text-center">
                <p className="font-semibold text-slate-700">
                  Loading placement drives…
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Retrieving records from your database.
                </p>
              </div>
            )}

            {!loading && error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 p-5"
              >
                <p className="font-semibold text-red-800">
                  Could not load placement drives
                </p>

                <p className="mt-2 text-sm text-red-700">{error}</p>

                <button
                  type="button"
                  onClick={() => void fetchDrives()}
                  className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && filteredDrives.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 px-5 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-700">
                  ▤
                </div>

                <h4 className="mt-4 font-bold">
                  {drives.length === 0
                    ? "No placement drives yet"
                    : "No matching drives"}
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {drives.length === 0
                    ? "Create your first drive to start managing recruitment opportunities."
                    : "Try another search term or change the selected status filter."}
                </p>

                {drives.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="mt-5 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    + Create your first drive
                  </button>
                )}
              </div>
            )}

            {!loading && !error && filteredDrives.length > 0 && (
              <>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">
                    Showing{" "}
                    <strong className="text-slate-800">
                      {filteredDrives.length}
                    </strong>{" "}
                    of {drives.length} drives
                  </p>
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  {filteredDrives.map((drive) => {
                    const isSelected = selectedDrive?.id === drive.id;
                    const isMenuOpen = openStatusMenuId === drive.id;
                    const isPublishing = publishingId === drive.id;
                    const isPublished = drive.status === "PUBLISHED";

                    return (
                      <article
                        key={drive.id}
                        className={`min-w-0 overflow-hidden rounded-2xl border bg-white transition ${
                          isSelected
                            ? "border-blue-300 shadow-md ring-2 ring-blue-50"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="p-5 sm:p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-blue-800">
                              {drive.companyName
                                .trim()
                                .slice(0, 1)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="break-words text-lg font-bold">
                                  {drive.companyName}
                                </h4>

                                {/* Interactive status dropdown */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPublishError("");
                                      setOpenStatusMenuId(
                                        isMenuOpen ? null : drive.id
                                      );
                                    }}
                                    disabled={isPublishing}
                                    aria-haspopup="menu"
                                    aria-expanded={isMenuOpen}
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                                      isPublished
                                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                        : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                                    }`}
                                  >
                                    {isPublishing
                                      ? "Publishing..."
                                      : isPublished
                                        ? "Published"
                                        : "Draft"}

                                    <span aria-hidden="true">▾</span>
                                  </button>

                                  {isMenuOpen && (
                                    <div
                                      role="menu"
                                      className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
                                    >
                                      {drive.status === "DRAFT" ? (
                                        <button
                                          type="button"
                                          role="menuitem"
                                          disabled={isPublishing}
                                          onClick={() =>
                                            void publishDrive(drive)
                                          }
                                          className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                                        >
                                          ✓ Publish Drive
                                        </button>
                                      ) : (
                                        <div className="px-3 py-2.5 text-sm text-slate-500">
                                          This drive is published.
                                        </div>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setOpenStatusMenuId(null)
                                        }
                                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <p className="mt-1 break-words text-sm font-medium text-blue-700">
                                {drive.role}
                              </p>

                              <p className="mt-2 text-xs text-slate-500">
                                {drive.jobType || "Job type not specified"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <Detail
                              label="Drive date"
                              value={formatDate(drive.driveDate)}
                            />

                            <Detail
                              label="Eligible branches"
                              value={drive.eligibleBranch}
                            />

                            <Detail
                              label="Minimum CGPA"
                              value={
                                drive.minCGPA == null
                                  ? "Not specified"
                                  : String(drive.minCGPA)
                              }
                            />

                            <Detail
                              label="Registrations"
                              value={`${drive._count.applications} student${
                                drive._count.applications === 1 ? "" : "s"
                              }`}
                            />
                          </div>

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                            <span className="text-xs text-slate-400">
                              ID: {drive.id.slice(0, 12)}…
                            </span>

                            <button
                              type="button"
                              onClick={() => void viewStudents(drive)}
                              aria-expanded={isSelected}
                              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                isSelected
                                  ? "border border-blue-200 bg-blue-50 text-blue-800"
                                  : "bg-slate-900 text-white hover:bg-slate-700"
                              }`}
                            >
                              {isSelected
                                ? "Hide Registered Students"
                                : `View Registered Students (${drive._count.applications})`}
                            </button>
                          </div>
                        </div>

                        {/* Inline student registrations */}
                        {isSelected && (
                          <div className="border-t border-blue-100 bg-blue-50/40 p-5 sm:p-6">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h5 className="font-bold text-slate-900">
                                  Registered students
                                </h5>

                                <p className="mt-1 text-xs text-slate-500">
                                  {drive.companyName} · {drive.role}
                                </p>
                              </div>

                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-800 ring-1 ring-blue-100">
                                {studentsLoading ? "…" : students.length} total
                              </span>
                            </div>

                            {studentsLoading && (
                              <p className="mt-5 rounded-xl bg-white p-5 text-center text-sm text-slate-500">
                                Loading registered students…
                              </p>
                            )}

                            {!studentsLoading && studentsError && (
                              <div
                                role="alert"
                                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                              >
                                {studentsError}

                                <button
                                  type="button"
                                  onClick={() => void viewStudents(drive)}
                                  className="ml-2 font-semibold underline"
                                >
                                  Retry
                                </button>
                              </div>
                            )}

                            {!studentsLoading &&
                              !studentsError &&
                              students.length === 0 && (
                                <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                                  No students have registered for this drive yet.
                                </p>
                              )}

                            {!studentsLoading &&
                              !studentsError &&
                              students.length > 0 && (
                                <div className="mt-4 space-y-3">
                                  {students.map((student) => (
                                    <div
                                      key={student.id}
                                      className="rounded-xl border border-slate-200 bg-white p-4"
                                    >
                                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                                        <div className="min-w-0">
                                          <p className="break-words font-semibold text-slate-900">
                                            {student.studentName}
                                          </p>

                                          <p className="mt-1 break-all text-sm text-slate-600">
                                            {student.email}
                                          </p>
                                        </div>

                                        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                          {student.status}
                                        </span>
                                      </div>

                                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                                        <MiniDetail
                                          label="Branch"
                                          value={student.branch}
                                        />

                                        <MiniDetail
                                          label="CGPA"
                                          value={String(student.cgpa)}
                                        />

                                        <MiniDetail
                                          label="Year"
                                          value={student.studyYear}
                                        />

                                        <MiniDetail
                                          label="Course"
                                          value={student.course}
                                        />

                                        <MiniDetail
                                          label="Preferred domain"
                                          value={student.preferredDomain}
                                        />

                                        <MiniDetail
                                          label="Registered on"
                                          value={new Date(
                                            student.createdAt
                                          ).toLocaleDateString("en-IN")}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        <footer className="py-8 text-center text-xs leading-5 text-slate-400">
          Placement Drive Manager · Next.js · Tailwind CSS · PostgreSQL · Prisma
        </footer>
      </div>

      {showForm && <DriveForm onClose={handleFormClose} />}
    </main>
  );
}

function StatCard({
  label,
  value,
  note,
  symbol,
  color,
}: {
  label: string;
  value: string | number;
  note: string;
  symbol: string;
  color: "blue" | "violet" | "emerald" | "amber";
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${styles[color]}`}
        >
          {symbol}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function MiniDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words font-medium text-slate-800">{value}</p>
    </div>
  );
}
