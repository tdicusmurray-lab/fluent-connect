import { Language } from "@/types/learning";
import { languages } from "@/data/languages";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface LanguageSelectorProps {
  selectedLanguage: Language | null;
  onSelect: (language: Language) => void;
}

export function LanguageSelector({ selectedLanguage, onSelect }: LanguageSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => onSelect(language)}
          className={cn(
            "relative bg-card rounded-2xl p-4 shadow-soft transition-all duration-300 hover:shadow-card hover:scale-105 text-center group",
            selectedLanguage?.code === language.code && "ring-2 ring-primary shadow-glow"
          )}
        >
          <span className="text-4xl mb-2 block">{language.flag}</span>
          <p className="font-display font-bold text-sm">{language.name}</p>
          <p className="text-xs text-muted-foreground">{language.nativeName}</p>
          
          {selectedLanguage?.code === language.code && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
