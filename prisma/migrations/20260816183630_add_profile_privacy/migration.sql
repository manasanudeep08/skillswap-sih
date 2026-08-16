-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT NOT NULL DEFAULT 'avatar1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "instagramUrl" TEXT,
    "portfolioUrl" TEXT,
    "otherUrl" TEXT,
    "emailVisibility" TEXT NOT NULL DEFAULT 'accepted',
    "phoneVisibility" TEXT NOT NULL DEFAULT 'accepted',
    "socialVisibility" TEXT NOT NULL DEFAULT 'matches'
);
INSERT INTO "new_User" ("avatar", "bio", "createdAt", "email", "id", "name", "password", "username") SELECT "avatar", "bio", "createdAt", "email", "id", "name", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
