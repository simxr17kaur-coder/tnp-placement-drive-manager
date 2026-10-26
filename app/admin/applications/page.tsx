
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Application = {
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
  placementDrive: {
    companyName: string;
    role: string;
    driveDate: string;
  };
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch("/api/admin/applications", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load registrations."
          );
        }

        setApplications(data.applications);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return applications;

    return applications.filter((application) =>
      [
        application.studentName,
        application.email,
        application.course,
        application.studyYear,
        application.branch,
        application.preferredDomain,
        application.placementDrive.companyName,
        application.placementDrive.role,
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [applications, search]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-emerald-700">
              Admin Portal
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Student placement registrations
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            ← Admin Dashboard
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
          Placement Management
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Student Registrations
        </h2>

        <p className="mt-3 text-slate-600">
          View and search students who have registered for placement drives.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Total Registrations
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {loading ? "…" : applications.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Matching Registrations
            </p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "…" : filteredApplications.length}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <label
            htmlFor="application-search"
            className="mb-2 block text-sm font-semibold"
          >
            Search registrations
          </label>

          <input
            id="application-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by student, email, branch, or company..."
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-600 sm:max-w-xl"
          />
        </div>

        {loading && (
          <p className="mt-8 rounded-xl bg-white p-8 text-slate-600">
            Loading registrations...
          </p>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
          >
            {error}
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-xl font-semibold">
              No registrations yet
            </h3>
            <p className="mt-2 text-slate-600">
              Student applications will appear here after registration.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          applications.length > 0 &&
          filteredApplications.length === 0 && (
            <p className="mt-8 rounded-xl bg-white p-8 text-slate-600">
              No registrations match your search.
            </p>
          )}

        {!loading && !error && filteredApplications.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-4">Student</th>
                  <th className="px-4 py-4">Course / Year</th>
                  <th className="px-4 py-4">Branch</th>
                  <th className="px-4 py-4">CGPA</th>
                  <th className="px-4 py-4">Preferred Domain</th>
                  <th className="px-4 py-4">Company</th>
                  <th className="px-4 py-4">Role</th>
                  <th className="px-4 py-4">Registered On</th>
                  <th className="px-4 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((application) => (
                  <tr
                    key={application.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold">
                        {application.studentName}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {application.email}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {application.course}
                      <p className="mt-1 text-slate-500">
                        {application.studyYear}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {application.branch}
                    </td>

                    <td className="px-4 py-4">
                      {application.cgpa.toFixed(2)}
                    </td>

                    <td className="px-4 py-4">
                      {application.preferredDomain}
                    </td>

                    <td className="px-4 py-4 font-medium">
                      {application.placementDrive.companyName}
                    </td>

                    <td className="px-4 py-4">
                      {application.placementDrive.role}
                    </td>

                    <td className="px-4 py-4">
                      {new Date(application.createdAt).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {application.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
