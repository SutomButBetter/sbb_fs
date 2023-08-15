/*
  Warnings:

  - You are about to drop the column `won` on the `Game` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('NOT_STARTED', 'ONGOING', 'NOT_FINISHED', 'WON', 'LOST');

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "won",
ADD COLUMN     "state" "GameStatus" NOT NULL DEFAULT 'NOT_STARTED';
