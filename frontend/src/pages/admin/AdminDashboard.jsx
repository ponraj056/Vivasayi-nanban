import { useState } from "react";
import AdminOverview from "./AdminOverview";
import AdminUsers from "./AdminUsers";
import AdminWhatsApp from "./AdminWhatsApp";
import AdminBookings from "./AdminBookings";

const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬" },
  { id: "bookings", label: "Bookings", icon: "🚜" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen flex bg-[#F7F5EF]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-[#1F3A2E] text-[#F7F5EF] flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-tight">Vivasayi Nanban</h1>
          <p className="text-xs text-[#9FB8A8] mt-1">Admin Console</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#D97706]/90 text-white"
                  : "text-[#C9D8CE] hover:bg-white/5"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {activeTab === "overview" && <AdminOverview />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "whatsapp" && <AdminWhatsApp />}
          {activeTab === "bookings" && <AdminBookings />}
        </div>
      </main>
    </div>
  );
}