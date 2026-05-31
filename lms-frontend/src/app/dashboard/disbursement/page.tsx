"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function DisbursementModule() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = () => {
    api.get("/dashboard/disbursement/loans").then(res => {
      setLoans(res.data.loans);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => fetchLoans(), []);

  const handleDisburse = async (id: string) => {
    try {
      await api.patch(`/dashboard/disbursement/loans/${id}`);
      fetchLoans(); // Refresh
    } catch (e) {
      alert("Failed to disburse loan");
    }
  };

  if (loading) return <div className="p-10 text-gray-500 animate-pulse">Loading sanctioned loans...</div>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Disbursement Queue</h1>
      <p className="text-gray-500 mb-8">Process payouts for approved loans.</p>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Borrower</th>
              <th className="px-6 py-4 font-medium">Payout Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loans.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No sanctioned loans pending disbursement.</td></tr>
            ) : loans.map((loan: any) => (
              <tr key={loan._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{loan.borrower?.fullName || "Unknown"}</div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  ₹{loan.amount?.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    {loan.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDisburse(loan._id)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
                    Mark as Disbursed
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
