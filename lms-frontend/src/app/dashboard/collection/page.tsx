"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function CollectionModule() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states per loan
  const [utrInput, setUtrInput] = useState<Record<string, string>>({});
  const [amountInput, setAmountInput] = useState<Record<string, string>>({});

  const fetchLoans = () => {
    api.get("/dashboard/collection/loans").then(res => {
      setLoans(res.data.loans);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => fetchLoans(), []);

  const handleRecordPayment = async (id: string) => {
    const utrNumber = utrInput[id];
    const amount = Number(amountInput[id]);
    
    if (!utrNumber || !amount || amount <= 0) {
      alert("Please enter a valid UTR and Amount");
      return;
    }

    try {
      await api.post(`/dashboard/collection/loans/${id}/payment`, {
        utrNumber,
        amount
      });
      // Clear inputs
      setUtrInput(prev => ({...prev, [id]: ""}));
      setAmountInput(prev => ({...prev, [id]: ""}));
      alert("Payment recorded successfully!");
      fetchLoans(); // Refresh list to update outstanding balance
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to record payment");
    }
  };

  if (loading) return <div className="p-10 text-gray-500 animate-pulse">Loading active loans...</div>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Collections</h1>
      <p className="text-gray-500 mb-8">Record incoming repayments for disbursed active loans.</p>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
            No active loans require collection right now.
          </div>
        ) : loans.map((loan: any) => {
          const outstanding = loan.totalRepayment - (loan.amountPaid || 0);
          
          return (
            <div key={loan._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{loan.borrower?.fullName || "Unknown"}</h3>
                    <p className="text-sm text-gray-500">Loan ID: {loan._id.slice(-6)}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    Active
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Due</p>
                    <p className="font-bold text-gray-900">₹{loan.totalRepayment?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Outstanding</p>
                    <p className="font-bold text-blue-600">₹{outstanding.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 mt-auto">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Record Payment</h4>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="UTR Number" 
                    value={utrInput[loan._id] || ""}
                    onChange={(e) => setUtrInput({...utrInput, [loan._id]: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-md text-sm outline-none focus:border-blue-500 text-gray-900 bg-white" 
                  />
                  <input 
                    type="number" 
                    placeholder="₹ Amount" 
                    value={amountInput[loan._id] || ""}
                    onChange={(e) => setAmountInput({...amountInput, [loan._id]: e.target.value})}
                    className="w-28 px-3 py-2 border rounded-md text-sm outline-none focus:border-blue-500 text-gray-900 bg-white" 
                  />
                  <button onClick={() => handleRecordPayment(loan._id)} className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap">
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
