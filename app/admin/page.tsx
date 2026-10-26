
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "../../lib/auth";
import AdminDashboard from "./AdminDashboard";

export const instant = false;

async function AuthenticatedAdminPage() {
  // Wait until an actual request arrives before checking session cookies.
  await connection();

  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">Loading admin dashboard...</div>
      }
    >
      <AuthenticatedAdminPage />
    </Suspense>
  );
}
