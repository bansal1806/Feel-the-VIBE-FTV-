-- Remove clerkId column from users table
-- This migration removes the Clerk authentication dependency

-- Drop the unique constraint on clerkId if it exists
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_clerkId_key";

-- Drop the clerkId column
ALTER TABLE "users" DROP COLUMN IF EXISTS "clerkId";

