import { useEffect, useState } from "react";
import api from "../../api/axiosClient";

const ROLE_LABELS = {
  farmer: "🌾 Farmer",
  dealer: "🏪 Dealer",
  machineOwner: "🚜 Machine Owner",
  admin: "🛡️ Admin",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    api
      .get("/admin/users", { params: { role: role || undefined, search: search || undefined } })
      .then((res) => setUsers(res.data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300); // debounce search
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, search]);

  const toggleStatus = async (user) => {
    const updated = await api.patch(`/admin/users/${user._id}/status`, {
      isActive: !user.isActive,
    });
    setUsers((prev) =>
      prev.map((u) => (u._id === user._id ? updated.data.user : u))
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1F3A2E] mb-1">Users</h2>
      <p className="text-sm text-[#8A8371] mb-6">
        Manage farmers, dealers, and machine owners.
      </p>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-[#E5E0D4] text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]/40"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#E5E0D4] text-sm"
        >
          <option value="">All roles</option>
          <option value="farmer">Farmer</option>
          <option value="dealer">Dealer</option>
          <option value="machineOwner">Machine Owner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E0D4] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F5EF] text-[#8A8371] text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Phone</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#8A8371]">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#8A8371]">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-t border-[#E5E0D4]">
                  <td className="px-4 py-3 font-medium text-[#1F3A2E]">{u.name}</td>
                  <td className="px-4 py-3">{ROLE_LABELS[u.role] || u.role}</td>
                  <td className="px-4 py-3">{u.phone}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.isActive !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.isActive !== false ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleStatus(u)}
                      className="text-xs font-medium text-[#D97706] hover:underline"
                    >
                      {u.isActive !== false ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}