"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";

export default function BorrowerPortal() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [dob, setDob] = useState("");
  const [salary, setSalary] = useState<number | "">("");
  const [pan, setPan] = useState("");
  const [employmentMode, setEmploymentMode] = useState("Salaried");
  
  const [file, setFile] = useState<File | null>(null);
  
  const [amount, setAmount] = useState<number>(100000);
  const [tenure, setTenure] = useState<number>(365);

  const calculateInterest = () => {
    return (amount * 0.08 * tenure) / (365 * 100);
  };

  const handleNextStep1 = () => {
    setError("");
    
    if (Number(salary) < 25000) {
      setError("Monthly salary must be at least ₹25,000.");
      return;
    }
    
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    if (age < 23 || age > 50) {
      setError("Age must be between 23 and 50 years.");
      return;
    }
    
    setStep(2);
  };

  const handleApply = async () => {
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("dateOfBirth", dob);
      formData.append("monthlySalary", String(salary));
      formData.append("pan", pan);
      formData.append("employmentMode", employmentMode);
      formData.append("amount", String(amount));
      formData.append("tenure", String(tenure));
      if (file) {
        formData.append("salarySlip", file);
      }

      await api.post("/borrower/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStep(4); // Success step
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors && data.errors.length > 0) {
        setError(data.errors.join(" | "));
      } else {
        setError(data?.message || "Failed to apply");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 px-8 py-6 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Loan Application</h1>
              <p className="text-gray-400 mt-1 text-sm">Hello, {user?.fullName}</p>
            </div>
            {step < 4 && (
              <div className="flex space-x-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`w-3 h-3 rounded-full ${step >= s ? 'bg-blue-500' : 'bg-gray-700'}`} />
                ))}
              </div>
            )}
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (₹)</label>
                    <input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="50000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                    <input type="text" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white" placeholder="ABCDE1234F" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment</label>
                    <select value={employmentMode} onChange={(e) => setEmploymentMode(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white">
                      <option value="Salaried">Salaried</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Unemployed">Unemployed</option>
                    </select>
                  </div>
                </div>
                
                <button onClick={handleNextStep1} disabled={!dob || !salary || !pan} className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition">Next Step</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Document Upload</h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Upload your latest Salary Slip</p>
                  <p className="text-xs text-gray-400 mb-4">PDF, JPG or PNG up to 5MB</p>
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="w-1/3 bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 transition">Back</button>
                  <button onClick={() => setStep(3)} disabled={!file} className="w-2/3 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition">Next Step</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-gray-900">Loan Configuration</h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-medium text-gray-700">Loan Amount</label>
                      <span className="text-blue-600 font-bold">₹{amount.toLocaleString()}</span>
                    </div>
                    <input type="range" min="50000" max="500000" step="10000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="font-medium text-gray-700">Tenure (Days)</label>
                      <span className="text-blue-600 font-bold">{tenure} Days</span>
                    </div>
                    <input type="range" min="30" max="365" step="1" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900" />
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-4">Repayment Summary</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-700">Principal Amount</span>
                    <span className="font-medium text-blue-900">₹{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-blue-700">Estimated Interest (8%)</span>
                    <span className="font-medium text-blue-900">₹{calculateInterest().toFixed(0)}</span>
                  </div>
                  <div className="pt-4 border-t border-blue-200 flex justify-between items-center">
                    <span className="font-bold text-blue-900">Total Repayment</span>
                    <span className="font-bold text-xl text-blue-900">₹{(amount + calculateInterest()).toFixed(0)}</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="w-1/3 bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 transition">Back</button>
                  <button onClick={handleApply} disabled={loading} className="w-2/3 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center transition">
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Submit Application"}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center py-12">
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Your loan application is now pending review. Our sanctioning team will process it shortly.</p>
                <button onClick={() => window.location.reload()} className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition">
                  Apply for another
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
