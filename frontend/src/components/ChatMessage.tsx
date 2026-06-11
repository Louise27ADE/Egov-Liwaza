import ReactMarkdown from "react-markdown";
import { Building2, User } from "lucide-react";
import type { Message } from "../types";
import { ToolCallCard } from "./ToolCallCard";

interface Props { message: Message }

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="msg-enter flex justify-end gap-2">
        <div
          className="max-w-[80%] rounded-xl rounded-tr-sm px-4 py-2.5 text-sm"
          style={{
            background: "var(--color-surface-3)",
            border: "1px solid var(--color-border-2)",
            color: "var(--color-txt-1)",
            lineHeight: 1.6,
          }}
        >
          {message.content}
        </div>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border)" }}
        >
          <User size={13} style={{ color: "var(--color-txt-2)" }} strokeWidth={1.8} />
        </div>
      </div>
    );
  }

  return (
    <div className="msg-enter flex gap-2">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
      >
        <Building2 size={13} style={{ color: "var(--color-txt-3)" }} strokeWidth={1.8} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex flex-col gap-1">
            {message.toolCalls.map((tc, i) => (
              <ToolCallCard key={i} toolCall={tc} />
            ))}
          </div>
        )}

        {message.content && (
          <div
            className="rounded-xl rounded-tl-sm px-4 py-3"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="msg-prose">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
