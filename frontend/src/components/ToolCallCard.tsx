import { useState } from "react";
import { Calculator, Users, Search, Calendar, FileText, Settings, ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import type { ToolCall } from "../types";

const TOOL_META: Record<string, { label: string; Icon: typeof Calculator; color: string }> = {
  outil_calcul_tva:         { label: "Calcul TVA 18 %",    Icon: Calculator, color: "#D9580A" },
  outil_cotisations_cnps:   { label: "Cotisations CNPS",   Icon: Users,      color: "#0A8A3C" },
  outil_verification_nif:   { label: "Vérification NIF",   Icon: Search,     color: "#2563EB" },
  outil_echeances_fiscales: { label: "Échéances DGI",      Icon: Calendar,   color: "#7C3AED" },
  outil_regime_fiscal:      { label: "Régime fiscal",      Icon: FileText,   color: "#D97706" },
};

function formatValue(val: unknown): string {
  if (typeof val === "number") return val.toLocaleString("fr-FR");
  if (typeof val === "boolean") return val ? "Oui" : "Non";
  if (val === null || val === undefined) return "—";
  return String(val);
}

export function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const [open, setOpen] = useState(false);
  const meta = TOOL_META[toolCall.name] ?? { label: toolCall.name, Icon: Settings, color: "#7A88AA" };
  const { Icon, label, color } = meta;
  const isSuccess = toolCall.status === "success";

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: "var(--color-surface)",
        border: `1px solid ${open ? color + "35" : "var(--color-border)"}`,
        transition: "border-color 0.15s",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
        style={{ background: "transparent" }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-2)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: color + "18" }}
        >
          <Icon size={12} style={{ color }} strokeWidth={2} />
        </div>

        <span className="text-xs font-medium flex-1" style={{ color }}>
          {label}
        </span>

        {isSuccess
          ? <CheckCircle2 size={13} style={{ color: "var(--color-success)" }} strokeWidth={2} />
          : <XCircle size={13} style={{ color: "var(--color-error)" }} strokeWidth={2} />
        }

        <ChevronDown
          size={12}
          style={{
            color: "var(--color-txt-3)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          className="px-3 pb-3 pt-2 flex flex-col gap-2.5"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          {Object.keys(toolCall.input).length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--color-txt-3)", letterSpacing: "0.06em" }}>
                PARAMÈTRES
              </p>
              <div className="flex flex-col gap-1">
                {Object.entries(toolCall.input).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4">
                    <span className="text-xs" style={{ color: "var(--color-txt-2)" }}>
                      {k.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-medium" style={{ color: "var(--color-txt-1)" }}>
                      {formatValue(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {toolCall.output && (
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--color-txt-3)", letterSpacing: "0.06em" }}>
                RÉSULTAT
              </p>
              <div className="flex flex-col gap-1">
                {Object.entries(toolCall.output)
                  .filter(([k]) => k !== "devise" && k !== "type_operation")
                  .map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4">
                      <span className="text-xs" style={{ color: "var(--color-txt-2)" }}>
                        {k.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-semibold" style={{ color }}>
                        {formatValue(v)}
                        {typeof v === "number" && (k.includes("montant") || k.includes("salaire") || k.includes("cotisation") || k.includes("part")) ? " FCFA" : ""}
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
