import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Loan Management System</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          A premium platform to apply for loans and manage disbursements seamlessly.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/login" className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-gray-800 transition">
            Sign In <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/register" className="bg-white text-gray-900 px-8 py-3 rounded-full font-medium border border-gray-200 hover:border-gray-300 transition">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
