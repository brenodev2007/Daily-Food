/*
  Warnings:

  - You are about to drop the `food` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `calorias` to the `refeicao` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "food";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_refeicao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataHora" DATETIME NOT NULL,
    "calorias" REAL NOT NULL,
    "dentroDaDieta" BOOLEAN NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "dietaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "refeicao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "refeicao_dietaId_fkey" FOREIGN KEY ("dietaId") REFERENCES "dieta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_refeicao" ("createdAt", "dataHora", "dentroDaDieta", "descricao", "id", "nome", "updatedAt", "usuarioId") SELECT "createdAt", "dataHora", "dentroDaDieta", "descricao", "id", "nome", "updatedAt", "usuarioId" FROM "refeicao";
DROP TABLE "refeicao";
ALTER TABLE "new_refeicao" RENAME TO "refeicao";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
