-- CreateEnum
CREATE TYPE "Role" AS ENUM ('LEARNER', 'INSTRUCTOR');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC', 'BOTH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "transmission" "Transmission" NOT NULL DEFAULT 'MANUAL',
    "goal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstructorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adiNumber" TEXT NOT NULL,
    "businessName" TEXT,
    "postcodes" TEXT NOT NULL,
    "transmission" "Transmission" NOT NULL DEFAULT 'MANUAL',
    "hourlyRate" INTEGER NOT NULL,
    "carDetails" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstructorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerProfile_userId_key" ON "LearnerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InstructorProfile_userId_key" ON "InstructorProfile"("userId");

-- AddForeignKey
ALTER TABLE "LearnerProfile" ADD CONSTRAINT "LearnerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstructorProfile" ADD CONSTRAINT "InstructorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
