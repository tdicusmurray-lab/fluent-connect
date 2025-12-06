import { Message } from "@/types/learning";
import { WordTooltip } from "./WordTooltip";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  const renderContent = () => {
    if (!message.words || message.words.length === 0) {
      return <span>{message.content}</span>;
    }

    // Split content and wrap words with tooltips
    const tokens = message.content.split(/(\s+)/);

    // Helper to clean word for comparison (remove punctuation)
    const cleanWord = (w: string) => w.replace(/[¿¡?!.,;:'"()]/g, '').toLowerCase();

    return tokens.map((token, i) => {
      if (/^\s+$/.test(token)) {
        return <span key={i}>{token}</span>;
      }

      // Find matching word data by comparing cleaned words
      const cleanedToken = cleanWord(token);
      const wordData = message.words?.find(
        (w) => cleanWord(w.word) === cleanedToken
      );

      if (wordData) {
        return (
          <WordTooltip key={i} wordData={wordData}>
            {token}
          </WordTooltip>
        );
      }

      return <span key={i}>{token}</span>;
    });
  };

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          isUser ? "bg-primary" : "gradient-primary"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-primary-foreground" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 shadow-soft",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card text-card-foreground rounded-tl-sm"
        )}
      >
        <p className="leading-relaxed">{renderContent()}</p>
        
        {message.translation && !isUser && (
          <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border/50 italic">
            {message.translation}
          </p>
        )}
        
        <span className="text-xs opacity-60 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
