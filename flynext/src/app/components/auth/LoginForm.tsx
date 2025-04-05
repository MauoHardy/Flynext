"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from '@/app/_utils/hooks';
import { useAuth } from '@/app/contexts/AuthContext';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const router = useRouter();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
  
  const { values, handleChange, handleBlur, errors, setErrors } = useForm({
    email: '',
    password: '',
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!values.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!values.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log("LoginForm: Submitting login form for email:", values.email);
      await login(values.email, values.password);
      setLoginSuccess(true);
      
      console.log("LoginForm: Login succeeded");
      
      // The redirect will be handled by useEffect when isAuthenticated changes
      
    } catch (err: unknown) {
      console.error("LoginForm: Login error details:", err);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err instanceof Error) {
        // Extract specific error message
        errorMessage = err.message;
        
        // Special handling for common errors
        if (errorMessage.includes('user data')) {
          errorMessage = 'Server error: Could not retrieve user data. Please try again later.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {loginSuccess && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative flex items-center"
            role="alert"
          >
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            <span className="block sm:inline">Login successful! Redirecting...</span>
          </div>
        )}
        
        <Input
          label="Email Address"
          type="email"
          name="email"
          id="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          fullWidth
          autoComplete="email"
          required
          leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
          className="rounded-lg"
          variant="light"
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          id="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          fullWidth
          autoComplete="current-password"
          required
          leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
          className="rounded-lg"
          variant="light"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isSubmitting}
          className="py-3 bg-blue-600 hover:bg-blue-700"
        >
          Sign In
        </Button>

        <div className="text-center">
          <Link href="/signup" className="text-blue-600 hover:text-blue-800 text-sm">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}
