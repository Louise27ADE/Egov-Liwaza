import { useEffect, useRef, useState } from "react";
import {
  Building2, SquarePen, PanelLeftClose, PanelLeftOpen,
  Calculator, Calendar, Users, Search, FileText,
  Wifi, WifiOff, Trash2,
} from "lucide-react";
import { useChat } from "./hooks/useChat";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { SuggestedQuestions } from "./components/SuggestedQuestions";

function CIFlag({ size = 22 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 5, overflow: "hidden", display: "flex", flexShrink: 0 }}>
      <div style={{ flex: 1, background: "#D9580A" }} />
      <div style={{ flex: 1, background: "#F0EFE9" }} />
      <div style={{ flex: 1, background: "#0A8A3C" }} />
    </div>
  );
}

function StatusBadge() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");
  useEffect(() => {
    const url = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";
    fetch(`${url}/health`).then(r => setStatus(r.ok ? "online" : "offline")).catch(() => setStatus("offline"));
  }, []);
  if (status === "checking") return null;
  const ok = status === "online";
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
      style={{ background: ok ? "#0A8A3C12" : "#DC262612", border: `1px solid ${ok ? "#0A8A3C35" : "#DC262635"}`, color: ok ? "#0A8A3C" : "#DC2626" }}>
      {ok ? <Wifi size={10} strokeWidth={2.5} /> : <WifiOff size={10} strokeWidth={2.5} />}
      {ok ? "Connectée" : "Hors ligne"}
    </div>
  );
}

const TOOLS = [
  { Icon: Calculator, label: "TVA 18 %",       color: "#D9580A" },
  { Icon: Users,      label: "CNPS",            color: "#0A8A3C" },
  { Icon: Calendar,   label: "Calendrier DGI",  color: "#7C3AED" },
  { Icon: Search,     label: "Vérif. NIF",      color: "#2563EB" },
  { Icon: FileText,   label: "Régimes fiscaux", color: "#D97706" },
];

export default function App() {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const isEmpty = messages.length === 0;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-bg)" }}>

      {/* ── Sidebar overlay on mobile ── */}
      {open && (
        <div
          className="fixed inset-0 z-20 sm:hidden"
          style={{ background: "#00000060" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className="fixed sm:relative z-30 sm:z-auto h-full flex flex-col flex-shrink-0 transition-transform duration-200"
        style={{
          width: 260,
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          transform: open ? "translateX(0)" : "translateX(-260px)",
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div className="flex items-center gap-2">
            <CIFlag size={22} />
            <span className="text-sm font-semibold" style={{ color: "var(--color-txt-1)" }}>eGov CI</span>
          </div>
          <div className="flex items-center gap-1">
            <IconBtn onClick={clearMessages} title="Nouvelle conversation">
              <SquarePen size={15} strokeWidth={2} />
            </IconBtn>
            <IconBtn onClick={() => setOpen(false)} title="Fermer">
              <PanelLeftClose size={15} strokeWidth={2} />
            </IconBtn>
          </div>
        </div>

        {/* Tools section */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p className="text-xs font-semibold px-2 mb-2" style={{ color: "var(--color-txt-3)", letterSpacing: "0.07em" }}>
            OUTILS MCP
          </p>
          {TOOLS.map(({ Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2.5 px-2 py-2 rounded-lg"
              style={{ color: "var(--color-txt-2)" }}>
              <Icon size={14} strokeWidth={2} style={{ color, flexShrink: 0 }} />
              <span className="text-xs">{label}</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: color + "70", flexShrink: 0 }} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 py-3" style={{ borderTop: "1px solid var(--color-border)" }}>
          <p className="text-xs" style={{ color: "var(--color-txt-3)" }}>DGI · CNPS · CGI 2024</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-200"
        style={{ marginLeft: open ? 0 : 0 }}
      >
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 py-3"
          style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
          <div className="flex items-center gap-3">
            {!open && (
              <IconBtn onClick={() => setOpen(true)} title="Ouvrir le menu">
                <PanelLeftOpen size={15} strokeWidth={2} />
              </IconBtn>
            )}
            <div>
              <h1 className="text-sm font-semibold" style={{ color: "var(--color-txt-1)", letterSpacing: "-0.01em" }}>
                Assistant Fiscal — Côte d'Ivoire
              </h1>
              <p className="text-xs" style={{ color: "var(--color-txt-3)" }}>Données officielles DGI & CNPS 2024</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge />
            {!isEmpty && (
              <button onClick={clearMessages}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                style={{ color: "var(--color-txt-2)", border: "1px solid var(--color-border)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-3)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
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
              {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
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

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
      style={{ color: "var(--color-txt-3)" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--color-surface-3)"; (e.currentTarget as HTMLElement).style.color = "var(--color-txt-1)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--color-txt-3)"; }}>
      {children}
    </button>
  );
}

function WelcomeScreen({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-10">
      <div className="mb-5" style={{ position: "relative" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, overflow: "hidden", display: "flex", boxShadow: "0 0 0 1px #ffffff08, 0 8px 32px #00000070" }}>
          <div style={{ flex: 1, background: "#D9580A" }} />
          <div style={{ flex: 1, background: "#F0EFE9" }} />
          <div style={{ flex: 1, background: "#0A8A3C" }} />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-center mb-2"
        style={{ color: "var(--color-txt-1)", letterSpacing: "-0.02em" }}>
        Bonjour, je suis votre assistant fiscal
      </h2>
      <p className="text-sm text-center mb-8"
        style={{ color: "var(--color-txt-2)", lineHeight: 1.65, maxWidth: 380 }}>
        Posez vos questions sur la fiscalité ivoirienne — TVA, CNPS, NIF, calendrier DGI, régimes fiscaux.
      </p>

      <SuggestedQuestions onSelect={onSelect} />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="msg-enter flex gap-2">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
        <Building2 size={13} style={{ color: "var(--color-txt-3)" }} strokeWidth={1.8} />
      </div>
      <div className="rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5"
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
        <span className="w-1.5 h-1.5 rounded-full dot-1" style={{ background: "var(--color-txt-3)", display: "block" }} />
        <span className="w-1.5 h-1.5 rounded-full dot-2" style={{ background: "var(--color-txt-3)", display: "block" }} />
        <span className="w-1.5 h-1.5 rounded-full dot-3" style={{ background: "var(--color-txt-3)", display: "block" }} />
      </div>
    </div>
  );
}
