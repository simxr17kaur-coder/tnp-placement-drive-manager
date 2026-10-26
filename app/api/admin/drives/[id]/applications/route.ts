
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyAdminSession,
  unauthorizedResponse,
} from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Allow only authenticated administrators to view registrations.
  if (!(await verifyAdminSession())) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;

    const drive = await prisma.placementDrive.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!drive) {
      return NextResponse.json(
        { error: "Placement drive not found." },
        { status: 404 }
      );
    }

    const applications = await prisma.studentApplication.findMany({
      where: { placementDriveId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        studentName: true,
        email: true,
        course: true,
        studyYear: true,
        branch: true,
        cgpa: true,
        preferredDomain: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      total: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Failed to fetch drive registrations:", error);

    return NextResponse.json(
      { error: "Unable to load registered students." },
      { status: 500 }
    );
  }
}
