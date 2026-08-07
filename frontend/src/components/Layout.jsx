import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  Home,
  LogOut,
  User as UserIcon,
  ShoppingBag,
  Sprout,
  Tractor,
  ClipboardList,
  AlertTriangle,
  Users,
  CheckCircle,
  Stethoscope
} from "lucide-react";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <>{children}</>;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getLinksForRole = (role) => {
    switch (role) {
      case "farmer":
        return [
          { name: "Dashboard", path: "/dashboard/farmer", icon: <Home size={20} /> },
          { name: "My Crops", path: "/dashboard/farmer/crops", icon: <Sprout size={20} /> },
          { name: "Marketplace", path: "/dashboard/farmer/marketplace", icon: <ShoppingBag size={20} /> },
          { name: "Disease Check", path: "/dashboard/farmer/disease-check", icon: <Stethoscope size={20} /> },
          { name: "Rent Machine", path: "/dashboard/farmer/rent-machine", icon: <Tractor size={20} /> },
        ];
      case "agri_agency":
        return [
          { name: "Dashboard", path: "/dashboard/agri_agency", icon: <Home size={20} /> },
          { name: "My Products", path: "/dashboard/agri_agency/products", icon: <ShoppingBag size={20} /> },
          { name: "Orders", path: "/dashboard/agri_agency/orders", icon: <ClipboardList size={20} /> },
        ];
      case "machine_owner":
        return [
          { name: "Dashboard", path: "/dashboard/machine_owner", icon: <Home size={20} /> },
          { name: "My Machines", path: "/dashboard/machine_owner/machines", icon: <Tractor size={20} /> },
          { name: "Bookings", path: "/dashboard/machine_owner/bookings", icon: <ClipboardList size={20} /> },
        ];
      case "agri_officer":
        return [
          { name: "Dashboard", path: "/dashboard/agri_officer", icon: <Home size={20} /> },
          { name: "Tickets", path: "/dashboard/agri_officer/tickets", icon: <AlertTriangle size={20} /> },
          { name: "Broadcasts", path: "/dashboard/agri_officer/broadcasts", icon: <LogOut size={20} /> },
        ];
      case "admin":
        return [
          { name: "Dashboard", path: "/dashboard/admin", icon: <Home size={20} /> },
          { name: "Users", path: "/admin-panel", icon: <Users size={20} /> },
          { name: "Verifications", path: "/dashboard/admin/verify", icon: <CheckCircle size={20} /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getLinksForRole(user.role);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 bg-green-50/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="text-lg font-bold text-green-800 tracking-tight">Vivasayi Nanban</span>
          </div>
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-green-50 text-green-700 font-medium shadow-sm border border-green-100/50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className={`${isActive ? "text-green-600" : "text-gray-400"}`}>{link.icon}</span>
                  <span className="text-sm">{link.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} className="text-gray-400 group-hover:text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200 z-10">
          <button
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 flex justify-end items-center gap-4">
            <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full uppercase tracking-wider">
              {user.role.replace("_", " ")}
            </span>
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                <UserIcon size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
