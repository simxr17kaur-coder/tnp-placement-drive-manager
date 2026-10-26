
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyAdminSession,
  unauthorizedResponse,
} from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify the administrator's session before allowing changes.
  if (!(await verifyAdminSession())) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Only publishing a drive is supported by this endpoint.
    if (body.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Only publishing a drive is supported here." },
        { status: 400 }
      );
    }

    const existingDrive = await prisma.placementDrive.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingDrive) {
      return NextResponse.json(
        { error: "Placement drive not found." },
        { status: 404 }
      );
    }

    const updatedDrive = await prisma.placementDrive.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });

    return NextResponse.json(updatedDrive, { status: 200 });
  } catch (error) {
    console.error("Failed to publish placement drive:", error);

    return NextResponse.json(
      { error: "Unable to publish the placement drive." },
      { status: 500 }
    );
  }
}
