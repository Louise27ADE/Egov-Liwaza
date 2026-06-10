/**
 * Questions suggérées — aide l'utilisateur à démarrer la conversation.
 * Montre les capacités du système sans que l'utilisateur ait besoin de deviner.
 */

interface Props {
  onSelect: (question: string) => void;
}

const SUGGESTIONS = [
  {
    emoji: "🧮",
    text: "Calcule la TVA sur 500 000 FCFA",
    category: "TVA",
  },
  {
    emoji: "📅",
    text: "Quelles sont les échéances fiscales de juin 2025 ?",
    category: "Calendrier",
  },
  {
    emoji: "👥",
    text: "Calcule les cotisations CNPS pour 3 employés à 250 000 FCFA",
    category: "CNPS",
  },
  {
    emoji: "🔍",
    text: "Vérifie si le NIF A1234567B est valide",
    category: "NIF",
  },
  {
    emoji: "📋",
    text: "Explique-moi le régime RSI",
    category: "Régimes",
  },
  {
    emoji: "💼",
    text: "Mon CA est de 80 millions FCFA, quel régime fiscal ?",
    category: "Conseil",
  },
];

export function SuggestedQuestions({ onSelect }: Props) {
  return (
    <div className="px-4 pb-4">
      <p className="text-xs text-slate-500 mb-3 text-center">
        Questions fréquentes — cliquez pour démarrer
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => onSelect(s.text)}
            className="flex items-start gap-2 text-left px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-primary-500 hover:bg-slate-700 transition-all duration-150 group"
          >
            <span className="text-lg leading-none mt-0.5">{s.emoji}</span>
            <div>
              <span className="text-xs text-primary-400 font-medium">{s.category}</span>
              <p className="text-xs text-slate-300 group-hover:text-white mt-0.5 leading-relaxed">
                {s.text}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
