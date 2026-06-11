import { useEffect, useRef, useState } from "react";
import {
  Building2, Plus, ChevronLeft, ChevronRight,
  Calculator, Calendar, Users, Search, FileText, Briefcase,
  Wifi, WifiOff, Loader2, Trash2
} from "lucide-react";
import { useChat } from "./hooks/useChat";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { SuggestedQuestions } from "./components/SuggestedQuestions";

function CIBadge({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: 7,
        overflow: "hidden",
        display: "flex",
        flexShrink: 0,
        boxShadow: "0 1px 6px #00000060",
      }}
    >
      <div style={{ flex: 1, background: "#D9580A" }} />
      <div style={{ flex: 1, background: "#F5F5F0" }} />
      <div style={{ flex: 1, background: "#0A8A3C" }} />
    </div>
  );
}

function StatusBadge() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    const url = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";
    fetch(`${url}/health`)
      .then(r => setStatus(r.ok ? "online" : "offline"))
      .catch(() => setStatus("offline"));
  }, []);

  if (status === "checking") return null;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{
        background: status === "online" ? "#0A8A3C12" : "#DC262612",
        border: `1px solid ${status === "online" ? "#0A8A3C30" : "#DC262630"}`,
      }}
    >
      {status === "online"
        ? <Wifi size={11} style={{ color: "#0A8A3C" }} />
        : <WifiOff size={11} style={{ color: "#DC2626" }} />
      }
      <span className="text-xs font-medium" style={{ color: status === "online" ? "#0A8A3C" : "#DC2626" }}>
        {status === "online" ? "API connectée" : "Hors ligne"}
      </span>
    </div>
  );
}

const TOOLS = [
  { Icon: Calculator, label: "TVA 18 %",           color: "#D9580A" },
  { Icon: Users,      label: "Cotisations CNPS",    color: "#0A8A3C" },
  { Icon: Calendar,   label: "Calendrier DGI",      color: "#7C3AED" },
  { Icon: Search,     label: "Vérification NIF",    color: "#2563EB" },
  { Icon: FileText,   label: "Régimes fiscaux",     color: "#D97706" },
];

export default function App() {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(true);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-bg)" }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex-shrink-0 flex flex-col transition-all duration-200"
        style={{
          width: collapsed ? 52 : 220,
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        {/* Logo row */}
        <div
          className="flex items-center gap-2.5 px-3 py-3.5"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <CIBadge size={26} />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight" style={{ color: "var(--color-txt-1)" }}>
                eGov CI
              </p>
              <p className="text-xs leading-tight" style={{ color: "var(--color-txt-3)" }}>
                Plateforme fiscale
              </p>
            </div>
          )}
        </div>

        {/* New chat */}
        <div className="px-2 pt-2">
          <button
            onClick={clearMessages}
            title="Nouvelle conversation"
            className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors"
            style={{ color: "var(--color-txt-2)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-3)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Plus size={15} strokeWidth={2} />
            {!collapsed && <span className="text-xs">Nouvelle conversation</span>}
          </button>
        </div>

        {/* Tools list */}
        <div className="flex-1 px-2 pt-4">
          {!collapsed && (
            <p
              className="text-xs font-semibold mb-2 px-2"
              style={{ color: "var(--color-txt-3)", letterSpacing: "0.07em" }}
            >
              OUTILS MCP
            </p>
          )}
          {TOOLS.map(({ Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5"
              title={label}
            >
              <Icon size={14} style={{ color, flexShrink: 0 }} strokeWidth={1.8} />
              {!collapsed && (
                <span className="text-xs truncate" style={{ color: "var(--color-txt-2)" }}>
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-2 mb-3 flex items-center justify-center rounded-lg p-2 transition-colors"
          style={{ color: "var(--color-txt-3)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-3)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {collapsed
            ? <ChevronRight size={14} strokeWidth={2} />
            : <ChevronLeft size={14} strokeWidth={2} />
          }
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-5 py-3"
          style={{
            background: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <Building2 size={16} style={{ color: "var(--color-txt-3)" }} strokeWidth={1.8} />
            <div>
              <h1 className="text-sm font-semibold" style={{ color: "var(--color-txt-1)" }}>
                Assistant Fiscal — Côte d'Ivoire
              </h1>
              <p className="text-xs" style={{ color: "var(--color-txt-3)" }}>
                DGI · CNPS · CGI 2024
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge />
            {!isEmpty && (
              <button
                onClick={clearMessages}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{
                  color: "var(--color-txt-2)",
                  border: "1px solid var(--color-border)",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-3)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Trash2 size={12} strokeWidth={2} />
                Effacer
              </button>
            )}
          </div>
        </header>

        {/* Messages area */}
        <main className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <WelcomeScreen onSelect={sendMessage} />
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {isLoading && <TypingIndicator />}

              <div ref={bottomRef} />
            </div>
          )}
        </main>

        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}

function WelcomeScreen({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-12">
      {/* Hero mark */}
      <div className="relative mb-8 flex items-center justify-center">
        <div
          style={{
            width: 64, height: 64,
            borderRadius: 18,
            overflow: "hidden",
            display: "flex",
            boxShadow: "0 0 0 1px #D9580A20, 0 8px 32px #00000060",
          }}
        >
          <div style={{ flex: 1, background: "#D9580A" }} />
          <div style={{ flex: 1, background: "#F5F5F0" }} />
          <div style={{ flex: 1, background: "#0A8A3C" }} />
        </div>
        {/* glow */}
        <div
          style={{
            position: "absolute", inset: -20,
            background: "radial-gradient(circle, #D9580A08 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>

      <h2
        className="text-xl font-semibold text-center mb-2"
        style={{ color: "var(--color-txt-1)", letterSpacing: "-0.01em" }}
      >
        Bonjour, je suis votre assistant fiscal
      </h2>
      <p
        className="text-sm text-center max-w-sm mb-1"
        style={{ color: "var(--color-txt-2)", lineHeight: 1.65 }}
      >
        Posez vos questions en français ou en anglais sur la fiscalité ivoirienne.
      </p>
      <p className="text-xs text-center mb-10" style={{ color: "var(--color-txt-3)" }}>
        Données DGI, CNPS et CGI 2024 · 5 outils MCP disponibles
      </p>

      <SuggestedQuestions onSelect={onSelect} />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="msg-enter flex gap-3">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border)" }}
      >
        <Building2 size={13} style={{ color: "var(--color-txt-3)" }} strokeWidth={1.8} />
      </div>
      <div
        className="rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-1"
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full dot-1" style={{ background: "var(--color-txt-3)", display: "block" }} />
        <span className="w-1.5 h-1.5 rounded-full dot-2" style={{ background: "var(--color-txt-3)", display: "block" }} />
        <span className="w-1.5 h-1.5 rounded-full dot-3" style={{ background: "var(--color-txt-3)", display: "block" }} />
      </div>
    </div>
  );
}
