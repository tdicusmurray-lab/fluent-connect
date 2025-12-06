import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLearningStore } from '@/stores/learningStore';

const tips = [
  {
    title: "Practice Daily",
    content: "Even 5 minutes a day is better than an hour once a week. Consistency builds lasting memory.",
    category: "habit"
  },
  {
    title: "Speak Out Loud",
    content: "Don't just read! Speaking activates different parts of your brain and improves pronunciation.",
    category: "technique"
  },
  {
    title: "Learn in Context",
    content: "Words learned in sentences and stories are remembered 3x longer than isolated vocabulary.",
    category: "science"
  },
  {
    title: "Embrace Mistakes",
    content: "Errors are how your brain learns. Each mistake brings you closer to fluency!",
    category: "mindset"
  },
  {
    title: "Use Story Mode",
    content: "Real-life scenarios help you practice practical conversations you'll actually use.",
    category: "feature"
  },
  {
    title: "Review Before Sleep",
    content: "Your brain consolidates new vocabulary during sleep. A quick review before bed works wonders!",
    category: "science"
  },
  {
    title: "Hover for Translations",
    content: "Click on any word in the AI's response to see its translation and pronunciation.",
    category: "feature"
  },
  {
    title: "Set Goals",
    content: "Complete your daily challenges to earn bonus XP and build momentum.",
    category: "motivation"
  },
  {
    title: "Immerse Yourself",
    content: "Try changing your phone language or listening to music in your target language!",
    category: "technique"
  },
  {
    title: "Celebrate Progress",
    content: "Every new word is a victory. Check your achievements to see how far you've come!",
    category: "mindset"
  },
];

export function LearningTips() {
  const { progress } = useLearningStore();
  const [currentTip, setCurrentTip] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Rotate tip based on user's level/progress
  useEffect(() => {
    const tipIndex = (progress.currentLevel + new Date().getDate()) % tips.length;
    setCurrentTip(tipIndex);
  }, [progress.currentLevel]);

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
  };

  if (dismissed) return null;

  const tip = tips[currentTip];

  return (
    <Card className="p-4 bg-info/5 border-info/20 relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => setDismissed(true)}
      >
        <X className="w-3 h-3" />
      </Button>
      
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5 text-info" />
        </div>
        
        <div className="flex-1 min-w-0 pr-6">
          <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {tip.content}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-info/10">
        <span className="text-xs text-muted-foreground">
          💡 Tip {currentTip + 1} of {tips.length}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevTip}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextTip}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
