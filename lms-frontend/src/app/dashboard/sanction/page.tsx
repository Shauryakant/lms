"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function SanctionModule() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = () => {
    api.get("/dashboard/sanction/loans").then(res => {
      setLoans(res.data.loans);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => fetchLoans(), []);

  const handleAction = async (id: string, status: "sanctioned" | "rejected") => {
    try {
      await api.patch(`/dashboard/sanction/loans/${id}`, { status });
      fetchLoans(); // Refresh
    } catch (e) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="p-10 text-gray-500 animate-pulse">Loading applied loans...</div>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sanction Queue</h1>
      <p className="text-gray-500 mb-8">Review and approve or reject pending loan applications.</p>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Borrower</th>
              <th className="px-6 py-4 font-medium">Amount & Tenure</th>
              <th className="px-6 py-4 font-medium">Total Repayment</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loans.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No pending loans found.</td></tr>
            ) : loans.map((loan: any) => (
              <tr key={loan._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{loan.borrower?.fullName || "Unknown"}</div>
                  <div className="text-xs text-gray-500 mt-1">PAN: {loan.borrower?.pan || "N/A"}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">₹{loan.amount?.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{loan.tenure} Days</div>
                </td>
                <td className="px-6 py-4 font-bold text-blue-600">
                  ₹{loan.totalRepayment?.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => handleAction(loan._id, "sanctioned")} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                    Approve
                  </button>
                  <button onClick={() => handleAction(loan._id, "rejected")} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition">
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
