import { useEffect, useRef, useState } from "react";
import { useChat } from "./hooks/useChat";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { SuggestedQuestions } from "./components/SuggestedQuestions";

// Icône drapeau CI stylisé
function CIFlag({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-xl overflow-hidden flex-shrink-0"
      style={{ width: size, height: size, boxShadow: "0 2px 8px #00000040" }}
    >
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flex: 1, background: "#E8630A" }} />
        <div style={{ flex: 1, background: "#FFFFFF" }} />
        <div style={{ flex: 1, background: "#009A44" }} />
      </div>
    </div>
  );
}

// Badge statut backend
function StatusBadge() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    const url = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";
    fetch(`${url}/health`)
      .then(r => setStatus(r.ok ? "online" : "offline"))
      .catch(() => setStatus("offline"));
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: "#8A96B0" }}>
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: status === "online" ? "#10B981" : status === "offline" ? "#EF4444" : "#F59E0B",
          boxShadow: status === "online" ? "0 0 6px #10B981" : "none",
        }}
      />
      {status === "online" ? "API connectée" : status === "offline" ? "API hors ligne" : "…"}
    </div>
  );
}

export default function App() {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#080C14" }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex-shrink-0 flex flex-col transition-all duration-300 border-r"
        style={{
          width: sidebarOpen ? "240px" : "56px",
          borderColor: "#1A2235",
          background: "#0A0F1B",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-4 border-b" style={{ borderColor: "#1A2235" }}>
          <CIFlag size={30} />
          {sidebarOpen && (
            <div>
              <p className="text-sm font-bold" style={{ color: "#EEF0F6" }}>eGov CI</p>
              <p className="text-xs" style={{ color: "#4A5568" }}>Fiscal · CNPS · DGI</p>
            </div>
          )}
        </div>

        {/* Nouvelle conversation */}
        <div className="px-2 py-3">
          <button
            onClick={clearMessages}
            className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors hover:bg-white/5"
            style={{ color: "#8A96B0" }}
            title="Nouvelle conversation"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {sidebarOpen && <span>Nouvelle conversation</span>}
          </button>
        </div>

        {/* Outils disponibles */}
        {sidebarOpen && (
          <div className="px-3 py-2 flex-1">
            <p className="text-xs font-semibold mb-3" style={{ color: "#2A3550", letterSpacing: "0.08em" }}>
              OUTILS MCP
            </p>
            {[
              { icon: "🧮", name: "TVA 18%",          color: "#E8630A" },
              { icon: "👥", name: "Cotisations CNPS",  color: "#009A44" },
              { icon: "📅", name: "Calendrier DGI",    color: "#8B5CF6" },
              { icon: "🔍", name: "Vérif. NIF",        color: "#3B82F6" },
              { icon: "📋", name: "Régimes fiscaux",   color: "#F59E0B" },
            ].map(t => (
              <div key={t.name} className="flex items-center gap-2 py-1.5">
                <span className="text-sm">{t.icon}</span>
                <span className="text-xs" style={{ color: "#4A5568" }}>{t.name}</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: t.color + "80" }} />
              </div>
            ))}
          </div>
        )}

        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mt-auto mx-2 mb-4 flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-white/5"
          style={{ color: "#2A3550" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
          </svg>
        </button>
      </aside>

      {/* ── Zone principale ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b"
          style={{ background: "#080C14", borderColor: "#1A2235" }}
        >
          <div>
            <h1 className="text-sm font-semibold" style={{ color: "#EEF0F6" }}>
              Assistant Fiscal CI
            </h1>
            <p className="text-xs" style={{ color: "#4A5568" }}>
              DGI · CNPS · Régimes fiscaux · Côte d'Ivoire
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge />
            {!isEmpty && (
              <button
                onClick={clearMessages}
                className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-white/5"
                style={{ color: "#4A5568", borderColor: "#1A2235" }}
              >
                Effacer
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto">
          {isEmpty ? (
            /* ─ Écran d'accueil ─ */
            <div className="h-full flex flex-col items-center justify-center px-4 py-12">
              {/* Visual CI */}
              <div className="relative mb-8">
                <div
                  className="w-20 h-20 rounded-3xl overflow-hidden"
                  style={{ boxShadow: "0 0 60px #E8630A20, 0 0 30px #009A4420" }}
                >
                  <div style={{ display: "flex", height: "100%" }}>
                    <div style={{ flex: 1, background: "linear-gradient(180deg, #E8630A, #FF7A20)" }} />
                    <div style={{ flex: 1, background: "#FFFFFF" }} />
                    <div style={{ flex: 1, background: "linear-gradient(180deg, #009A44, #00C85A)" }} />
                  </div>
                </div>
                {/* Halo subtil */}
                <div
                  className="absolute inset-0 rounded-3xl -z-10"
                  style={{
                    background: "radial-gradient(circle, #E8630A10 0%, transparent 70%)",
                    transform: "scale(1.8)",
                  }}
                />
              </div>

              <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: "#EEF0F6" }}>
                Bonjour, je suis votre assistant fiscal
              </h2>
              <p className="text-sm text-center max-w-md mb-2" style={{ color: "#8A96B0", lineHeight: 1.6 }}>
                Posez vos questions en français ou en anglais sur la fiscalité ivoirienne.
              </p>
              <p className="text-xs text-center mb-10" style={{ color: "#2A3550" }}>
                TVA · CNPS · Calendrier DGI · NIF · Régimes fiscaux
              </p>

              <SuggestedQuestions onSelect={sendMessage} />
            </div>
          ) : (
            /* ─ Conversation ─ */
            <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="animate-fade-up flex gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-1"
                    style={{ background: "linear-gradient(135deg, #009A44, #00C85A)" }}
                  >
                    🏛️
                  </div>
                  <div>
                    <p className="text-xs mb-1.5 px-1" style={{ color: "#009A44" }}>Assistant eGov CI</p>
                    <div
                      className="rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5"
                      style={{ background: "#0F1623", border: "1px solid #1A2235" }}
                    >
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </main>

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
