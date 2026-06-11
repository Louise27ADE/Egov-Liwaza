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
    ref.current.style.height = Math.min(ref.current.scrollHeight, 160) + "px";
  };

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="flex-shrink-0 px-4 sm:px-6 pb-4 pt-2" style={{ background: "var(--color-bg)" }}>
      <div
        className="w-full flex items-center gap-2 rounded-lg px-3 py-2"
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
          className="flex-1 bg-transparent outline-none resize-none"
          style={{
            color: "var(--color-txt-1)",
            fontSize: "0.875rem",
            lineHeight: "1.5rem",
            maxHeight: 160,
            caretColor: "var(--color-orange)",
            paddingTop: 0,
            paddingBottom: 0,
          }}
        />
        <button
          onClick={send}
          disabled={!canSend}
          className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-all duration-150"
          style={{
            background: canSend ? "var(--color-orange)" : "transparent",
            cursor: canSend ? "pointer" : "not-allowed",
          }}
        >
          {disabled
            ? <Loader2 size={13} style={{ color: "var(--color-txt-3)" }} className="animate-spin" />
            : <SendHorizonal size={13} style={{ color: canSend ? "#fff" : "var(--color-txt-3)" }} strokeWidth={2} />
          }
        </button>
      </div>
    </div>
  );
}
