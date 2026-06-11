import { useState, useRef, KeyboardEvent } from "react";
import { SendHorizonal, Loader2 } from "lucide-react";

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

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div
      className="flex-shrink-0 px-4 py-3"
      style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}
    >
      <div
        className="max-w-2xl mx-auto flex items-end gap-2 rounded-xl px-3.5 py-2.5"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border-2)",
        }}
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
          className="flex-1 bg-transparent text-sm outline-none resize-none leading-relaxed"
          style={{
            color: "var(--color-txt-1)",
            maxHeight: "140px",
            caretColor: "var(--color-orange)",
          }}
        />

        <button
          onClick={send}
          disabled={!canSend}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
          style={{
            background: canSend ? "var(--color-orange)" : "var(--color-surface-3)",
            cursor: canSend ? "pointer" : "not-allowed",
          }}
        >
          {disabled
            ? <Loader2 size={14} style={{ color: "var(--color-txt-3)" }} className="animate-spin" />
            : <SendHorizonal size={14} style={{ color: canSend ? "#fff" : "var(--color-txt-3)" }} strokeWidth={2} />
          }
        </button>
      </div>

      <p className="text-center mt-1.5 text-xs" style={{ color: "var(--color-txt-3)" }}>
        Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
      </p>
    </div>
  );
}
