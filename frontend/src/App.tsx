import { useEffect, useRef } from "react";
import { useChat } from "./hooks/useChat";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { SuggestedQuestions } from "./components/SuggestedQuestions";

export default function App() {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          {/* Logo CI — couleurs du drapeau */}
          <div className="flex h-8 w-8 rounded-lg overflow-hidden">
            <div className="flex-1 bg-ci-orange" />
            <div className="flex-1 bg-ci-white" />
            <div className="flex-1 bg-ci-green" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 leading-none">eGov CI</h1>
            <p className="text-xs text-slate-500 leading-none mt-0.5">Plateforme Fiscale Intelligente</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Indicateur MCP */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            MCP connecté
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
            >
              Nouvelle conversation
            </button>
          )}
        </div>
      </header>

      {/* Zone de conversation */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {isEmpty ? (
          /* Écran d'accueil */
          <div className="flex flex-col items-center justify-center h-full px-4 pb-8">
            <div className="flex h-16 w-16 rounded-2xl overflow-hidden mb-6 shadow-lg">
              <div className="flex-1 bg-ci-orange" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-ci-green" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2 text-center">
              Assistant Fiscal CI
            </h2>
            <p className="text-slate-400 text-center max-w-md mb-8 text-sm leading-relaxed">
              Posez vos questions fiscales en français ou en anglais.
              TVA, CNPS, calendrier DGI, régimes fiscaux — je suis là pour vous aider.
            </p>
            <div className="w-full max-w-xl">
              <SuggestedQuestions onSelect={sendMessage} />
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Indicateur de chargement */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ci-green to-ci-orange flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                  AI
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-5">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
