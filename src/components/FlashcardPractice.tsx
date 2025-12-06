import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLearningStore } from '@/stores/learningStore';
import { useVocabulary } from '@/hooks/useVocabulary';
import { Word } from '@/types/learning';
import { 
  RotateCcw, 
  Check, 
  X, 
  Volume2, 
  ArrowRight,
  Sparkles,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FlashcardPracticeProps {
  onClose: () => void;
}

export function FlashcardPractice({ onClose }: FlashcardPracticeProps) {
  const { vocabulary: storeVocabulary, updateWordMastery, addXp } = useLearningStore();
  const { vocabulary: dbVocabulary, updateMastery } = useVocabulary();
  
  const vocabulary = dbVocabulary.length > 0 ? dbVocabulary : storeVocabulary;
  
  const [cards, setCards] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<{ correct: number; incorrect: number }>({ correct: 0, incorrect: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Get words that need practice (mastery < 80) or haven't been practiced recently
    const wordsToReview = vocabulary
      .filter(w => w.mastery < 80 || !w.lastPracticed)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 10);

    if (wordsToReview.length === 0) {
      // If all words are mastered, just shuffle all words
      setCards([...vocabulary].sort(() => Math.random() - 0.5).slice(0, 10));
    } else {
      setCards(wordsToReview);
    }
  }, [vocabulary]);

  const currentCard = cards[currentIndex];
  const progressPercent = ((currentIndex) / cards.length) * 100;

  const handleSpeak = () => {
    if (currentCard && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentCard.word);
      utterance.lang = 'es'; // TODO: use actual target language
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = async (correct: boolean) => {
    if (!currentCard) return;

    // Update mastery
    if (dbVocabulary.length > 0) {
      await updateMastery(currentCard.id, correct);
    } else {
      updateWordMastery(currentCard.id, correct);
    }

    // Update results
    setResults(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    // Update streak
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak === 3) {
        toast.success('🔥 3 in a row!', { description: '+5 bonus XP' });
        addXp(5);
      } else if (newStreak === 5) {
        toast.success('⚡ 5 streak!', { description: '+10 bonus XP' });
        addXp(10);
      }
    } else {
      setStreak(0);
    }

    // Add base XP for answering
    addXp(correct ? 5 : 1);

    // Move to next card or complete
    if (currentIndex >= cards.length - 1) {
      setIsComplete(true);
    } else {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <Brain className="w-16 h-16 mx-auto text-muted-foreground" />
          <h2 className="font-display text-2xl font-bold">No Words to Practice</h2>
          <p className="text-muted-foreground">
            Start some conversations to learn new vocabulary!
          </p>
          <Button onClick={onClose}>Go Back</Button>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    const accuracy = Math.round((results.correct / cards.length) * 100);
    
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="relative">
            <Sparkles className="w-20 h-20 mx-auto text-secondary animate-pulse" />
          </div>
          
          <div>
            <h2 className="font-display text-2xl font-bold">Practice Complete!</h2>
            <p className="text-muted-foreground mt-2">
              You reviewed {cards.length} words
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-success-light rounded-xl">
              <p className="text-2xl font-bold text-success">{results.correct}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-xl">
              <p className="text-2xl font-bold text-destructive">{results.incorrect}</p>
              <p className="text-xs text-muted-foreground">Incorrect</p>
            </div>
            <div className="p-4 bg-info-light rounded-xl">
              <p className="text-2xl font-bold text-info">{accuracy}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Done
            </Button>
            <Button 
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setResults({ correct: 0, incorrect: 0 });
                setIsComplete(false);
                setStreak(0);
              }} 
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Practice Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <Button variant="ghost" onClick={onClose}>
          <X className="w-5 h-5 mr-2" />
          Exit
        </Button>
        <div className="flex items-center gap-4">
          {streak >= 2 && (
            <div className="flex items-center gap-1 text-secondary animate-bounce-slow">
              <span className="text-lg">🔥</span>
              <span className="font-bold">{streak}</span>
            </div>
          )}
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progressPercent} className="h-1 rounded-none" />

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div 
          className="w-full max-w-lg aspect-[3/2] cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div 
            className={cn(
              'relative w-full h-full transition-transform duration-500 transform-style-preserve-3d',
              isFlipped && 'rotate-y-180'
            )}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <Card 
              className="absolute inset-0 p-8 flex flex-col items-center justify-center backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-4xl font-display font-bold mb-4">
                {currentCard?.word}
              </p>
              {currentCard?.pronunciation && (
                <p className="text-muted-foreground mb-4">
                  {currentCard.pronunciation}
                </p>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); handleSpeak(); }}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Listen
              </Button>
              <p className="text-sm text-muted-foreground mt-6">
                Tap to reveal translation
              </p>
            </Card>

            {/* Back */}
            <Card 
              className="absolute inset-0 p-8 flex flex-col items-center justify-center rotate-y-180 backface-hidden bg-gradient-to-br from-card to-muted"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <p className="text-lg text-muted-foreground mb-2">
                {currentCard?.word}
              </p>
              <p className="text-3xl font-display font-bold mb-4">
                {currentCard?.translation}
              </p>
              {currentCard?.partOfSpeech && (
                <p className="text-sm text-muted-foreground italic">
                  {currentCard.partOfSpeech}
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-border">
        <div className="max-w-lg mx-auto flex gap-4">
          <Button 
            variant="destructive" 
            size="lg" 
            className="flex-1"
            onClick={() => handleAnswer(false)}
          >
            <X className="w-5 h-5 mr-2" />
            Still Learning
          </Button>
          <Button 
            size="lg" 
            className="flex-1 gradient-primary"
            onClick={() => handleAnswer(true)}
          >
            <Check className="w-5 h-5 mr-2" />
            Got It!
          </Button>
        </div>
      </div>
    </div>
  );
}
