import { useEffect, useState } from "react";
import api from "../../api/axiosClient";

export default function AdminWhatsApp() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  useEffect(() => {
    api.get("/admin/whatsapp/sessions").then((res) => setSessions(res.data.sessions));
  }, []);

  const openSession = (session) => {
    setSelected(session);
    setLoadingMsgs(true);
    api
      .get(`/admin/whatsapp/messages/${session.phoneNumber}`)
      .then((res) => setMessages(res.data.messages))
      .finally(() => setLoadingMsgs(false));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1F3A2E] mb-1">WhatsApp Monitor</h2>
      <p className="text-sm text-[#8A8371] mb-6">
        Active conversations and full message history.
      </p>

      <div className="grid grid-cols-3 gap-4 h-[65vh]">
        {/* Session list */}
        <div className="bg-white rounded-xl border border-[#E5E0D4] overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="text-center text-[#8A8371] text-sm py-6">No sessions yet.</p>
          ) : (
            sessions.map((s) => (
              <button
                key={s._id}
                onClick={() => openSession(s)}
                className={`w-full text-left px-4 py-3 border-b border-[#F0EDE3] hover:bg-[#F7F5EF] ${
                  selected?._id === s._id ? "bg-[#F7F5EF]" : ""
                }`}
              >
                <p className="text-sm font-medium text-[#1F3A2E]">
                  {s.user?.name || s.phoneNumber}
                </p>
                <p className="text-xs text-[#8A8371]">
                  {s.currentFlow} · {new Date(s.lastMessageAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Message thread */}
        <div className="col-span-2 bg-white rounded-xl border border-[#E5E0D4] flex flex-col">
          {!selected ? (
            <p className="m-auto text-sm text-[#8A8371]">
              Select a conversation to view messages.
            </p>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-[#E5E0D4]">
                <p className="text-sm font-semibold text-[#1F3A2E]">
                  {selected.phoneNumber}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {loadingMsgs ? (
                  <p className="text-sm text-[#8A8371]">Loading...</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m._id}
                      className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                        m.direction === "INBOUND"
                          ? "bg-[#F0EDE3] text-[#1F3A2E]"
                          : "bg-[#D97706]/10 text-[#1F3A2E] ml-auto"
                      }`}
                    >
                      {m.content || `[${m.messageType}]`}
                      <div className="text-[10px] text-[#8A8371] mt-1">
                        {new Date(m.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}