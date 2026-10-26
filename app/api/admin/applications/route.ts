
import { connection, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyAdminSession,
  unauthorizedResponse,
} from "@/lib/auth";

export async function GET() {
  // Wait for an incoming request before accessing request-specific cookies.
  await connection();

  // Allow only authenticated administrators to view registrations.
  if (!(await verifyAdminSession())) {
    return unauthorizedResponse();
  }

  try {
    const applications = await prisma.studentApplication.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        placementDrive: {
          select: {
            companyName: true,
            role: true,
            driveDate: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        total: applications.length,
        applications,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch applications:", error);

    return NextResponse.json(
      { error: "Unable to fetch student registrations." },
      { status: 500 }
    );
  }
}
