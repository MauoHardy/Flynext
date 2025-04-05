"use client";
import React from "react";
import LoginForm from "@/app/components/auth/LoginForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-blue-800 text-center mb-6">
          Sign In
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
