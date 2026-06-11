import { Calculator, Calendar, Users, Search, FileText, Briefcase } from "lucide-react";

interface Props { onSelect: (q: string) => void }

const SUGGESTIONS = [
  { Icon: Calculator, color: "#D9580A", text: "Calcule la TVA sur 500 000 FCFA" },
  { Icon: Calendar,   color: "#7C3AED", text: "Quelles sont les échéances fiscales de juin 2025 ?" },
  { Icon: Users,      color: "#0A8A3C", text: "Cotisations CNPS pour 3 employés à 250 000 FCFA" },
  { Icon: Search,     color: "#2563EB", text: "Vérifie si le NIF A1234567B est valide" },
  { Icon: FileText,   color: "#D97706", text: "Explique le régime simplifié d'imposition RSI" },
  { Icon: Briefcase,  color: "#6366F1", text: "Mon CA est de 80 millions FCFA, quel régime fiscal ?" },
];

export function SuggestedQuestions({ onSelect }: Props) {
  return (
    <div className="w-full" style={{ maxWidth: 560 }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map(({ Icon, color, text }) => (
          <button
            key={text}
            onClick={() => onSelect(text)}
            className="flex items-start gap-3 text-left px-4 py-3.5 rounded-xl transition-all duration-150"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = color + "50";
              (e.currentTarget as HTMLElement).style.background = "var(--color-surface-3)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
              (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)";
            }}
          >
            <div
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
              style={{ background: color + "18" }}
            >
              <Icon size={14} style={{ color }} strokeWidth={2} />
            </div>
            <span className="text-sm leading-snug" style={{ color: "var(--color-txt-2)" }}>
              {text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
