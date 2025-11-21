-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('STUDY', 'EVENT', 'SOCIAL');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('SOCIAL', 'ACADEMIC', 'CAREER', 'WELLNESS', 'SPORTS', 'OTHER');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'ROOM');

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

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "alias" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "major" TEXT,
    "year" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skillCreds" INTEGER NOT NULL DEFAULT 0,
    "onboardingAt" TIMESTAMP(3),
    "profileCompletedAt" TIMESTAMP(3),
    "dualIdentityMode" BOOLEAN NOT NULL DEFAULT true,
    "discoverable" BOOLEAN NOT NULL DEFAULT true,
    "recruiterOptIn" BOOLEAN NOT NULL DEFAULT false,
    "shareAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "campusId" TEXT,
    "headline" TEXT,
    "pronouns" TEXT,
    "hometown" TEXT,
    "lookingFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "intents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seeking" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "lastActiveAt" TIMESTAMP(3),
    "profileVisibility" TEXT DEFAULT 'campus',
    "allowMessagesFrom" TEXT DEFAULT 'campus',
    "createdRoomsCount" INTEGER NOT NULL DEFAULT 0,
    "joinedRoomsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "type" "RoomType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "campusId" TEXT,
    "inviteCode" TEXT,
    "maxCapacity" INTEGER,
    "access" TEXT NOT NULL DEFAULT 'public',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastPingAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_members" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "room_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_messages" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "replyToId" TEXT,
    "reactions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "room_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL,
    "roomId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "replyToId" TEXT,
    "reactions" JSONB,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timecapsules" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "campusId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaUrl" TEXT,
    "unlockAt" TIMESTAMP(3) NOT NULL,
    "audience" TEXT NOT NULL,
    "coverImage" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timecapsules_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_alias_key" ON "users"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_inviteCode_key" ON "rooms"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "room_members_roomId_userId_key" ON "room_members"("roomId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_roomId_key" ON "conversations"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversationId_userId_key" ON "conversation_participants"("conversationId", "userId");

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

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_members" ADD CONSTRAINT "room_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "room_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timecapsules" ADD CONSTRAINT "timecapsules_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

