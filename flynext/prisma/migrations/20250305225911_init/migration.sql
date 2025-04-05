-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FlightBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "bookingRef" TEXT NOT NULL,
    "returnFlight" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Confirmed',
    "lastName" TEXT NOT NULL,
    CONSTRAINT "FlightBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FlightBooking" ("bookingId", "bookingRef", "id", "lastName", "returnFlight") SELECT "bookingId", "bookingRef", "id", "lastName", "returnFlight" FROM "FlightBooking";
DROP TABLE "FlightBooking";
ALTER TABLE "new_FlightBooking" RENAME TO "FlightBooking";
CREATE TABLE "new_HotelBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "roomsBooked" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Confirmed',
    "totalPrice" REAL NOT NULL,
    CONSTRAINT "HotelBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HotelBooking_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HotelBooking_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HotelBooking" ("bookingId", "checkIn", "checkOut", "hotelId", "id", "roomTypeId", "roomsBooked", "totalPrice") SELECT "bookingId", "checkIn", "checkOut", "hotelId", "id", "roomTypeId", "roomsBooked", "totalPrice" FROM "HotelBooking";
DROP TABLE "HotelBooking";
ALTER TABLE "new_HotelBooking" RENAME TO "HotelBooking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
