interface Props { onSelect: (q: string) => void }

const SUGGESTIONS = [
  "Calcule la TVA sur 500 000 FCFA",
  "Quelles sont les échéances fiscales de juin 2025 ?",
  "Cotisations CNPS pour 3 employés à 250 000 FCFA",
  "Vérifie si le NIF A1234567B est valide",
  "Explique le régime simplifié d'imposition RSI",
  "Mon CA est de 80 millions FCFA, quel régime fiscal ?",
];

export function SuggestedQuestions({ onSelect }: Props) {
  return (
    <div className="w-full" style={{ maxWidth: 540 }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map((text) => (
          <button
            key={text}
            onClick={() => onSelect(text)}
            className="text-left px-4 py-3 rounded-xl text-sm transition-colors duration-150"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-txt-2)",
              lineHeight: 1.5,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-2)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-txt-1)";
              (e.currentTarget as HTMLElement).style.background = "var(--color-surface-3)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-txt-2)";
              (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)";
            }}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
