interface Props { onSelect: (q: string) => void }

const SUGGESTIONS = [
  { emoji: "🧮", cat: "TVA",       text: "Calcule la TVA sur 500 000 FCFA",                          color: "#E8630A" },
  { emoji: "📅", cat: "Calendrier", text: "Quelles sont les échéances fiscales de juin 2025 ?",        color: "#8B5CF6" },
  { emoji: "👥", cat: "CNPS",       text: "Calcule les cotisations CNPS pour 3 employés à 250 000 FCFA", color: "#009A44" },
  { emoji: "🔍", cat: "NIF",        text: "Vérifie si le NIF A1234567B est valide",                   color: "#3B82F6" },
  { emoji: "📋", cat: "Régimes",    text: "Explique-moi le régime RSI",                               color: "#F59E0B" },
  { emoji: "💼", cat: "Conseil",    text: "Mon CA est de 80 millions FCFA, quel régime fiscal ?",     color: "#EC4899" },
];

export function SuggestedQuestions({ onSelect }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <p className="text-xs font-medium text-center mb-4" style={{ color: "#4A5568", letterSpacing: "0.08em" }}>
        QUESTIONS FRÉQUENTES
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => onSelect(s.text)}
            className="group text-left px-4 py-3 rounded-xl border transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: "#0F1623",
              borderColor: "#1A2235",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = s.color + "50";
              (e.currentTarget as HTMLElement).style.background = s.color + "08";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "#1A2235";
              (e.currentTarget as HTMLElement).style.background = "#0F1623";
            }}
          >
            <div className="flex items-start gap-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ background: s.color + "15" }}
              >
                {s.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold mb-0.5" style={{ color: s.color }}>
                  {s.cat}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "#8A96B0" }}>
                  {s.text}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
