import { StoryMode } from "@/types/learning";
import { cn } from "@/lib/utils";
import { ChevronRight, Star } from "lucide-react";

interface StoryModeCardProps {
  story: StoryMode;
  onClick: () => void;
  isSelected?: boolean;
}

const difficultyColors = {
  beginner: "bg-success-light text-success",
  intermediate: "bg-warning-light text-warning",
  advanced: "bg-destructive/10 text-destructive",
};

const difficultyStars = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export function StoryModeCard({ story, onClick, isSelected }: StoryModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-card rounded-2xl p-5 shadow-soft transition-all duration-300 hover:shadow-card hover:scale-[1.02] group",
        isSelected && "ring-2 ring-primary shadow-glow"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{story.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-bold text-foreground truncate">
              {story.title}
            </h3>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", difficultyColors[story.difficulty])}>
              {story.difficulty}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {story.description}
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < difficultyStars[story.difficulty]
                    ? "fill-secondary text-secondary"
                    : "text-muted"
                )}
              />
            ))}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}
