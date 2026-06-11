import { useEffect, useRef, useState } from "react";
import {
  Building2, Plus, Calculator, Calendar, Users,
  Search, FileText, Wifi, WifiOff, Trash2,
} from "lucide-react";
import { useChat } from "./hooks/useChat";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { SuggestedQuestions } from "./components/SuggestedQuestions";

/* ─── CI flag ─────────────────────────────────────────────── */
function CIFlag({ size = 24 }: { size?: number }) {
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: 5, overflow: "hidden",
        display: "flex", flexShrink: 0,
        boxShadow: "0 1px 4px #00000050",
      }}
    >
      <div style={{ flex: 1, background: "#D9580A" }} />
      <div style={{ flex: 1, background: "#F0EFE9" }} />
      <div style={{ flex: 1, background: "#0A8A3C" }} />
    </div>
  );
}

/* ─── Status badge ─────────────────────────────────────────── */
function StatusBadge() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    const url = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";
    fetch(`${url}/health`)
      .then(r => setStatus(r.ok ? "online" : "offline"))
      .catch(() => setStatus("offline"));
  }, []);

  if (status === "checking") return null;

  const online = status === "online";
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
      style={{
        background: online ? "#0A8A3C14" : "#DC262614",
        border: `1px solid ${online ? "#0A8A3C30" : "#DC262630"}`,
        color: online ? "#0A8A3C" : "#DC2626",
      }}
    >
      {online
        ? <Wifi size={10} strokeWidth={2.5} />
        : <WifiOff size={10} strokeWidth={2.5} />
      }
      {online ? "API connectée" : "Hors ligne"}
    </div>
  );
}

/* ─── Sidebar tools ────────────────────────────────────────── */
const TOOLS = [
  { Icon: Calculator, label: "TVA 18 %",        color: "#D9580A" },
  { Icon: Users,      label: "CNPS",             color: "#0A8A3C" },
  { Icon: Calendar,   label: "Calendrier DGI",   color: "#7C3AED" },
  { Icon: Search,     label: "Vérif. NIF",       color: "#2563EB" },
  { Icon: FileText,   label: "Régimes fiscaux",  color: "#D97706" },
];

/* ─── App ──────────────────────────────────────────────────── */
export default function App() {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-bg)" }}>

      {/* ── Slim sidebar ── */}
      <aside
        className="hidden sm:flex flex-shrink-0 flex-col items-center py-3 gap-1"
        style={{
          width: 52,
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        {/* Logo */}
        <div className="mb-3 mt-1">
          <CIFlag size={24} />
        </div>

        {/* New chat */}
        <SideBtn onClick={clearMessages} title="Nouvelle conversation">
          <Plus size={15} strokeWidth={2.5} />
        </SideBtn>

        <div className="w-6 my-1" style={{ borderTop: "1px solid var(--color-border)" }} />

        {/* Tool icons */}
        {TOOLS.map(({ Icon, label, color }) => (
          <SideBtn key={label} title={label}>
            <Icon size={15} strokeWidth={2} style={{ color }} />
          </SideBtn>
        ))}
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3"
          style={{
            background: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2.5">
            {/* Mobile flag */}
            <div className="sm:hidden">
              <CIFlag size={22} />
            </div>
            <div>
              <h1
                className="text-sm font-semibold leading-tight"
                style={{ color: "var(--color-txt-1)", letterSpacing: "-0.01em" }}
              >
                Assistant Fiscal — Côte d'Ivoire
              </h1>
              <p className="text-xs leading-tight" style={{ color: "var(--color-txt-3)" }}>
                DGI · CNPS · CGI 2024
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge />
            {!isEmpty && (
              <button
                onClick={clearMessages}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                style={{ color: "var(--color-txt-2)", border: "1px solid var(--color-border)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-3)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Trash2 size={12} strokeWidth={2} />
                <span className="hidden sm:inline">Effacer</span>
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <WelcomeScreen onSelect={sendMessage} />
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingDots />}
              <div ref={bottomRef} />
            </div>
          )}
        </main>

        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}

/* ─── Sidebar button ───────────────────────────────────────── */
function SideBtn({
  children, onClick, title,
}: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
      style={{ color: "var(--color-txt-3)" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = "var(--color-surface-3)";
        (e.currentTarget as HTMLElement).style.color = "var(--color-txt-1)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.color = "var(--color-txt-3)";
      }}
    >
      {children}
    </button>
  );
}

/* ─── Welcome screen ───────────────────────────────────────── */
function WelcomeScreen({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-10">
      {/* CI mark */}
      <div className="mb-6" style={{ position: "relative" }}>
        <div
          style={{
            width: 56, height: 56, borderRadius: 16,
            overflow: "hidden", display: "flex",
            boxShadow: "0 0 0 1px #ffffff08, 0 8px 40px #00000080",
          }}
        >
          <div style={{ flex: 1, background: "#D9580A" }} />
          <div style={{ flex: 1, background: "#F0EFE9" }} />
          <div style={{ flex: 1, background: "#0A8A3C" }} />
        </div>
        <div
          style={{
            position: "absolute", inset: -24, borderRadius: "50%",
            background: "radial-gradient(circle, #D9580A0A 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>

      <h2
        className="text-xl font-semibold text-center mb-2"
        style={{ color: "var(--color-txt-1)", letterSpacing: "-0.02em" }}
      >
        Bonjour, je suis votre assistant fiscal
      </h2>
      <p
        className="text-sm text-center max-w-xs mb-1"
        style={{ color: "var(--color-txt-2)", lineHeight: 1.7 }}
      >
        Posez vos questions sur la fiscalité ivoirienne en français ou en anglais.
      </p>
      <p className="text-xs text-center mb-8" style={{ color: "var(--color-txt-3)" }}>
        5 outils MCP · Données DGI & CNPS 2024
      </p>

      <SuggestedQuestions onSelect={onSelect} />
    </div>
  );
}

/* ─── Typing dots ──────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="msg-enter flex gap-2">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
      >
        <Building2 size={13} style={{ color: "var(--color-txt-3)" }} strokeWidth={1.8} />
      </div>
      <div
        className="rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5"
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full dot-1" style={{ background: "var(--color-txt-3)", display: "block" }} />
        <span className="w-1.5 h-1.5 rounded-full dot-2" style={{ background: "var(--color-txt-3)", display: "block" }} />
        <span className="w-1.5 h-1.5 rounded-full dot-3" style={{ background: "var(--color-txt-3)", display: "block" }} />
      </div>
    </div>
  );
}
