"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, GraduationCap, CheckCircle } from "lucide-react";

export default function Profile() {
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="w-full space-y-6">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl shrink-0">
          JD
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
          <p className="text-sm text-gray-600 mt-0.5">BSc Computer Science · Year 2, Semester 1</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">Student</span>
            <span className="text-xs text-gray-600 font-mono">ID: S2024001</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Personal info form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} className="text-blue-500" />
            <p className="font-semibold text-gray-900">Personal Information</p>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">First Name</label>
                <input defaultValue="John" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-300 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Last Name</label>
                <input defaultValue="Doe" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-300 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input defaultValue="john.doe@university.edu" className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:border-blue-300 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input defaultValue="+94 77 123 4567" className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:border-blue-300 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Address</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-3 text-gray-300" />
                <textarea defaultValue="42 Galle Road, Colombo 03" rows={2} className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none focus:border-blue-300 transition-colors resize-none" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Save Changes
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <CheckCircle size={14} /> Saved successfully
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Academic info */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex-1">
            <div className="flex items-center gap-2 mb-5">
              <GraduationCap size={16} className="text-blue-500" />
              <p className="font-semibold text-gray-900">Academic Information</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Programme", value: "BSc Computer Science" },
                { label: "Faculty", value: "Faculty of Computing" },
                { label: "Year / Semester", value: "Year 2 · Semester 1" },
                { label: "Enrolment Date", value: "September 2024" },
                { label: "Academic Advisor", value: "Dr. Anura Perera" },
                { label: "GPA", value: "3.72 / 4.00" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Change password */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="font-semibold text-gray-900 mb-4">Change Password</p>
            <div className="space-y-3">
              <input type="password" placeholder="Current password" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-300 transition-colors" />
              <input type="password" placeholder="New password" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-300 transition-colors" />
              <input type="password" placeholder="Confirm new password" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-300 transition-colors" />
              <button className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl py-2.5 text-sm font-medium transition-colors">Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
