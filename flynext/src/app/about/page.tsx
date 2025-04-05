import React from 'react';
import Button from "@/app/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Redefining Travel</h1>
        <p className="text-gray-600 text-lg">Since 2024, making journeys unforgettable</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Our Story</h2>
          <p className="text-gray-600">
            Born from a passion for seamless travel experiences, FlyNext combines cutting-edge 
            technology with human-centric design to revolutionize how you explore the world.
          </p>
        </div>
        <img src="/team.jpg" alt="Our team" className="rounded-xl h-64 w-full object-cover" />
      </div>

      <div className="bg-primary-50 rounded-xl p-8 text-center mb-12">
        <h3 className="text-2xl font-bold mb-4">Join Our Journey</h3>
        <p className="text-gray-600 mb-6">
          We are hiring! Explore opportunities to shape the future of travel.
        </p>
        <a 
          href="https://ca.indeed.com/q-mcdonalds-clean-l-ontario-jobs.html?vjk=186f8ef03d77bc1e" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button variant="primary">View Careers</Button>
        </a>
      </div>

      {/* New section with YouTube video */}
      <div className="text-center mb-16">
        <h3 className="text-2xl font-bold mb-4">Till you wait to hear back...</h3>
        <p className="text-gray-600 mb-8 italic">
          Here's a meme in case you get rejected by us! 😉
        </p>
        <div className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden shadow-lg">
          <div className="relative pb-[56.25%] h-0">
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/OhdOerDQVwo" 
              title="Working at FlyNext" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Your sense of humor is just as important as your skills!
        </p>
      </div>
    </div>
  );
}