
"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

type PlacementDrive = {
  id: string;
  companyName: string;
  role: string;
  driveDate: string;
  eligibleBranch: string;
  minCGPA: number | null;
  jobType: string | null;
};

type RegistrationForm = {
  studentName: string;
  email: string;
  course: string;
  studyYear: string;
  branch: string;
  cgpa: string;
  preferredDomain: string;
};

const emptyForm: RegistrationForm = {
  studentName: "",
  email: "",
  course: "",
  studyYear: "",
  branch: "",
  cgpa: "",
  preferredDomain: "",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isUpcoming(date: string) {
  return new Date(date).getTime() >= Date.now();
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function getCompanyColor(name: string) {
  const colors = [
    "bg-blue-100 text-blue-800",
    "bg-violet-100 text-violet-800",
    "bg-emerald-100 text-emerald-800",
    "bg-amber-100 text-amber-800",
    "bg-rose-100 text-rose-800",
    "bg-cyan-100 text-cyan-800",
  ];

  const index = [...name].reduce(
    (total, character) => total + character.charCodeAt(0),
    0
  );

  return colors[index % colors.length];
}

export default function StudentPage() {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("EARLIEST");

  const [selectedDrive, setSelectedDrive] =
    useState<PlacementDrive | null>(null);

  const [form, setForm] = useState<RegistrationForm>(emptyForm);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchDrives() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/drives", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load placement drives."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("The server returned an unexpected response.");
      }

      setDrives(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load placement drives."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchDrives();
  }, []);

  const jobTypes = useMemo(
    () =>
      Array.from(
        new Set(
          drives
            .map((drive) => drive.jobType?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort(),
    [drives]
  );

  const branches = useMemo(
    () =>
      Array.from(
        new Set(
          drives.flatMap((drive) =>
            drive.eligibleBranch
              .split(",")
              .map((branch) => branch.trim())
              .filter(Boolean)
          )
        )
      ).sort(),
    [drives]
  );

  const filteredDrives = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return drives
      .filter((drive) => {
        const searchableText = [
          drive.companyName,
          drive.role,
          drive.eligibleBranch,
          drive.jobType ?? "",
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !searchText || searchableText.includes(searchText);

        const matchesJobType =
          jobTypeFilter === "ALL" ||
          drive.jobType?.trim() === jobTypeFilter;

        const matchesBranch =
          branchFilter === "ALL" ||
          drive.eligibleBranch
            .split(",")
            .map((branch) => branch.trim().toLowerCase())
            .some(
              (branch) =>
                branch === branchFilter.toLowerCase() ||
                branch === "all"
            );

        const matchesDate =
          dateFilter === "ALL" ||
          (dateFilter === "UPCOMING" && isUpcoming(drive.driveDate)) ||
          (dateFilter === "PAST" && !isUpcoming(drive.driveDate));

        return (
          matchesSearch &&
          matchesJobType &&
          matchesBranch &&
          matchesDate
        );
      })
      .sort((a, b) => {
        if (sortOrder === "LATEST") {
          return (
            new Date(b.driveDate).getTime() -
            new Date(a.driveDate).getTime()
          );
        }

        if (sortOrder === "COMPANY") {
          return a.companyName.localeCompare(b.companyName);
        }

        return (
          new Date(a.driveDate).getTime() -
          new Date(b.driveDate).getTime()
        );
      });
  }, [
    drives,
    search,
    jobTypeFilter,
    branchFilter,
    dateFilter,
    sortOrder,
  ]);

  const upcomingCount = drives.filter((drive) =>
    isUpcoming(drive.driveDate)
  ).length;

  const companyCount = new Set(
    drives.map((drive) => drive.companyName.trim().toLowerCase())
  ).size;

  function openRegistration(drive: PlacementDrive) {
    setSelectedDrive(drive);
    setForm(emptyForm);
    setFormError("");
    setSuccessMessage("");
  }

  function closeRegistration() {
    if (submitting) return;

    setSelectedDrive(null);
    setForm(emptyForm);
    setFormError("");
    setSuccessMessage("");
  }

  function updateField(
    field: keyof RegistrationForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleRegistration(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedDrive) return;

    const cgpaValue = Number(form.cgpa);

    if (
      form.studentName.trim().length === 0 ||
      form.email.trim().length === 0
    ) {
      setFormError("Please enter your name and email address.");
      return;
    }

    if (
      !Number.isFinite(cgpaValue) ||
      cgpaValue < 0 ||
      cgpaValue > 10
    ) {
      setFormError("Please enter a valid CGPA between 0 and 10.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          studentName: form.studentName.trim(),
          email: form.email.trim(),
          cgpa: cgpaValue,
          placementDriveId: selectedDrive.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(
          data.error || "Registration failed. Please try again."
        );
        return;
      }

      setSuccessMessage(
        data.message || "Your registration was successful."
      );
      setForm(emptyForm);
    } catch {
      setFormError(
        "We could not submit your registration. Check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetFilters() {
    setSearch("");
    setJobTypeFilter("ALL");
    setBranchFilter("ALL");
    setDateFilter("ALL");
    setSortOrder("EARLIEST");
  }

  const fieldClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/student" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-sm shadow-indigo-200">
              P
            </div>

            <div>
              <p className="font-bold tracking-tight text-slate-900">
                PlacementHub
              </p>
              <p className="text-xs text-slate-500">
                Student career portal
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
              ● Student portal
            </span>

            <Link
              href="/"
              className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-4"
            >
              ← Home
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {/* Hero */}
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 px-6 py-9 text-white shadow-xl shadow-indigo-950/10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 right-1/4 -z-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"
          />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold text-indigo-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              YOUR NEXT OPPORTUNITY STARTS HERE
            </div>

            <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Turn your potential into your{" "}
              <span className="text-cyan-300">next big opportunity.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base sm:leading-8">
              Discover placement drives, explore career paths, and
              find opportunities that match your skills and ambitions.
              Your career journey starts with one application.
            </p>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("opportunities")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-indigo-800 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              Explore opportunities
              <span aria-hidden="true">↓</span>
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 border-t border-white/15 pt-6 sm:grid-cols-3 sm:gap-5">
            <HeroStat
              value={loading ? "…" : String(drives.length)}
              label="Published opportunities"
            />
            <HeroStat
              value={loading ? "…" : String(upcomingCount)}
              label="Upcoming drive dates"
            />
            <HeroStat
              value={loading ? "…" : String(companyCount)}
              label="Companies represented"
            />
          </div>
        </section>

        {/* Opportunities */}
        <section id="opportunities" className="scroll-mt-28 pt-10 sm:pt-14">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                Explore opportunities
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Find your next placement
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Explore available drives and check eligibility before
                applying.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchDrives()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 sm:self-auto"
            >
              <span aria-hidden="true">↻</span>
              {loading ? "Refreshing…" : "Refresh drives"}
            </button>
          </div>

          {/* Search and filters */}
          <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <label
              htmlFor="drive-search"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Search opportunities
            </label>

            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400"
              >
                ⌕
              </span>

              <input
                id="drive-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search company, job role, branch, or job type…"
                className={`${fieldClass} pl-11`}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FilterSelect
                label="Job type"
                value={jobTypeFilter}
                onChange={setJobTypeFilter}
                options={[
                  { value: "ALL", label: "All job types" },
                  ...jobTypes.map((type) => ({
                    value: type,
                    label: type,
                  })),
                ]}
              />

             
<FilterSelect
  label="Eligible branch"
  value={branchFilter}
  onChange={setBranchFilter}
  options={[
    { value: "ALL", label: "All branches" },
    { value: "CSE", label: "Computer Science (CSE)" },
    { value: "IT", label: "Information Technology (IT)" },
    { value: "AI", label: "Artificial Intelligence (AI)" },
    { value: "AI & ML", label: "AI & Machine Learning" },
    { value: "Data Science", label: "Data Science" },
    { value: "Cybersecurity", label: "Cybersecurity" },
    { value: "ECE", label: "Electronics & Communication (ECE)" },
    { value: "EEE", label: "Electrical & Electronics (EEE)" },
    { value: "Electrical", label: "Electrical Engineering" },
    { value: "Electronics", label: "Electronics Engineering" },
    { value: "Mechanical", label: "Mechanical Engineering" },
    { value: "Civil", label: "Civil Engineering" },
    { value: "Mechatronics", label: "Mechatronics Engineering" },
    { value: "Robotics", label: "Robotics & Automation" },
    { value: "Automobile", label: "Automobile Engineering" },
    { value: "Chemical", label: "Chemical Engineering" },
    { value: "Biotechnology", label: "Biotechnology Engineering" },
    { value: "Biomedical", label: "Biomedical Engineering" },
    { value: "Aerospace", label: "Aerospace Engineering" },
    { value: "Aeronautical", label: "Aeronautical Engineering" },
    { value: "Agricultural", label: "Agricultural Engineering" },
    { value: "Environmental", label: "Environmental Engineering" },
    { value: "Production", label: "Production Engineering" },
    { value: "Industrial", label: "Industrial Engineering" },
    { value: "Instrumentation and Control", label: "Instrumentation & Control" },
    { value: "Other", label: "Other" },
  ]}
/>


              <FilterSelect
                label="Drive date"
                value={dateFilter}
                onChange={setDateFilter}
                options={[
                  { value: "ALL", label: "All dates" },
                  { value: "UPCOMING", label: "Upcoming dates" },
                  { value: "PAST", label: "Past dates" },
                ]}
              />

              <FilterSelect
                label="Sort by"
                value={sortOrder}
                onChange={setSortOrder}
                options={[
                  { value: "EARLIEST", label: "Earliest date first" },
                  { value: "LATEST", label: "Latest date first" },
                  { value: "COMPANY", label: "Company name" },
                ]}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {filteredDrives.length}
                </span>{" "}
                of {drives.length} opportunities
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-indigo-700 transition hover:text-indigo-900"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 w-2/3 rounded bg-slate-200" />
                      <div className="h-3 w-1/2 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="mt-7 h-4 w-full rounded bg-slate-100" />
                  <div className="mt-4 h-4 w-3/4 rounded bg-slate-100" />
                  <div className="mt-7 h-11 w-full rounded-xl bg-slate-200" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl text-red-700">
                  !
                </div>

                <div>
                  <h3 className="font-bold text-red-900">
                    We couldn't load the opportunities
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-red-800">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => void fetchDrives()}
                    className="mt-4 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No drives */}
          {!loading && !error && drives.length === 0 && (
            <EmptyState
              title="No published drives yet"
              message="New placement opportunities will appear here once the Placement Cell publishes them."
              action={
                <button
                  type="button"
                  onClick={() => void fetchDrives()}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Check again
                </button>
              }
            />
          )}

          {/* No search matches */}
          {!loading &&
            !error &&
            drives.length > 0 &&
            filteredDrives.length === 0 && (
              <EmptyState
                title="No matching opportunities"
                message="Try a different search term or adjust your filters to see more placement drives."
                action={
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Clear filters
                  </button>
                }
              />
            )}

          {/* Drive cards */}
          {!loading && !error && filteredDrives.length > 0 && (
            <div className="mt-6 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredDrives.map((drive) => {
                const upcoming = isUpcoming(drive.driveDate);

                return (
                  <article
                    key={drive.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-950/5"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-400" />

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      {/* Company heading */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold ${getCompanyColor(
                            drive.companyName
                          )}`}
                        >
                          {getInitials(drive.companyName)}
                        </div>

                        <div className="min-w-0 flex-1 pt-0.5">
                          <h3 className="break-words text-lg font-bold tracking-tight text-slate-900">
                            {drive.companyName}
                          </h3>

                          <p className="mt-1 break-words text-sm font-semibold text-indigo-700">
                            {drive.role}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                          {drive.jobType || "Job type unspecified"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            upcoming
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {upcoming ? "Upcoming / Open date" : "Past date"}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                            ◷
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-500">
                              Drive date and time
                            </p>
                            <p className="mt-1 font-bold text-slate-900">
                              {formatDate(drive.driveDate)}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {formatTime(drive.driveDate)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Eligibility */}
                      <div className="mt-5 flex-1 space-y-4">
                        <InfoRow
                          symbol="◎"
                          label="Eligible branches"
                          value={drive.eligibleBranch}
                        />

                        <InfoRow
                          symbol="↗"
                          label="Minimum CGPA"
                          value={
                            drive.minCGPA == null
                              ? "Not specified"
                              : `${drive.minCGPA} / 10`
                          }
                        />
                      </div>

                      {/* Action */}
                      <div className="mt-6 border-t border-slate-100 pt-5">
                        <button
                          type="button"
                          onClick={() => openRegistration(drive)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                        >
                          Register for this drive
                          <span
                            aria-hidden="true"
                            className="transition-transform group-hover:translate-x-1"
                          >
                            →
                          </span>
                        </button>

                        <p className="mt-3 text-center text-xs text-slate-400">
                          Eligibility will be verified during registration.
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom information */}
        <section className="mt-12 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl text-indigo-700 shadow-sm">
              i
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Before you register
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Check the eligible branches and minimum CGPA for each
                opportunity. Use your correct academic information and
                email address. Duplicate registrations for the same drive
                may be rejected.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs leading-6 text-slate-500">
          <p className="font-semibold text-slate-700">
            PlacementHub · Student Placement Portal
          </p>
          <p className="mt-1">
            Discover opportunities. Take the next step in your career.
          </p>
        </footer>
      </div>

      {/* Registration modal */}
      {selectedDrive && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !submitting
            ) {
              closeRegistration();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeRegistration();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-title"
            className="my-auto max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >
            {/* Modal heading */}
            <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 p-6 text-white sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
                    APPLICATION FORM
                  </span>

                  <h2
                    id="registration-title"
                    className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl"
                  >
                    Register for a drive
                  </h2>

                  <p className="mt-2 break-words text-sm text-indigo-100">
                    {selectedDrive.companyName} · {selectedDrive.role}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeRegistration}
                  disabled={submitting}
                  aria-label="Close registration form"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl transition hover:bg-white/20 disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              {/* Eligibility reminder */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                <p className="text-sm font-bold text-indigo-950">
                  Check the eligibility requirements
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-500">
                      Eligible branches
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                      {selectedDrive.eligibleBranch}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-500">
                      Minimum CGPA
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedDrive.minCGPA == null
                        ? "Not specified"
                        : `${selectedDrive.minCGPA} / 10`}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-indigo-900">
                  The server will verify your eligibility when you submit.
                </p>
              </div>

              {successMessage ? (
                <div
                  role="status"
                  className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
                      ✓
                    </div>

                    <div>
                      <h3 className="font-bold text-emerald-900">
                        Registration successful!
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-emerald-800">
                        {successMessage}
                      </p>
                      <p className="mt-2 text-sm text-emerald-800">
                        Your registration has been submitted.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeRegistration}
                    className="mt-5 w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleRegistration}
                  className="mt-6 space-y-5"
                >
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Your details
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Enter your academic and contact information.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Full name" htmlFor="studentName">
                      <input
                        id="studentName"
                        name="studentName"
                        autoComplete="name"
                        required
                        maxLength={100}
                        value={form.studentName}
                        onChange={(event) =>
                          updateField("studentName", event.target.value)
                        }
                        placeholder="Your full name"
                        className={fieldClass}
                      />
                    </FormField>

                    <FormField label="Email address" htmlFor="email">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        value={form.email}
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
                        placeholder="you@example.com"
                        className={fieldClass}
                      />
                    </FormField>

                    <FormField label="Course" htmlFor="course">
                      <select
                        id="course"
                        name="course"
                        required
                        value={form.course}
                        onChange={(event) =>
                          updateField("course", event.target.value)
                        }
                        className={fieldClass}
                      >
                        <option value="">Select course</option>
                        <option value="B.Tech">B.Tech</option>
                        <option value="B.E.">B.E.</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                        <option value="MBA">MBA</option>
                        <option value="BBA">BBA</option>
                        <option value="Other">Other</option>
                      </select>
                    </FormField>

                    <FormField
                      label="Current study year"
                      htmlFor="studyYear"
                    >
                      <select
                        id="studyYear"
                        name="studyYear"
                        required
                        value={form.studyYear}
                        onChange={(event) =>
                          updateField("studyYear", event.target.value)
                        }
                        className={fieldClass}
                      >
                        <option value="">Select year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Final Year">Final Year</option>
                        <option value="Other">Other</option>
                      </select>
                    </FormField>

                    <FormField label="Branch" htmlFor="branch">
                      <input
                        id="branch"
                        name="branch"
                        required
                        maxLength={100}
                        value={form.branch}
                        onChange={(event) =>
                          updateField("branch", event.target.value)
                        }
                        placeholder="e.g. IT, CSE, ECE"
                        className={fieldClass}
                      />
                    </FormField>

                    <FormField
                      label="CGPA (out of 10)"
                      htmlFor="cgpa"
                    >
                      <input
                        id="cgpa"
                        name="cgpa"
                        type="number"
                        required
                        min="0"
                        max="10"
                        step="0.01"
                        value={form.cgpa}
                        onChange={(event) =>
                          updateField("cgpa", event.target.value)
                        }
                        placeholder="e.g. 8.25"
                        className={fieldClass}
                      />
                    </FormField>

                    <div className="sm:col-span-2">
                      <FormField
                        label="Preferred career domain"
                        htmlFor="preferredDomain"
                      >
                        <select
                          id="preferredDomain"
                          name="preferredDomain"
                          required
                          value={form.preferredDomain}
                          onChange={(event) =>
                            updateField(
                              "preferredDomain",
                              event.target.value
                            )
                          }
                          className={fieldClass}
                        >
                          <option value="">Select your domain</option>
                          <option value="Software Development">
                            Software Development
                          </option>
                          <option value="Data Analytics">
                            Data Analytics
                          </option>
                          <option value="AI and Machine Learning">
                            AI and Machine Learning
                          </option>
                          <option value="Cybersecurity">
                            Cybersecurity
                          </option>
                          <option value="Cloud Computing">
                            Cloud Computing
                          </option>
                          <option value="Business and Management">
                            Business and Management
                          </option>
                          <option value="Core Engineering">
                            Core Engineering
                          </option>
                          <option value="Other">Other</option>
                        </select>
                      </FormField>
                    </div>
                  </div>

                  {formError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
                    >
                      <p className="font-semibold">
                        Registration could not be completed
                      </p>
                      <p className="mt-1">{formError}</p>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-5">
                    <p className="text-xs leading-5 text-slate-500">
                      Please make sure your information is accurate.
                      Duplicate registrations and applications that do
                      not meet the drive requirements may be rejected.
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={closeRegistration}
                        disabled={submitting}
                        className="rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting
                          ? "Submitting registration…"
                          : "Submit application →"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function HeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-2xl font-bold tracking-tight sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-indigo-100 sm:text-sm">
        {label}
      </p>
    </div>
  );
}

function InfoRow({
  symbol,
  label,
  value,
}: {
  symbol: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base font-bold text-indigo-700">
        {symbol}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label} <span className="text-rose-500">*</span>
      </label>

      {children}
    </div>
  );
}

function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 bg-white px-5 py-12 text-center sm:py-16">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-700">
        ◇
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {message}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
