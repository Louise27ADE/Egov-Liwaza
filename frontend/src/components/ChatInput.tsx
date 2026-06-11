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
      className="flex-shrink-0 px-4 pb-4 pt-3"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="max-w-2xl mx-auto rounded-2xl"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border-2)",
          boxShadow: "0 4px 24px #00000030",
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
          rows={2}
          className="w-full bg-transparent text-sm outline-none resize-none leading-relaxed px-4 pt-4 pb-2"
          style={{
            color: "var(--color-txt-1)",
            minHeight: 60,
            maxHeight: 180,
            caretColor: "var(--color-orange)",
            display: "block",
          }}
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <span className="text-xs" style={{ color: "var(--color-txt-3)" }}>
            Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
          </span>
          <button
            onClick={send}
            disabled={!canSend}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: canSend ? "var(--color-orange)" : "var(--color-surface-3)",
              color: canSend ? "#fff" : "var(--color-txt-3)",
              cursor: canSend ? "pointer" : "not-allowed",
            }}
          >
            {disabled
              ? <Loader2 size={13} className="animate-spin" />
              : <SendHorizonal size={13} strokeWidth={2} />
            }
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
