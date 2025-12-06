import { useState } from "react";
import { StoryMode } from "@/types/learning";
import { cn } from "@/lib/utils";
import { ChevronRight, Star, Eye } from "lucide-react";
import { OwlCharacter } from "./OwlCharacter";
import { useLearningStore } from "@/stores/learningStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [previewOpen, setPreviewOpen] = useState(false);
  const setStoryMode = useLearningStore(state => state.setStoryMode);

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Temporarily set the story mode so the owl shows the correct background
    setStoryMode(story.id);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    // Reset story mode when closing preview
    setStoryMode(null);
  };

  const handleStartFromPreview = () => {
    setPreviewOpen(false);
    onClick();
  };

  return (
    <>
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left bg-card rounded-2xl p-5 shadow-soft transition-all duration-300 hover:shadow-card hover:scale-[1.02] group relative",
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
            <div className="flex items-center justify-between">
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
              <button
                onClick={handlePreview}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-muted"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </button>

      <Dialog open={previewOpen} onOpenChange={handleClosePreview}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{story.icon}</span>
              {story.title}
            </DialogTitle>
            <DialogDescription>{story.description}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Owl Character Preview */}
            <div className="h-[280px] bg-muted rounded-xl overflow-hidden">
              <OwlCharacter isSpeaking={false} />
            </div>

            {/* Scenario Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">Objectives</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {story.objectives.slice(0, 3).map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">Vocabulary Focus</h4>
                <div className="flex flex-wrap gap-1.5">
                  {story.vocabularyFocus.slice(0, 6).map((vocab, i) => (
                    <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {vocab}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Difficulty & Action */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", difficultyColors[story.difficulty])}>
                  {story.difficulty}
                </span>
                <div className="flex items-center gap-0.5">
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
              <Button onClick={handleStartFromPreview}>
                Start Conversation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
