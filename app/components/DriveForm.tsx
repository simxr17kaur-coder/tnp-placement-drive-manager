"use client";

import { useState } from "react";

type DriveFormProps = {
  onClose: () => void;
};

export default function DriveForm({ onClose }: DriveFormProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    driveDate: "",
    eligibleBranch: "",
    minCGPA: "",
    jobType: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrorMessage("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
    status: "DRAFT" | "PUBLISHED"
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/drives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          driveDate: new Date(formData.driveDate).toISOString(),
          minCGPA:
            formData.minCGPA === "" ? null : Number(formData.minCGPA),
          jobType: formData.jobType || null,
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error || "Failed to save the placement drive."
        );
        return;
      }

      alert(
        status === "PUBLISHED"
          ? "Placement drive published successfully!"
          : "Placement drive saved as draft successfully!"
      );

      onClose();
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
      <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Register New Drive
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Enter the company and recruitment details below.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close form"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={(event) => handleSubmit(event, "PUBLISHED")}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="companyName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Company Name *
              </label>

              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Google"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Job Role *
              </label>

              <input
                id="role"
                name="role"
                type="text"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="driveDate"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Drive Date and Time *
              </label>

              <input
                id="driveDate"
                name="driveDate"
                type="datetime-local"
                value={formData.driveDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="eligibleBranch"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Eligible Branch *
              </label>

              <input
                id="eligibleBranch"
                name="eligibleBranch"
                type="text"
                value={formData.eligibleBranch}
                onChange={handleChange}
                placeholder="e.g. CSE, IT, ECE"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="minCGPA"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Minimum CGPA
              </label>

              <input
                id="minCGPA"
                name="minCGPA"
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={formData.minCGPA}
                onChange={handleChange}
                placeholder="e.g. 7.0"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="jobType"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Job Type
              </label>

              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select job type</option>
                <option value="Internship">Internship</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Fields marked with * are required.
          </p>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={(event) => {
                const form = event.currentTarget.form;

                if (form && form.reportValidity()) {
                  void handleSubmit(
                    {
                      preventDefault: () => {},
                    } as React.FormEvent<HTMLFormElement>,
                    "DRAFT"
                  );
                }
              }}
              className="rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save as Draft"}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Publish Drive"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}