"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LogOut, LayoutDashboard, Users, FileCheck, CheckCircle, IndianRupee } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.role === "Borrower") {
      router.push("/borrower");
    }
  }, [user, router]);

  if (!user || user.role === "Borrower") return null;

  const links = [
    { name: "Sales (Leads)", href: "/dashboard/sales", roles: ["Admin", "Sales"], icon: Users },
    { name: "Sanction", href: "/dashboard/sanction", roles: ["Admin", "Sanction"], icon: FileCheck },
    { name: "Disbursement", href: "/dashboard/disbursement", roles: ["Admin", "Disbursement"], icon: CheckCircle },
    { name: "Collection", href: "/dashboard/collection", roles: ["Admin", "Collection"], icon: IndianRupee },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6">
          <Link href="/dashboard" className="text-xl font-bold flex items-center gap-2 hover:text-gray-300">
            <LayoutDashboard className="w-6 h-6" />
            Operations
          </Link>
          <p className="text-sm text-gray-400 mt-1 capitalize">{user.role} Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.filter(link => link.roles.includes(user.role)).map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.name} href={link.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="mb-4 px-4 truncate">
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
