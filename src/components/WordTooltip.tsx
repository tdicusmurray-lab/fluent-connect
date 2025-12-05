import { useState } from "react";
import { WordInContext } from "@/types/learning";
import { cn } from "@/lib/utils";
import { Volume2 } from "lucide-react";

interface WordTooltipProps {
  wordData: WordInContext;
  children: React.ReactNode;
}

export function WordTooltip({ wordData, children }: WordTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className="relative inline"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span
        className={cn(
          "cursor-help border-b-2 border-dotted transition-colors",
          wordData.isKnown
            ? "border-success text-success"
            : wordData.isNew
            ? "border-secondary text-secondary font-semibold"
            : "border-info text-info"
        )}
      >
        {children}
      </span>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-scale-in">
          <div className="bg-card rounded-xl shadow-card p-4 min-w-[200px] border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-foreground">
                {wordData.word}
              </span>
              <button className="p-1 hover:bg-muted rounded-lg transition-colors">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-1">
              {wordData.pronunciation}
            </p>
            
            <p className="text-sm font-medium text-foreground mb-2">
              {wordData.translation}
            </p>
            
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                wordData.isKnown
                  ? "bg-success-light text-success"
                  : wordData.isNew
                  ? "bg-warning-light text-warning"
                  : "bg-info-light text-info"
              )}
            >
              {wordData.partOfSpeech}
            </span>

            {wordData.isNew && (
              <p className="text-xs text-secondary mt-2 font-medium">
                ✨ New word!
              </p>
            )}
          </div>
          <div className="w-3 h-3 bg-card border-r border-b border-border absolute top-full left-1/2 -translate-x-1/2 -translate-y-1.5 rotate-45" />
        </div>
      )}
    </span>
  );
}
