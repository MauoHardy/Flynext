# Flynext

Flynext is a powerful flight and hotel booking management tool inspired by platforms like Booking.com buitl on **React.js and Next.js**. It offers a seamless experience for users to book flights and hotels, while providing advanced administrative features for hotel owners to manage their properties and bookings efficiently.

## Key Features

### For Users
- **Account Management**: Sign up, log in, log out, and update your profile with details like name, email, profile picture, and phone number. Secure authentication via JWT.
- **Flight Search**: Search for flights by specifying source, destination, and travel dates. Supports one-way and round-trip flights with detailed flight information, including departure/arrival times, duration, and layovers.
- **Hotel Search**: Find hotels by city, check-in/check-out dates, and filter by name, star-rating, and price range. Results include hotel details, room types, amenities, and pricing.
- **Itinerary Booking**: Book flights, hotels, or both in a combined itinerary. A checkout page displays all itinerary details, validates credit card information, and finalizes bookings.
- **Booking History**: View and manage your past bookings, including cancellations and itinerary details.
- **Suggestions**: Get hotel suggestions for your flight destination or flight suggestions for your hotel stay. Links take you to pre-filled search pages for quick booking.
- **PDF Invoice**: Receive a downloadable PDF invoice for your bookings as a record of your transaction.
- **Notifications**: Stay informed with notifications about new bookings, booking changes, or cancellations.

### For Hotel Owners (Admin Features)
- **Hotel Management**: Add your hotel to the platform with details like name, logo, address, location, star rating, and images.
- **Room Management**: Define room types (e.g., twin, double) with amenities, pricing, and images. Update room availability and manage overbooked situations.
- **Booking Management**: View and filter your hotel's bookings by date or room type. Cancel reservations to manage your hotel flexibly.
- **Occupancy Insights**: View room availability and trends for specific date ranges to better understand demand and occupancy rates.
- **Notifications**: Get notified about new bookings or changes affecting your hotel.

### User Experience
- **Responsive Design**: Enjoy a clean, intuitive interface across all devices, including monitors, laptops, tablets, and mobile devices.
- **Dark/Light Mode**: Toggle between dark and light modes for a personalized viewing experience.

## Technologies Used
- **Languages**: TypeScript (80.8%), JavaScript (17.8%), Other (1.4%)
- **Backend**: Next.js, Secure JWT-based authentication and robust APIs for booking and search functionalities.
- **Frontend**: React.js, responsive design with seamless navigation and accessibility.
- **Database**: Efficient storage and querying for user, flight, and hotel data.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MauoHardy/Flynext.git
   ```

2. Install dependencies and start the website:
   ```bash
   ./startup.sh
    ```
   

## License

Flynext is licensed under the [MIT License](LICENSE).
