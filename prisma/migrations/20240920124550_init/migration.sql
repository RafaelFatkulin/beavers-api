-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'LOGISTICIAN', 'MANAGER');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT,
    "email" VARCHAR(63) NOT NULL,
    "phone" VARCHAR(15),
    "avatar" VARCHAR(255),
    "password" VARCHAR(63) NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users" USING HASH ("email");
