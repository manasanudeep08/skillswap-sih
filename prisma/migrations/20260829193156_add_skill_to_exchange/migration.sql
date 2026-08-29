-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ExchangeRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "skillId" INTEGER,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExchangeRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExchangeRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExchangeRequest_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ExchangeRequest" ("createdAt", "id", "message", "receiverId", "senderId", "skillId", "status", "updatedAt") SELECT "createdAt", "id", "message", "receiverId", "senderId", "skillId", "status", "updatedAt" FROM "ExchangeRequest";
DROP TABLE "ExchangeRequest";
ALTER TABLE "new_ExchangeRequest" RENAME TO "ExchangeRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
