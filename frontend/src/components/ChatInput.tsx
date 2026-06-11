import { useState, useRef, KeyboardEvent } from "react";

interface Props { onSend: (text: string) => void; disabled: boolean }

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const send = () => {
    const t = value.trim();
    if (!t || disabled) return;
    onSend(t);
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const onInput = () => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = Math.min(ref.current.scrollHeight, 140) + "px";
  };

  return (
    <div className="flex-shrink-0 px-4 py-4" style={{ background: "#080C14", borderTop: "1px solid #1A2235" }}>
      <div
        className="max-w-3xl mx-auto flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
        style={{ background: "#0F1623", border: "1px solid #252F45" }}
        onFocus={() => {}}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={onKey}
          onInput={onInput}
          placeholder="Posez votre question fiscale…"
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-sm outline-none resize-none leading-relaxed placeholder:text-gray-600"
          style={{ color: "#EEF0F6", maxHeight: "140px" }}
        />
        <button
          onClick={send}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            background: disabled || !value.trim() ? "#1A2235" : "linear-gradient(135deg, #E8630A, #FF9A4A)",
            cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
          }}
        >
          {disabled ? (
            <svg className="w-4 h-4 animate-spin" style={{ color: "#4A5568" }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
            </svg>
          )}
        </button>
      </div>
      <p className="text-center mt-2 text-xs" style={{ color: "#2A3550" }}>
        Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
      </p>
    </div>
  );
}
