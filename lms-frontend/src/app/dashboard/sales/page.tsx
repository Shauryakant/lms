"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function SalesModule() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/sales/leads").then(res => {
      setLeads(res.data.leads || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 animate-pulse text-gray-500">Loading leads...</div>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sales Leads</h1>
      <p className="text-gray-500 mb-8">View registered users who haven't submitted a loan application yet.</p>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Full Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Registration Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No leads available at the moment.</td></tr>
            ) : leads.map((lead: any) => (
              <tr key={lead._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-900">{lead.fullName}</td>
                <td className="px-6 py-4 text-gray-600">{lead.email}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(lead.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
