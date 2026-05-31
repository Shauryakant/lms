"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardHome() {
  const { user } = useAuth();
  
  return (
    <div className="p-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-2xl mx-auto mt-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to the LMS Dashboard</h1>
        <p className="text-gray-500 mb-6 text-lg">
          You are logged in as <span className="font-bold text-blue-600 capitalize">{user?.role}</span>.
        </p>
        <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-6">
          <span className="text-4xl">👋</span>
        </div>
        <p className="text-gray-600">
          Select a module from the sidebar on the left to begin managing loan applications and operations.
        </p>
      </div>
    </div>
  );
}
