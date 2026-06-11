import { useEffect, useRef, useState } from "react";
import { Wifi, WifiOff, RotateCcw } from "lucide-react";
import { useChat } from "./hooks/useChat";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { SuggestedQuestions } from "./components/SuggestedQuestions";

function StatusDot() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");
  useEffect(() => {
    const url = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";
    fetch(`${url}/health`).then(r => setStatus(r.ok ? "online" : "offline")).catch(() => setStatus("offline"));
  }, []);
  if (status === "checking") return null;
  const ok = status === "online";
  return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: ok ? "#0A8A3C" : "#DC2626" }}>
      {ok ? <Wifi size={12} strokeWidth={2} /> : <WifiOff size={12} strokeWidth={2} />}
      <span style={{ color: "var(--color-txt-3)" }}>{ok ? "API connectée" : "Hors ligne"}</span>
    </div>
  );
}

export default function App() {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--color-bg)" }}>

      {/* ── Header ── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-3">
          {/* CI flag */}
          <div style={{ width: 28, height: 20, borderRadius: 4, overflow: "hidden", display: "flex", flexShrink: 0, boxShadow: "0 1px 4px #00000040" }}>
            <div style={{ flex: 1, background: "#D9580A" }} />
            <div style={{ flex: 1, background: "#F0EFE9" }} />
            <div style={{ flex: 1, background: "#0A8A3C" }} />
          </div>
          <div>
            <span className="text-sm font-semibold" style={{ color: "var(--color-txt-1)" }}>
              eGov CI
            </span>
            <span className="text-sm" style={{ color: "var(--color-txt-3)", marginLeft: 8 }}>
              Assistant Fiscal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <StatusDot />
          {!isEmpty && (
            <button
              onClick={clearMessages}
              className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-100"
              style={{ color: "var(--color-txt-3)", opacity: 0.7 }}
            >
              <RotateCcw size={12} strokeWidth={2} />
              Réinitialiser
            </button>
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <WelcomeScreen onSelect={sendMessage} />
        ) : (
          <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingDots />}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* ── Input ── */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}

function WelcomeScreen({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-16">
      {/* CI flag */}
      <div style={{ width: 48, height: 34, borderRadius: 8, overflow: "hidden", display: "flex", flexShrink: 0, boxShadow: "0 2px 12px #00000050", marginBottom: 28 }}>
        <div style={{ flex: 1, background: "#D9580A" }} />
        <div style={{ flex: 1, background: "#F0EFE9" }} />
        <div style={{ flex: 1, background: "#0A8A3C" }} />
      </div>

      <h1
        className="text-2xl font-semibold text-center mb-3"
        style={{ color: "var(--color-txt-1)", letterSpacing: "-0.03em", lineHeight: 1.25 }}
      >
        Comment puis-je vous aider ?
      </h1>
      <p
        className="text-sm text-center mb-10"
        style={{ color: "var(--color-txt-2)", lineHeight: 1.7, maxWidth: 420 }}
      >
        Posez vos questions sur la fiscalité ivoirienne — TVA, CNPS,
        calendrier DGI, vérification NIF ou choix de régime fiscal.
      </p>

      <SuggestedQuestions onSelect={onSelect} />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="msg-enter flex gap-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
        style={{ background: "var(--color-surface-3)", color: "var(--color-txt-3)", fontSize: 10 }}
      >
        CI
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5"
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full dot-1" style={{ background: "var(--color-txt-3)", display: "block" }} />
        <span className="w-1.5 h-1.5 rounded-full dot-2" style={{ background: "var(--color-txt-3)", display: "block" }} />
        <span className="w-1.5 h-1.5 rounded-full dot-3" style={{ background: "var(--color-txt-3)", display: "block" }} />
      </div>
    </div>
  );
}
