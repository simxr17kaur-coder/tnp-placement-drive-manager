import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyAdminSession,
  unauthorizedResponse,
} from "@/lib/auth";

// GET: Retrieve published placement drives for the student portal.
// This route remains public so students can browse available drives.
export async function GET() {
  try {
    const drives = await prisma.placementDrive.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: {
        driveDate: "asc",
      },
    });

    return NextResponse.json(drives, { status: 200 });
  } catch (error) {
    console.error("Error fetching placement drives:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch placement drives.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

// POST: Create a placement drive as a draft or publish it.
// Only authenticated administrators can create placement drives.
export async function POST(request: Request) {
  // SECURITY CHECK: Reject requests from users who are not logged in.
  if (!(await verifyAdminSession())) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be a valid JSON object." },
        { status: 400 }
      );
    }

    const {
      companyName,
      role,
      driveDate,
      eligibleBranch,
      minCGPA,
      jobType,
      status,
    } = body;

    // Validate required fields.
    if (
      typeof companyName !== "string" ||
      !companyName.trim() ||
      typeof role !== "string" ||
      !role.trim() ||
      typeof driveDate !== "string" ||
      !driveDate.trim() ||
      typeof eligibleBranch !== "string" ||
      !eligibleBranch.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Company name, role, drive date, and eligible branch are required.",
        },
        { status: 400 }
      );
    }

    // Validate date.
    const parsedDate = new Date(driveDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Please provide a valid drive date." },
        { status: 400 }
      );
    }

    // Validate optional CGPA.
    let parsedCGPA: number | undefined;

    if (minCGPA !== undefined && minCGPA !== null && minCGPA !== "") {
      parsedCGPA = Number(minCGPA);

      if (
        !Number.isFinite(parsedCGPA) ||
        parsedCGPA < 0 ||
        parsedCGPA > 10
      ) {
        return NextResponse.json(
          { error: "Minimum CGPA must be between 0 and 10." },
          { status: 400 }
        );
      }
    }

    // Validate optional job type.
    const allowedJobTypes = ["Internship", "Full-Time", "Other"];

    if (
      jobType !== undefined &&
      jobType !== null &&
      jobType !== "" &&
      (typeof jobType !== "string" ||
        !allowedJobTypes.includes(jobType))
    ) {
      return NextResponse.json(
        { error: "Job type must be Internship, Full-Time, or Other." },
        { status: 400 }
      );
    }

    // Validate publication status.
    const allowedStatuses = ["DRAFT", "PUBLISHED"];

    if (
      status !== undefined &&
      (typeof status !== "string" ||
        !allowedStatuses.includes(status))
    ) {
      return NextResponse.json(
        { error: "Status must be DRAFT or PUBLISHED." },
        { status: 400 }
      );
    }

    // Save the placement drive to PostgreSQL.
    const drive = await prisma.placementDrive.create({
      data: {
        companyName: companyName.trim(),
        role: role.trim(),
        driveDate: parsedDate,
        eligibleBranch: eligibleBranch.trim(),
        minCGPA: parsedCGPA,
        jobType: jobType || null,
        status: status || "DRAFT",
      },
    });

    return NextResponse.json(drive, { status: 201 });
  } catch (error) {
    console.error("Error creating placement drive:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create placement drive.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}