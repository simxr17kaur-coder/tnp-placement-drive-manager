-- CreateTable
CREATE TABLE "PlacementDrive" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "driveDate" TIMESTAMP(3) NOT NULL,
    "eligibleBranch" TEXT NOT NULL,
    "minCGPA" DOUBLE PRECISION,
    "jobType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementDrive_pkey" PRIMARY KEY ("id")
);
