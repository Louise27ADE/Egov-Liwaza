/**
 * Hook useChat — orchestre la conversation entre l'utilisateur, Claude et le MCP Server.
 *
 * Flux :
 * 1. L'utilisateur envoie un message
 * 2. On envoie le message à Claude (API Anthropic) avec les outils MCP disponibles
 * 3. Si Claude veut appeler un outil → on appelle le MCP Server
 * 4. On renvoie le résultat à Claude → Claude formule la réponse finale
 */

import { useState, useCallback } from "react";
import Anthropic from "@anthropic-ai/sdk";
import { Message, ToolCall } from "../types";
import { callMCPTool, MCP_TOOLS } from "../lib/mcpClient";

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY ?? "",
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `Tu es un assistant fiscal ivoirien expert, intégré à la plateforme eGov CI.
Tu aides les entreprises et les citoyens de Côte d'Ivoire à comprendre leurs obligations fiscales.

Tes domaines d'expertise :
- TVA (Taxe sur la Valeur Ajoutée) — taux 18% en CI
- Cotisations CNPS (Caisse Nationale de Prévoyance Sociale)
- Calendrier fiscal DGI (Direction Générale des Impôts)
- Régimes fiscaux CI : Micro-entreprise, RSI, RNI
- Validation des NIF (Numéro d'Identification Fiscale)

Instructions :
- Réponds en français par défaut. Si l'utilisateur écrit en anglais, réponds en anglais.
- Utilise toujours les outils disponibles pour calculer des montants — ne calcule jamais de tête.
- Présente les résultats de façon claire avec les montants en FCFA.
- Si une question dépasse tes outils (ex: question juridique complexe), recommande de consulter un expert-comptable.
- Sois précis, professionnel, et bienveillant.`;

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
      addMessage({ role: "user", content: userText });

      try {
        // Construire l'historique pour Claude (format Anthropic)
        const history = messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
        history.push({ role: "user", content: userText });

        // Premier appel à Claude — avec les outils MCP disponibles
        let response = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          tools: MCP_TOOLS as unknown as Anthropic.Tool[],
          messages: history,
        });

        const toolCalls: ToolCall[] = [];

        // Boucle d'orchestration — Claude peut appeler plusieurs outils
        while (response.stop_reason === "tool_use") {
          const toolUseBlocks = response.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
          );

          const toolResults: Anthropic.ToolResultBlockParam[] = [];

          for (const block of toolUseBlocks) {
            const tc: ToolCall = {
              id: block.id,
              name: block.name,
              input: block.input as Record<string, unknown>,
              status: "pending",
            };
            toolCalls.push(tc);

            try {
              const output = await callMCPTool(
                block.name,
                block.input as Record<string, unknown>
              );
              tc.output = output;
              tc.status = "success";
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify(output),
              });
            } catch (err) {
              tc.status = "error";
              tc.output = { error: String(err) };
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: `Erreur: ${String(err)}`,
                is_error: true,
              });
            }
          }

          // Renvoyer les résultats des outils à Claude
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          history.push({ role: "assistant", content: response.content as any });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          history.push({ role: "user", content: toolResults as any });

          response = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            tools: MCP_TOOLS as unknown as Anthropic.Tool[],
            messages: history,
          });
        }

        // Extraire la réponse textuelle finale
        const textBlock = response.content.find(
          (b): b is Anthropic.TextBlock => b.type === "text"
        );
        const assistantText = textBlock?.text ?? "Je n'ai pas pu générer une réponse.";

        addMessage({
          role: "assistant",
          content: assistantText,
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        });
      } catch (err) {
        addMessage({
          role: "assistant",
          content: `Une erreur est survenue : ${String(err)}. Vérifiez votre clé API Anthropic.`,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, addMessage]
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isLoading, sendMessage, clearMessages };
}
