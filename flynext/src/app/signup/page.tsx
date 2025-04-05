"use client";
import React from "react";
import SignupForm from "@/app/components/auth/SignupForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 sm:p-10">
        <h1 className="text-3xl font-bold text-blue-800 text-center mb-8">
          Create an Account
        </h1>
        <SignupForm />
      </div>
    </div>
  );
}
