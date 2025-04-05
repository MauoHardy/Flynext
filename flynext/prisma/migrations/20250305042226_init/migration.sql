/*
  Warnings:

  - You are about to drop the `Flight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FlightLayover` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `flightId` on the `FlightBooking` table. All the data in the column will be lost.
  - You are about to drop the column `passengers` on the `FlightBooking` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `FlightBooking` table. All the data in the column will be lost.
  - Added the required column `bookingRef` to the `FlightBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `FlightBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `returnFlight` to the `FlightBooking` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Flight";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FlightLayover";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FlightBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "bookingRef" TEXT NOT NULL,
    "returnFlight" BOOLEAN NOT NULL,
    "lastName" TEXT NOT NULL,
    CONSTRAINT "FlightBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FlightBooking" ("bookingId", "id") SELECT "bookingId", "id" FROM "FlightBooking";
DROP TABLE "FlightBooking";
ALTER TABLE "new_FlightBooking" RENAME TO "FlightBooking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
