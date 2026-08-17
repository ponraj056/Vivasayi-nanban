import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { Link } from "react-router-dom";
import api from "../../api/axiosClient";
import { CloudRain, IndianRupee, Sprout, TrendingUp, Camera, AlertCircle, ShoppingCart, Tractor } from "lucide-react";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  
  const [cropPrices, setCropPrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    fetchPrices();
  }, [lang]);

  const fetchPrices = async () => {
    try {
      setLoadingPrices(true);
      const res = await api.get(`/prices?lang=${lang}`);
      if (res.data.success) {
        setCropPrices(res.data.prices);
      }
    } catch (err) {
      console.error("Failed to fetch prices:", err);
    } finally {
      setLoadingPrices(false);
    }
  };

  const topPrice = cropPrices.length > 0 ? cropPrices[0] : { crop: t("loading"), price: "₹0" };

  const stats = [
    { label: "Today's Weather", value: "32°C", subtext: "Clear Sky", icon: <CloudRain className="text-orange-500" size={24} />, bg: "bg-orange-50" },
    { label: topPrice.crop, value: topPrice.price, subtext: "Per Quintal", icon: <IndianRupee className="text-blue-500" size={24} />, bg: "bg-blue-50" },
    { label: "Active Crops", value: user.farmerProfile?.crops?.length || 0, subtext: "In your farm", icon: <Sprout className="text-green-500" size={24} />, bg: "bg-green-50" },
    { label: "Est. Profit", value: "₹0", subtext: "This season", icon: <TrendingUp className="text-purple-500" size={24} />, bg: "bg-purple-50" },
  ];

  const actions = [
    { label: t("diseaseDetection"), icon: <Camera size={22} className="text-red-600" />, path: "/dashboard/farmer/disease-check", bg: "bg-red-50", border: "border-red-100" },
    { label: t("marketplace"), icon: <ShoppingCart size={22} className="text-emerald-600" />, path: "/dashboard/farmer/marketplace", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: t("machineryRental"), icon: <Tractor size={22} className="text-orange-600" />, path: "/dashboard/farmer/rent-machine", bg: "bg-orange-50", border: "border-orange-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t("welcome")}, {user.name}! 🌾</h1>
          <p className="text-gray-500 text-sm mt-1">Here is what's happening on your farm today.</p>
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

      <div className="bg-green-50 rounded-xl p-5 border border-green-100 flex items-start gap-4">
        <AlertCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-semibold text-green-800">Daily Advisory</h3>
          <p className="text-green-700 text-sm mt-1">
            இன்று மழை வாய்ப்பு உள்ளது — pesticide spray வேண்டாம். {topPrice.crop} rate {topPrice.price} — விற்பதற்கு நல்ல நேரம்.
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
