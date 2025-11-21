-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('SOCIAL', 'ACADEMIC', 'CAREER', 'WELLNESS', 'SPORTS', 'OTHER');

-- CreateEnum
CREATE TYPE "SwipeTargetType" AS ENUM ('USER', 'ROOM', 'EVENT');

-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('LIKE', 'PASS');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'CONNECTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "EventAttendeeStatus" AS ENUM ('GOING', 'INTERESTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MATCH', 'ROOM_ACTIVITY', 'EVENT_UPDATE', 'TIME_CAPSULE', 'SYSTEM');

-- AlterTable
ALTER TABLE "conversation_participants" ADD COLUMN     "lastReadAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "roomId" TEXT;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "reactions" JSONB,
ADD COLUMN     "replyToId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "room_messages" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "reactions" JSONB,
ADD COLUMN     "replyToId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "access" TEXT NOT NULL DEFAULT 'public',
ADD COLUMN     "campusId" TEXT,
ADD COLUMN     "inviteCode" TEXT,
ADD COLUMN     "lastPingAt" TIMESTAMP(3),
ADD COLUMN     "maxCapacity" INTEGER,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "timecapsules" ADD COLUMN     "campusId" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "allowMessagesFrom" TEXT DEFAULT 'campus',
ADD COLUMN     "campusId" TEXT,
ADD COLUMN     "createdRoomsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "hometown" TEXT,
ADD COLUMN     "intents" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "joinedRoomsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastActiveAt" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "lookingFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "profileVisibility" TEXT DEFAULT 'campus',
ADD COLUMN     "pronouns" TEXT,
ADD COLUMN     "seeking" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "interests" SET DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "timecapsule_contributions" (
    "id" TEXT NOT NULL,
    "capsuleId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "message" TEXT,
    "mediaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timecapsule_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swipes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "SwipeTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "direction" "SwipeDirection" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "peerId" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "conversationId" TEXT,
    "lastInteractionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "campusId" TEXT,
    "roomId" TEXT,
    "createdById" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "EventCategory" NOT NULL DEFAULT 'OTHER',
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "coverImage" TEXT,
    "hostName" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "rsvpCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendees" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "EventAttendeeStatus" NOT NULL DEFAULT 'GOING',
    "rsvpAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "payload" JSONB NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "timecapsule_contributions_capsuleId_contributorId_key" ON "timecapsule_contributions"("capsuleId", "contributorId");

-- CreateIndex
CREATE INDEX "swipes_userId_targetType_targetId_idx" ON "swipes"("userId", "targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "swipes_userId_targetType_targetId_key" ON "swipes"("userId", "targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "connections_conversationId_key" ON "connections"("conversationId");

-- CreateIndex
CREATE INDEX "connections_peerId_userId_idx" ON "connections"("peerId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "connections_userId_peerId_key" ON "connections"("userId", "peerId");

-- CreateIndex
CREATE INDEX "events_campusId_startTime_idx" ON "events"("campusId", "startTime");

-- CreateIndex
CREATE INDEX "events_isFeatured_idx" ON "events"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendees_eventId_userId_key" ON "event_attendees"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "campuses_slug_key" ON "campuses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "campuses_domain_key" ON "campuses"("domain");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_roomId_key" ON "conversations"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_inviteCode_key" ON "rooms"("inviteCode");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "room_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timecapsules" ADD CONSTRAINT "timecapsules_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timecapsule_contributions" ADD CONSTRAINT "timecapsule_contributions_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "timecapsules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timecapsule_contributions" ADD CONSTRAINT "timecapsule_contributions_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_peerId_fkey" FOREIGN KEY ("peerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

