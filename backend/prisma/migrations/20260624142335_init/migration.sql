-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "name" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 20,
    "level" TEXT NOT NULL DEFAULT 'Curious Mind',
    "score" INTEGER NOT NULL DEFAULT 10,
    "streak" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VaultItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "previewText" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VaultItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "feasibility" INTEGER NOT NULL,
    "innovation" INTEGER NOT NULL,
    "marketPotential" INTEGER NOT NULL,
    "complexity" INTEGER NOT NULL,
    "verdict" TEXT NOT NULL,
    "swotS" TEXT NOT NULL,
    "swotW" TEXT NOT NULL,
    "swotO" TEXT NOT NULL,
    "swotT" TEXT NOT NULL,
    "failures" TEXT NOT NULL,
    "improvements" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "difficultyLabel" TEXT NOT NULL,
    "xp" INTEGER NOT NULL,
    "pts" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "correctOptionIndex" INTEGER NOT NULL,
    "successMsg" TEXT NOT NULL,
    "failMsg" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
