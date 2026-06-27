"use client";

import { useState } from "react";
import { CreditCard, X } from "lucide-react";

const initialFees = [
  { id: 1, description: "Tuition Fee — Semester 1", amount: 85000, due: "Jul 1, 2026", status: "Unpaid" },
  { id: 2, description: "Library & Resource Fee", amount: 3500, due: "Jul 1, 2026", status: "Unpaid" },
  { id: 3, description: "Student Activity Fee", amount: 2000, due: "Jul 1, 2026", status: "Unpaid" },
  { id: 4, description: "Tuition Fee — Semester 2 (2024/25)", amount: 85000, due: "Jan 15, 2026", status: "Paid" },
  { id: 5, description: "Examination Fee — Semester 2 (2024/25)", amount: 5000, due: "Dec 10, 2025", status: "Paid" },
];

type Fee = typeof initialFees[0];

export default function FeePayment() {
  const [fees, setFees] = useState(initialFees);
  const [payingFee, setPayingFee] = useState<Fee | null>(null);
  const [method, setMethod] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function handlePay() {
    if (!payingFee) return;
    setFees((p) => p.map((f) => f.id === payingFee.id ? { ...f, status: "Paid" } : f));
    showToast("Payment successful");
    setPayingFee(null); setMethod("");
  }

  const unpaidTotal = fees.filter((f) => f.status === "Unpaid").reduce((s, f) => s + f.amount, 0);
  const paidTotal = fees.filter((f) => f.status === "Paid").reduce((s, f) => s + f.amount, 0);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Outstanding Balance", value: `LKR ${unpaidTotal.toLocaleString()}`, urgent: unpaidTotal > 0 },
          { label: "Total Paid (This Year)", value: `LKR ${paidTotal.toLocaleString()}`, urgent: false },
          { label: "Unpaid Items", value: fees.filter((f) => f.status === "Unpaid").length.toString(), urgent: false },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.urgent ? "bg-red-50" : "bg-green-50"}`}>
              <CreditCard size={18} className={s.urgent ? "text-red-500" : "text-green-600"} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <p className="font-semibold text-gray-900">Fee Statement</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Amount (LKR)</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Due Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{f.description}</td>
                <td className="px-6 py-4 font-mono font-semibold text-gray-900">{f.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-600">{f.due}</td>
                <td className="px-6 py-4">
                  {f.status === "Paid"
                    ? <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 font-medium">Paid</span>
                    : <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 font-medium">Unpaid</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  {f.status === "Unpaid" && (
                    <button onClick={() => setPayingFee(f)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">Pay Now</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payingFee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-200 relative">
            <button onClick={() => setPayingFee(null)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100">
              <X size={16} className="text-gray-600" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Make Payment</h2>
            <p className="text-sm text-gray-600 mb-5">{payingFee.description}</p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 flex justify-between items-center">
              <span className="text-sm text-blue-600 font-medium">Amount Due</span>
              <span className="text-2xl font-bold text-blue-700">LKR {payingFee.amount.toLocaleString()}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Credit / Debit Card", "Bank Transfer", "Online Banking"].map((m) => (
                    <button key={m} onClick={() => setMethod(m)} className={`text-xs px-3 py-2.5 rounded-xl border transition-all text-center ${method === m ? "border-blue-500 bg-blue-50 text-blue-700 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {method === "Credit / Debit Card" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Number</label>
                    <input placeholder="1234 5678 9012 3456" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry</label>
                      <input placeholder="MM / YY" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">CVV</label>
                      <input placeholder="•••" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-300" />
                    </div>
                  </div>
                </div>
              )}

              {method === "Bank Transfer" && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                  <div className="flex justify-between"><span className="text-gray-600">Bank</span><span className="font-medium">People's Bank</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Account No.</span><span className="font-mono font-medium">123-4567-8901</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Reference</span><span className="font-mono font-medium text-blue-600">S2024001</span></div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handlePay} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">Confirm Payment</button>
              <button onClick={() => setPayingFee(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl border border-gray-700 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
