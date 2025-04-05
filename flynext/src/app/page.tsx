"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Building2, Search, Calendar, MapPin, Users, ArrowRight, TrendingUp, Award, Heart } from "lucide-react";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import HotelCard, { HotelCardProps } from "@/app/components/ui/HotelCard";
import Footer from "@/app/components/layout/Footer";
import LocationAutocomplete from "@/app/components/ui/LocationAutocomplete";

// Sample data
const featuredHotels: HotelCardProps[] = [
  {
    id: "1",
    name: "Grand Plaza Hotel",
    location: "Paris, France",
    price: 299,
    rating: 4.8,
    imageUrl: "/paris.jpg",
    amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
  },
  {
    id: "2",
    name: "Sakura Residence",
    location: "Tokyo, Japan",
    price: 259,
    rating: 4.7,
    imageUrl: "/tokyo.jpg",
    amenities: ["WiFi", "Gym", "Restaurant", "Bar"],
  },
  {
    id: "3",
    name: "Hudson Heights",
    location: "New York, USA",
    price: 349,
    rating: 4.9,
    imageUrl: "/nyc.jpg",
    amenities: ["WiFi", "Gym", "Spa", "Restaurant", "Bar"],
  },
];

const destinations = [
  { city: "Paris", country: "France", image: "/paris.jpg", price: 599 },
  { city: "Tokyo", country: "Japan", image: "/tokyo.jpg", price: 899 },
  { city: "New York", country: "USA", image: "/nyc.jpg", price: 399 },
  { city: "London", country: "UK", image: "/london.jpg", price: 549 },
];

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("flights");

  // Hotel search form state
  const [hotelSearch, setHotelSearch] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
  });

  // Flight search form state
  const [flightSearch, setFlightSearch] = useState({
    source: "",
    destination: "",
    departureDate: "",
    returnDate: "",
    passengers: 1,
  });

  // Add display values for flight search form
  const [flightDisplayValues, setFlightDisplayValues] = useState({
    source: "",
    destination: "",
  });

  // Add display value for hotel city
  const [hotelDisplayValue, setHotelDisplayValue] = useState("");

  const handleHotelSearchChange = (e) => {
    const { name, value } = e.target;
    setHotelSearch((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFlightSearchChange = (e) => {
    const { name, value } = e.target;
    setFlightSearch((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFlightLocationSelect = (fieldName: string, value: string, displayValue: string) => {
    setFlightSearch((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setFlightDisplayValues((prev) => ({
      ...prev,
      [fieldName]: displayValue,
    }));
  };

  const handleHotelLocationSelect = (value: string, displayValue: string) => {
    setHotelSearch((prev) => ({
      ...prev,
      city: value,
    }));

    setHotelDisplayValue(displayValue);
  };

  const handleHotelSearch = (e) => {
    e.preventDefault();

    // Store search parameters in localStorage for use on the hotels page
    localStorage.setItem("hotelSearchParams", JSON.stringify(hotelSearch));

    // Create query parameters
    const queryParams = new URLSearchParams();
    Object.entries(hotelSearch).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    // Navigate to hotels page with search parameters
    router.push(`/hotels?${queryParams.toString()}`);
  };

  const handleFlightSearch = (e) => {
    e.preventDefault();

    // Create query parameters
    const queryParams = new URLSearchParams();
    Object.entries(flightSearch).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    // Navigate to flights page with search parameters
    router.push(`/flights?${queryParams.toString()}`);
  };

  return (
    <main className="flex min-h-screen flex-col bg-blue-100">
      {/* Hero Section with extended gradient background */}
      <div className="relative bg-gradient-to-br from-blue-800 to-indigo-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800/80 to-indigo-900/80"></div>
          <div className="absolute inset-0 bg-[url('/hero-background.jpg')] bg-cover bg-center opacity-30"></div>
        </div>

        {/* Hero Content */}
        <div className="relative py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Your Next Adventure
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Find the best flights and hotels at unbeatable prices, all in one place.
            </p>
          </div>
        </div>

        {/* Search Tabs - moved inside the gradient background */}
        <div className="relative pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-t-lg overflow-hidden">
                <div className="flex">
                  <button
                    className={`flex-1 py-4 px-6 font-medium flex items-center justify-center gap-2 transition-colors ${
                      activeTab === "flights"
                        ? "bg-white text-blue-800"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                    onClick={() => setActiveTab("flights")}
                  >
                    <Plane size={20} />
                    <span>Flights</span>
                  </button>
                  <button
                    className={`flex-1 py-4 px-6 font-medium flex items-center justify-center gap-2 transition-colors ${
                      activeTab === "hotels"
                        ? "bg-white text-blue-800"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                    onClick={() => setActiveTab("hotels")}
                  >
                    <Building2 size={20} />
                    <span>Hotels</span>
                  </button>
                </div>
              </div>

              {/* Search Form */}
              <div className="bg-white rounded-b-lg shadow-md p-6">
                {activeTab === "flights" ? (
                  <form onSubmit={handleFlightSearch} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="source" className="block text-sm font-medium text-gray-800 mb-1">
                          From
                        </label>
                        <LocationAutocomplete
                          id="source"
                          name="source"
                          value={flightDisplayValues.source || flightSearch.source}
                          onChange={(e) => handleFlightSearchChange(e)}
                          onSelect={(value, displayValue) => handleFlightLocationSelect("source", value, displayValue)}
                          placeholder="Origin city or airport"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="destination" className="block text-sm font-medium text-gray-800 mb-1">
                          To
                        </label>
                        <LocationAutocomplete
                          id="destination"
                          name="destination"
                          value={flightDisplayValues.destination || flightSearch.destination}
                          onChange={(e) => handleFlightSearchChange(e)}
                          onSelect={(value, displayValue) => handleFlightLocationSelect("destination", value, displayValue)}
                          placeholder="Destination city or airport"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="departureDate" className="block text-sm font-medium text-gray-800 mb-1">
                          Departure
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="date"
                            id="departureDate"
                            name="departureDate"
                            value={flightSearch.departureDate}
                            onChange={handleFlightSearchChange}
                            className="w-full p-2 pl-10 border rounded-md text-gray-900"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="returnDate" className="block text-sm font-medium text-gray-800 mb-1">
                          Return (Optional)
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="date"
                            id="returnDate"
                            name="returnDate"
                            value={flightSearch.returnDate}
                            onChange={handleFlightSearchChange}
                            className="w-full p-2 pl-10 border rounded-md text-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="passengers" className="block text-sm font-medium text-gray-800 mb-1">
                          Passengers
                        </label>
                        <input
                          type="number"
                          id="passengers"
                          name="passengers"
                          value={flightSearch.passengers}
                          onChange={handleFlightSearchChange}
                          min="1"
                          max="10"
                          className="w-full p-2 border rounded-md text-gray-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Search size={18} />
                        Search Flights
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleHotelSearch} className="space-y-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-800 mb-1">
                        Destination
                      </label>
                      <LocationAutocomplete
                        id="city"
                        name="city"
                        value={hotelDisplayValue || hotelSearch.city}
                        onChange={(e) => handleHotelSearchChange(e)}
                        onSelect={(value, displayValue) => handleHotelLocationSelect(value, displayValue)}
                        placeholder="Where are you going?"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="checkIn" className="block text-sm font-medium text-gray-800 mb-1">
                          Check-in
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="date"
                            id="checkIn"
                            name="checkIn"
                            value={hotelSearch.checkIn}
                            onChange={handleHotelSearchChange}
                            className="w-full p-2 pl-10 border rounded-md text-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="checkOut" className="block text-sm font-medium text-gray-800 mb-1">
                          Check-out
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="date"
                            id="checkOut"
                            name="checkOut"
                            value={hotelSearch.checkOut}
                            onChange={handleHotelSearchChange}
                            min={hotelSearch.checkIn}
                            className="w-full p-2 pl-10 border rounded-md text-gray-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Search size={18} />
                        Search Hotels
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose FlyNext</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12 text-blue-500" />}
              title="Best Prices"
              description="We compare thousands of deals to offer you the best prices on flights and hotels."
            />
            <FeatureCard
              icon={<Award className="w-12 h-12 text-blue-500" />}
              title="Quality Service"
              description="Our dedicated customer support team is available 24/7 to assist you."
            />
            <FeatureCard
              icon={<Heart className="w-12 h-12 text-blue-500" />}
              title="Personalized Experience"
              description="Get recommendations based on your preferences and travel history."
            />
          </div>
        </div>
      </div>

      {/* Trending Destinations */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-white-900">Trending Destinations</h2>
            <Button variant="primary" className="flex items-center">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.city}
                city={destination.city}
                country={destination.country}
                price={destination.price}
                image={destination.image}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Featured Hotels */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Featured Hotels</h2>
            <Button variant="secondary" className="flex items-center">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredHotels.map((hotel) => (
              <HotelCard key={hotel.id} {...hotel} />
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Get Travel Deals & Updates</h2>
          <p className="max-w-2xl mx-auto mb-8 text-blue-100">
            Subscribe to our newsletter and never miss out on exclusive deals and travel tips.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex">
              <Input placeholder="Enter your email" className="rounded-r-none" type="email" />
              <Button variant="primary" className="rounded-l-none bg-blue-600 hover:bg-blue-700">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-white rounded-xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const DestinationCard = ({
  city,
  country,
  price,
  image,
}: {
  city: string;
  country: string;
  price: number;
  image: string;
}) => (
  <div className="relative group overflow-hidden rounded-xl h-80 shadow-lg hover:shadow-xl transition-shadow">
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
    <div className="relative h-full w-full transition-transform duration-700 group-hover:scale-110">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }}></div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
      <h3 className="text-2xl font-bold text-white mb-1">{city}</h3>
      <p className="text-sm text-gray-300 mb-3">{country}</p>
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xl font-bold text-white">${price}</span>
          <span className="text-white opacity-70 text-sm"> round trip</span>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
          Explore
        </button>
      </div>
    </div>
  </div>
);