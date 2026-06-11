import ReactMarkdown from "react-markdown";
import { Message } from "../types";
import { ToolCallCard } from "./ToolCallCard";

interface Props { message: Message }

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`animate-fade-up flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>

      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #E8630A, #FF9A4A)" }}
          >
            L
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{ background: "linear-gradient(135deg, #009A44, #00C85A)", boxShadow: "0 0 12px #009A4440" }}
          >
            🏛️
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className={`max-w-[78%] flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>

        {/* Nom + heure */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs font-medium" style={{ color: isUser ? "#E8630A" : "#009A44" }}>
            {isUser ? "Vous" : "Assistant eGov CI"}
          </span>
          <span className="text-xs" style={{ color: "#4A5568" }}>
            {message.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Bulle */}
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={isUser ? {
            background: "linear-gradient(135deg, #E8630A15, #E8630A08)",
            border: "1px solid #E8630A30",
            borderBottomRightRadius: "4px",
            color: "#EEF0F6",
          } : {
            background: "#0F1623",
            border: "1px solid #1A2235",
            borderBottomLeftRadius: "4px",
            color: "#D1D9EF",
          }}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Outils MCP utilisés */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="w-full space-y-1.5 mt-1">
            <p className="text-xs px-1 flex items-center gap-1.5" style={{ color: "#4A5568" }}>
              <span
                className="w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px]"
                style={{ borderColor: "#252F45", color: "#8A96B0" }}
              >
                ⚡
              </span>
              {message.toolCalls.length} outil{message.toolCalls.length > 1 ? "s" : ""} MCP exécuté{message.toolCalls.length > 1 ? "s" : ""}
            </p>
            {message.toolCalls.map((tc) => (
              <ToolCallCard key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
