
import { connection, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyAdminSession,
  unauthorizedResponse,
} from "@/lib/auth";

// Admin dashboard: retrieve both draft and published drives.
export async function GET() {
  // Wait for an incoming request before accessing request-specific cookies.
  await connection();

  // Allow access only to authenticated administrators.
  if (!(await verifyAdminSession())) {
    return unauthorizedResponse();
  }

  try {
    const drives = await prisma.placementDrive.findMany({
      orderBy: {
        driveDate: "asc",
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return NextResponse.json(drives, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch admin drives:", error);

    return NextResponse.json(
      { error: "Unable to load placement drives." },
      { status: 500 }
    );
  }
}
