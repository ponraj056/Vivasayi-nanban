import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Users, Store, Tractor, ShieldAlert, CheckCircle, Settings, MapPin } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    { label: "Total Farmers", value: "0", subtext: "Registered", icon: <Users className="text-green-500" size={24} />, bg: "bg-green-50" },
    { label: "Agri Agencies", value: "0", subtext: "Verified & Pending", icon: <Store className="text-blue-500" size={24} />, bg: "bg-blue-50" },
    { label: "Machine Owners", value: "0", subtext: "Verified & Pending", icon: <Tractor className="text-orange-500" size={24} />, bg: "bg-orange-50" },
    { label: "Pending Verifications", value: "0", subtext: "Requires review", icon: <ShieldAlert className="text-red-500" size={24} />, bg: "bg-red-50" },
  ];

  const actions = [
    { label: "User Control Panel", icon: <Settings size={22} className="text-purple-600" />, path: "/admin-panel", bg: "bg-purple-50", border: "border-purple-100" },
    { label: "Verify Agencies", icon: <CheckCircle size={22} className="text-blue-600" />, path: "/dashboard/admin/verify", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Verify Machines", icon: <CheckCircle size={22} className="text-orange-600" />, path: "/dashboard/admin/verify", bg: "bg-orange-50", border: "border-orange-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">வணக்கம், {user.name}! 🛡️</h1>
          <p className="text-gray-500 text-sm mt-1">Admin Dashboard — Platform Overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>{stat.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">{stat.subtext}</p>
          </div>
        ))}
      </div>

      <div className="bg-purple-50 rounded-xl p-5 border border-purple-100 flex items-start gap-4">
        <MapPin className="text-purple-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-purple-800">Village Analytics</h3>
          <p className="text-purple-700 text-sm mt-1">
            Platform new — users join ஆனதும் village-level analytics காட்டும்.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {actions.map((action, i) => (
            <Link
              key={i}
              to={action.path}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border ${action.border} ${action.bg} hover:shadow-md transition-all group`}
            >
              <div className="mb-3 transform group-hover:scale-110 transition-transform">{action.icon}</div>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
