/**
 * Client MCP — communique avec le backend MCP Server via HTTP.
 * On utilise l'endpoint /mcp/call-tool pour exécuter les outils.
 */

const MCP_BASE_URL = import.meta.env.VITE_MCP_URL ?? "http://localhost:8000";

export interface MCPToolResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

export async function callMCPTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const response = await fetch(`${MCP_BASE_URL}/mcp/call-tool`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: toolName, arguments: args }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MCP tool error (${response.status}): ${error}`);
  }

  const result: MCPToolResult = await response.json();

  if (result.isError) {
    throw new Error(result.content[0]?.text ?? "Erreur MCP inconnue");
  }

  // Le résultat MCP est du texte JSON — on le parse
  const text = result.content[0]?.text ?? "{}";
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/**
 * Définitions des outils MCP au format Anthropic (tool_use).
 * Claude les utilise pour décider quel outil appeler.
 */
export const MCP_TOOLS = [
  {
    name: "outil_calcul_tva",
    description:
      "Calcule la TVA (18%) sur un montant hors taxe en Côte d'Ivoire. " +
      "Retourne le montant HT, la TVA et le montant TTC en FCFA.",
    input_schema: {
      type: "object",
      properties: {
        montant_ht: {
          type: "number",
          description: "Montant hors taxe en FCFA (doit être positif)",
        },
        type_operation: {
          type: "string",
          enum: ["vente", "achat"],
          description: "Type d'opération (vente par défaut)",
        },
      },
      required: ["montant_ht"],
    },
  },
  {
    name: "outil_cotisations_cnps",
    description:
      "Calcule les cotisations sociales CNPS (part employeur + part salarié) " +
      "selon le barème officiel CNPS CI 2024.",
    input_schema: {
      type: "object",
      properties: {
        salaire_brut: {
          type: "number",
          description: "Salaire brut mensuel par employé en FCFA",
        },
        nombre_employes: {
          type: "integer",
          description: "Nombre d'employés (1 par défaut)",
        },
      },
      required: ["salaire_brut"],
    },
  },
  {
    name: "outil_verification_nif",
    description:
      "Vérifie si un Numéro d'Identification Fiscale (NIF) ivoirien est valide. " +
      "Contrôle le format officiel DGI Côte d'Ivoire.",
    input_schema: {
      type: "object",
      properties: {
        nif: { type: "string", description: "NIF à vérifier (ex: A1234567B)" },
      },
      required: ["nif"],
    },
  },
  {
    name: "outil_echeances_fiscales",
    description:
      "Retourne le calendrier des échéances fiscales DGI pour un mois et une année donnés. " +
      "Inclut TVA, ITS/IGR, CNPS, acomptes IS selon le régime fiscal.",
    input_schema: {
      type: "object",
      properties: {
        mois: { type: "integer", minimum: 1, maximum: 12, description: "Mois (1-12)" },
        annee: { type: "integer", description: "Année (ex: 2025)" },
        regime: {
          type: "string",
          enum: ["MICRO", "RSI", "RNI"],
          description: "Régime fiscal (RNI par défaut)",
        },
      },
      required: ["mois", "annee"],
    },
  },
  {
    name: "outil_regime_fiscal",
    description:
      "Donne des informations détaillées sur un régime fiscal ivoirien (MICRO, RSI, RNI). " +
      "Indique les obligations, avantages, et seuils de chiffre d'affaires.",
    input_schema: {
      type: "object",
      properties: {
        regime: {
          type: "string",
          enum: ["MICRO", "RSI", "RNI"],
          description: "Régime fiscal à consulter",
        },
        chiffre_affaires: {
          type: "number",
          description: "CA annuel en FCFA pour vérifier l'éligibilité (optionnel)",
        },
      },
      required: ["regime"],
    },
  },
] as const;
