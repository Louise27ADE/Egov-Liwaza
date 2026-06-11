import { Calculator, Calendar, Users, Search, FileText, Briefcase } from "lucide-react";

interface Props { onSelect: (q: string) => void }

const SUGGESTIONS = [
  {
    Icon: Calculator, color: "#D9580A", cat: "TVA",
    text: "Calcule la TVA sur 500 000 FCFA",
  },
  {
    Icon: Calendar, color: "#7C3AED", cat: "Calendrier DGI",
    text: "Quelles sont les échéances fiscales de juin 2025 ?",
  },
  {
    Icon: Users, color: "#0A8A3C", cat: "CNPS",
    text: "Cotisations CNPS pour 3 employés à 250 000 FCFA",
  },
  {
    Icon: Search, color: "#2563EB", cat: "NIF",
    text: "Vérifie si le NIF A1234567B est valide",
  },
  {
    Icon: FileText, color: "#D97706", cat: "Régimes",
    text: "Explique le régime simplifié d'imposition RSI",
  },
  {
    Icon: Briefcase, color: "#6366F1", cat: "Conseil",
    text: "CA de 80 M FCFA — quel régime fiscal choisir ?",
  },
];

export function SuggestedQuestions({ onSelect }: Props) {
  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <p
        className="text-xs font-semibold text-center mb-3"
        style={{ color: "var(--color-txt-3)", letterSpacing: "0.07em" }}
      >
        QUESTIONS FRÉQUENTES
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map(({ Icon, color, cat, text }) => (
          <button
            key={text}
            onClick={() => onSelect(text)}
            className="group text-left rounded-xl px-3.5 py-3 transition-all duration-150"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = color + "45";
              (e.currentTarget as HTMLElement).style.background = color + "08";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
              (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)";
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: color + "18" }}
              >
                <Icon size={13} style={{ color }} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold mb-0.5" style={{ color }}>
                  {cat}
                </p>
                <p className="text-xs leading-snug" style={{ color: "var(--color-txt-2)" }}>
                  {text}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
