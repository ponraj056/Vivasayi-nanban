import { useState, useEffect } from "react";
import api from "../../api/axiosClient";
import { Ticket, User, MessageCircle, CheckCircle, Clock } from "lucide-react";

export default function OfficerTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/tickets");
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const res = await api.patch(`/tickets/${selectedTicket._id}`, { replyText });
      if (res.data.success) {
        setSelectedTicket(res.data.ticket);
        fetchTickets();
        setReplyText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async () => {
    try {
      const res = await api.patch(`/tickets/${selectedTicket._id}`, { status: "resolved" });
      if (res.data.success) {
        setSelectedTicket(res.data.ticket);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Support Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and resolve queries from farmers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[600px] flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700">Tickets</div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {loading ? (
              <p className="p-4 text-center text-gray-500">Loading...</p>
            ) : tickets.length === 0 ? (
              <p className="p-4 text-center text-gray-500">No tickets found.</p>
            ) : (
              tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-lg cursor-pointer border transition ${
                    selectedTicket?._id === t._id ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900 truncate flex-1">{t.farmerId?.name || "Farmer"}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.status === "resolved" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {t.messages[0]?.text || "No messages"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Details & Chat */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full"><User size={20} className="text-blue-600" /></div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedTicket.farmerId?.name}</h3>
                    <p className="text-xs text-gray-500">{selectedTicket.farmerId?.phone}</p>
                  </div>
                </div>
                {selectedTicket.status !== "resolved" && (
                  <button onClick={handleResolve} className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium flex items-center gap-1 transition">
                    <CheckCircle size={16} /> Mark Resolved
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {selectedTicket.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === "agri_officer" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl ${m.sender === "agri_officer" ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"}`}>
                      <p className="text-sm">{m.text}</p>
                      <p className={`text-[10px] mt-1 text-right ${m.sender === "agri_officer" ? "text-blue-200" : "text-gray-400"}`}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== "resolved" && (
                <form onSubmit={handleReply} className="p-4 border-t border-gray-100 bg-white flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                    Send
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageCircle size={48} className="mb-4 text-gray-300" />
              <p>Select a ticket from the list to view and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
