import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation Bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
              T
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                TNP Placement Drive Manager
              </h1>
              <p className="text-sm text-slate-500">
                Training and Placement Portal
              </p>
            </div>
          </Link>

          <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
            TNP Portal
          </span>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700 px-6 py-14 text-white shadow-xl sm:px-12 sm:py-20">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Your Future Starts Here
          </p>

          <h2 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
            Welcome to TNP Placement Drive Manager
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-indigo-100">
            Discover career opportunities, explore company recruitment
            drives, and take the next step towards your professional future.
            Choose your portal to get started.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/student"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-indigo-800 transition hover:bg-cyan-100"
            >
              Explore Opportunities →
            </Link>

            <Link
              href="/admin/login"
              className="rounded-xl border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Administrator Login →
            </Link>
          </div>
        </div>

        {/* Portal Selection */}
        <div className="mt-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            GET STARTED
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Choose Your Portal
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Select the option that matches your role to continue.
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {/* Student Portal Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
              🎓
            </div>

            <h3 className="mt-6 text-2xl font-bold">
              Student Portal
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              Explore published placement drives, search for suitable
              opportunities, check eligibility requirements, and register
              for recruitment drives.
            </p>

            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              <li>✓ Browse placement opportunities</li>
              <li>✓ Search and filter available drives</li>
              <li>✓ Check eligibility and register</li>
            </ul>

            <Link
              href="/student"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Enter Student Portal →
            </Link>
          </div>

          {/* Admin Portal Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
              🔐
            </div>

            <h3 className="mt-6 text-2xl font-bold">
              Admin Portal
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              Manage recruitment drives, publish opportunities, monitor
              student registrations, and view registered student details.
            </p>

            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              <li>✓ Create and manage placement drives</li>
              <li>✓ Publish or save drives as drafts</li>
              <li>✓ View registrations and student details</li>
            </ul>

            <Link
              href="/admin/login"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              Enter Admin Login →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          © 2026 TNP Placement Drive Manager. Your career journey starts here.
        </footer>
      </section>
    </main>
  );
}