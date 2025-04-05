"use client";
import React, { useState, FormEvent, useEffect } from "react";
import { useForm } from "@/app/_utils/hooks";
import { useAuth } from "@/app/contexts/AuthContext";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Link from "next/link";
import { User, Mail, Lock, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SignupFormProps {
  onSuccess?: () => void;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const { signup, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const { values, handleChange, handleBlur, errors, setErrors } = useForm<FormValues>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const validate = () => {
    const newErrors: Partial<Record<keyof FormValues, string>> = {};

    if (!values.firstName) newErrors.firstName = "First name is required";
    if (!values.lastName) newErrors.lastName = "Last name is required";

    if (!values.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!values.password) {
      newErrors.password = "Password is required";
    } else if (values.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (values.password !== values.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (values.phoneNumber && !/^\+?[0-9]{10,15}$/.test(values.phoneNumber)) {
      newErrors.phoneNumber = "Phone number is invalid";
    }

    setErrors(newErrors as Record<string, string>);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError("");

    try {
      await signup({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber || undefined,
      });
      
      setSignupSuccess(true);
      // The redirect will be handled by useEffect when isAuthenticated changes
      
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
      
      {signupSuccess && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative flex items-center"
          role="alert"
        >
          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
          <span className="block sm:inline">Account created successfully! Logging you in...</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="w-full">
          <Input
            label="First Name"
            type="text"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.firstName}
            required
            leftIcon={<User className="w-5 h-5 text-gray-400" />}
            className="rounded-lg"
            variant="light"
            fullWidth
          />
        </div>

        {/* Last Name */}
        <div className="w-full">
          <Input
            label="Last Name"
            type="text"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.lastName}
            required
            leftIcon={<User className="w-5 h-5 text-gray-400" />}
            className="rounded-lg"
            variant="light"
            fullWidth
          />
        </div>
      </div>

      {/* Email */}
      <Input
        label="Email Address"
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.email}
        required
        leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
        className="rounded-lg"
        variant="light"
        fullWidth
      />

      {/* Password */}
      <Input
        label="Password"
        type="password"
        name="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.password}
        required
        leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
        className="rounded-lg"
        variant="light"
        fullWidth
      />

      {/* Confirm Password */}
      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={values.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.confirmPassword}
        required
        leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
        className="rounded-lg"
        variant="light"
        fullWidth
      />

      {/* Phone Number */}
      <Input
        label="Phone Number (Optional)"
        type="tel"
        name="phoneNumber"
        value={values.phoneNumber}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.phoneNumber}
        leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
        className="rounded-lg"
        variant="light"
        fullWidth
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        className="py-3 bg-blue-600 hover:bg-blue-700"
      >
        Sign Up
      </Button>

      <div className="text-center">
        <Link href="/login" className="text-blue-600 hover:text-blue-800 text-sm">
          Already have an account? Sign in
        </Link>
      </div>
    </form>
  );
}