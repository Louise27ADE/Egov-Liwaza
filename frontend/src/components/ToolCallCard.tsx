import { useState } from "react";
import { ToolCall } from "../types";

const TOOL_META: Record<string, { label: string; icon: string; color: string }> = {
  outil_calcul_tva:         { label: "Calcul TVA",         icon: "🧮", color: "#E8630A" },
  outil_cotisations_cnps:   { label: "Cotisations CNPS",   icon: "👥", color: "#009A44" },
  outil_verification_nif:   { label: "Vérification NIF",   icon: "🔍", color: "#3B82F6" },
  outil_echeances_fiscales: { label: "Échéances DGI",      icon: "📅", color: "#8B5CF6" },
  outil_regime_fiscal:      { label: "Régime fiscal",      icon: "📋", color: "#F59E0B" },
};

function formatValue(val: unknown): string {
  if (typeof val === "number") return val.toLocaleString("fr-FR");
  if (typeof val === "boolean") return val ? "Oui" : "Non";
  if (val === null || val === undefined) return "—";
  return String(val);
}

export function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const [open, setOpen] = useState(false);
  const meta = TOOL_META[toolCall.name] ?? { label: toolCall.name, icon: "⚙️", color: "#4A5568" };
  const isSuccess = toolCall.status === "success";

  return (
    <div
      className="rounded-xl overflow-hidden border transition-all duration-200"
      style={{ borderColor: open ? meta.color + "40" : "#1A2235", background: "#0F1623" }}
    >
      {/* En-tête cliquable */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
      >
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0"
          style={{ background: meta.color + "20" }}
        >
          {meta.icon}
        </span>
        <span className="text-xs font-medium flex-1" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <span
          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
          style={{
            background: isSuccess ? "#10B98120" : "#EF444420",
            color: isSuccess ? "#10B981" : "#EF4444",
          }}
        >
          {isSuccess ? "✓" : "✗"}
        </span>
        <svg
          className="w-3 h-3 text-gray-600 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Détails dépliables */}
      {open && (
        <div className="border-t px-3 py-3 space-y-3" style={{ borderColor: "#1A2235" }}>
          {/* Paramètres */}
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: "#4A5568" }}>PARAMÈTRES</p>
            <div className="space-y-1">
              {Object.entries(toolCall.input).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#8A96B0" }}>{k}</span>
                  <span className="text-xs font-medium" style={{ color: "#EEF0F6" }}>
                    {formatValue(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Résultat */}
          {toolCall.output && (
            <div>
              <p className="text-xs font-medium mb-1.5" style={{ color: "#4A5568" }}>RÉSULTAT</p>
              <div className="space-y-1">
                {Object.entries(toolCall.output)
                  .filter(([k]) => k !== "devise" && k !== "type_operation")
                  .map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "#8A96B0" }}>
                        {k.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: meta.color }}>
                        {formatValue(v)}
                        {typeof v === "number" && k.includes("montant") || k.includes("salaire") || k.includes("cotisation") || k.includes("part")
                          ? " FCFA" : ""}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
