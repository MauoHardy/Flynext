"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import { User, Mail, Phone, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '@/app/_utils/fetchWithAuth';

export default function EditProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    profilePicture: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const response = await fetchWithAuth('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      
      // Wait a bit before redirecting
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Placeholder image from Unsplash
  const profileImage = formData.profilePicture || `https://source.unsplash.com/random/400x400/?person,portrait&seed=${user?.id}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="rounded-full bg-gray-200 h-24 w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-blue-100 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <Button 
              variant="tertiary" 
              onClick={() => router.push('/profile')}
            >
              <span className="mr-2">←</span>
              Back to Profile
            </Button>
          </div>
          
          {message && (
            <div
              className={`${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              } px-4 py-3 rounded-lg relative flex items-center mb-6`}
              role="alert"
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              <span className="block sm:inline">{message.text}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-sm"
                />
                <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-md cursor-pointer">
                  <Camera size={18} />
                </div>
              </div>
              <Input
                type="text"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="Enter image URL"
                className="mt-4 max-w-xs"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter a URL for your profile picture, or leave blank for a default image
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <Input
                label="First Name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
                required
                fullWidth
              />
              
              {/* Last Name */}
              <Input
                label="Last Name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
                required
                fullWidth
              />
            </div>
            
            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              required
              fullWidth
            />
            
            {/* Phone Number */}
            <Input
              label="Phone Number (Optional)"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
              fullWidth
            />
            
            {/* Submit Button */}
            <div className="flex justify-end mt-8">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="min-w-[120px] bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}