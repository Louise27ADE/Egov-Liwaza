/**
 * ToolCallCard — affiche l'exécution d'un outil MCP.
 * C'est la "visibilité de l'exécution des outils" demandée dans le test.
 * L'utilisateur peut voir exactement quel outil a été appelé, avec quels paramètres,
 * et quel résultat a été retourné.
 */

import { ToolCall } from "../types";

const TOOL_LABELS: Record<string, string> = {
  outil_calcul_tva: "Calcul TVA",
  outil_cotisations_cnps: "Cotisations CNPS",
  outil_verification_nif: "Vérification NIF",
  outil_echeances_fiscales: "Échéances fiscales",
  outil_regime_fiscal: "Régime fiscal",
};

const TOOL_ICONS: Record<string, string> = {
  outil_calcul_tva: "🧮",
  outil_cotisations_cnps: "👥",
  outil_verification_nif: "🔍",
  outil_echeances_fiscales: "📅",
  outil_regime_fiscal: "📋",
};

interface Props {
  toolCall: ToolCall;
}

export function ToolCallCard({ toolCall }: Props) {
  const label = TOOL_LABELS[toolCall.name] ?? toolCall.name;
  const icon = TOOL_ICONS[toolCall.name] ?? "⚙️";

  return (
    <div className="my-2 rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden text-sm">
      {/* En-tête de l'outil */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border-b border-slate-700">
        <span>{icon}</span>
        <span className="font-medium text-slate-200">{label}</span>
        <span
          className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
            toolCall.status === "success"
              ? "bg-green-900/60 text-green-400"
              : toolCall.status === "error"
              ? "bg-red-900/60 text-red-400"
              : "bg-yellow-900/60 text-yellow-400"
          }`}
        >
          {toolCall.status === "success"
            ? "✓ Exécuté"
            : toolCall.status === "error"
            ? "✗ Erreur"
            : "⏳ En cours"}
        </span>
      </div>

      {/* Paramètres d'entrée */}
      <div className="px-3 py-2 border-b border-slate-700/50">
        <p className="text-xs text-slate-500 mb-1">Paramètres</p>
        <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
          {JSON.stringify(toolCall.input, null, 2)}
        </pre>
      </div>

      {/* Résultat */}
      {toolCall.output && (
        <div className="px-3 py-2">
          <p className="text-xs text-slate-500 mb-1">Résultat</p>
          <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
            {JSON.stringify(toolCall.output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
