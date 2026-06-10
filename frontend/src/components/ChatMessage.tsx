import ReactMarkdown from "react-markdown";
import { Message } from "../types";
import { ToolCallCard } from "./ToolCallCard";

interface Props {
  message: Message;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          isUser
            ? "bg-primary-600 text-white"
            : "bg-gradient-to-br from-ci-green to-ci-orange text-white"
        }`}
      >
        {isUser ? "L" : "AI"}
      </div>

      {/* Bulle de message */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {/* Nom */}
        <span className="text-xs text-slate-500 px-1">
          {isUser ? "Vous" : "Assistant eGov CI"}
        </span>

        {/* Contenu */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-primary-600 text-white rounded-tr-sm"
              : "bg-slate-800 text-slate-100 rounded-tl-sm"
          }`}
        >
          <ReactMarkdown
            components={{
              // Tables Markdown avec style
              table: ({ children }) => (
                <table className="text-xs border-collapse w-full my-2">{children}</table>
              ),
              th: ({ children }) => (
                <th className="border border-slate-600 px-2 py-1 bg-slate-700 text-left">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border border-slate-600 px-2 py-1">{children}</td>
              ),
              // Code inline
              code: ({ children }) => (
                <code className="bg-slate-900 px-1 py-0.5 rounded text-xs font-mono text-green-400">
                  {children}
                </code>
              ),
              // Liens
              a: ({ href, children }) => (
                <a href={href} className="text-primary-400 underline" target="_blank" rel="noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Outils MCP utilisés */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="w-full mt-1">
            <p className="text-xs text-slate-500 px-1 mb-1">
              🔧 {message.toolCalls.length} outil{message.toolCalls.length > 1 ? "s" : ""} MCP exécuté{message.toolCalls.length > 1 ? "s" : ""}
            </p>
            {message.toolCalls.map((tc) => (
              <ToolCallCard key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}

        {/* Horodatage */}
        <span className="text-xs text-slate-600 px-1">
          {message.timestamp.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
