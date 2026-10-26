
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const studentName =
      typeof body.studentName === "string" ? body.studentName.trim() : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const course =
      typeof body.course === "string" ? body.course.trim() : "";
    const studyYear =
      typeof body.studyYear === "string" ? body.studyYear.trim() : "";
    const branch =
      typeof body.branch === "string" ? body.branch.trim() : "";
    const preferredDomain =
      typeof body.preferredDomain === "string"
        ? body.preferredDomain.trim()
        : "";
    const placementDriveId =
      typeof body.placementDriveId === "string"
        ? body.placementDriveId.trim()
        : "";
    const cgpa = body.cgpa;

    // Validate required fields.
    if (
      !studentName ||
      !email ||
      !course ||
      !studyYear ||
      !branch ||
      !preferredDomain ||
      !placementDriveId ||
      cgpa === undefined ||
      cgpa === null ||
      cgpa === ""
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    // Basic email validation.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Validate CGPA.
    const studentCGPA = Number(cgpa);

    if (
      !Number.isFinite(studentCGPA) ||
      studentCGPA < 0 ||
      studentCGPA > 10
    ) {
      return NextResponse.json(
        { error: "CGPA must be a number between 0 and 10." },
        { status: 400 }
      );
    }

    // Only published drives can accept applications.
    const drive = await prisma.placementDrive.findUnique({
      where: { id: placementDriveId },
    });

    if (!drive || drive.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "This placement drive is unavailable for registration." },
        { status: 404 }
      );
    }

    // Support a single branch, comma-separated branches, or "All".
    const normalize = (value: string) => value.trim().toLowerCase();

    const eligibleBranches = drive.eligibleBranch
      .split(",")
      .map(normalize);

    const branchIsEligible =
      eligibleBranches.includes("all") ||
      eligibleBranches.includes("all branches") ||
      eligibleBranches.includes(normalize(branch));

    if (!branchIsEligible) {
      return NextResponse.json(
        {
          error: `Your branch (${branch}) is not eligible for this drive. Eligible branches: ${drive.eligibleBranch}.`,
        },
        { status: 400 }
      );
    }

    if (drive.minCGPA !== null && studentCGPA < drive.minCGPA) {
      return NextResponse.json(
        {
          error: `Your CGPA is below the minimum required CGPA of ${drive.minCGPA}.`,
        },
        { status: 400 }
      );
    }

    // Save the eligible application in PostgreSQL.
    const application = await prisma.studentApplication.create({
      data: {
        studentName,
        email,
        course,
        studyYear,
        branch,
        cgpa: studentCGPA,
        preferredDomain,
        placementDriveId,
      },
      select: {
        id: true,
        studentName: true,
        email: true,
        placementDriveId: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Registration successful!",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    // Prevent duplicate registrations for the same drive and email.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "You have already registered for this placement drive using this email.",
        },
        { status: 409 }
      );
    }

    console.error("Student application error:", error);

    return NextResponse.json(
      { error: "Something went wrong while processing your registration." },
      { status: 500 }
    );
  }
}

