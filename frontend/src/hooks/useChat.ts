/**
 * Hook useChat — orchestre la conversation entre l'utilisateur et le backend.
 *
 * Flux :
 * 1. L'utilisateur envoie un message
 * 2. On envoie l'historique complet au backend (/api/chat)
 * 3. Le backend appelle Gemini + exécute les outils MCP
 * 4. On affiche la réponse avec les outils utilisés
 */

import { useState, useCallback } from "react";
import { Message, ToolCall } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((msg: Omit<Message, "id" | "timestamp">) => {
    const full: Message = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, full]);
    return full;
  }, []);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading) return;

      setIsLoading(true);
      const newMessages = [...messages, {
        id: crypto.randomUUID(),
        role: "user" as const,
        content: userText,
        timestamp: new Date(),
      }];
      setMessages(newMessages);

      try {
        // Construire l'historique au format attendu par le backend
        const history = newMessages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          content: m.content,
        }));

        const response = await fetch(`${BACKEND_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ detail: "Erreur serveur" }));
          throw new Error(err.detail ?? `Erreur ${response.status}`);
        }

        const data = await response.json();

        // Mapper les tool_calls du backend vers notre type ToolCall
        const toolCalls: ToolCall[] = (data.tool_calls ?? []).map((tc: {
          name: string;
          input: Record<string, unknown>;
          output: Record<string, unknown>;
          status: string;
        }) => ({
          id: crypto.randomUUID(),
          name: tc.name,
          input: tc.input,
          output: tc.output,
          status: tc.status as "success" | "error" | "pending",
        }));

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: data.content,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            timestamp: new Date(),
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Une erreur est survenue : ${String(err)}. Vérifiez que le backend est démarré.`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isLoading, sendMessage, clearMessages };
}
