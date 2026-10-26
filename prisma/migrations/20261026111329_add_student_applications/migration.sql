-- CreateTable
CREATE TABLE "StudentApplication" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "studyYear" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "cgpa" DOUBLE PRECISION NOT NULL,
    "preferredDomain" TEXT NOT NULL,
    "placementDriveId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentApplication_email_placementDriveId_key" ON "StudentApplication"("email", "placementDriveId");

-- AddForeignKey
ALTER TABLE "StudentApplication" ADD CONSTRAINT "StudentApplication_placementDriveId_fkey" FOREIGN KEY ("placementDriveId") REFERENCES "PlacementDrive"("id") ON DELETE CASCADE ON UPDATE CASCADE;
