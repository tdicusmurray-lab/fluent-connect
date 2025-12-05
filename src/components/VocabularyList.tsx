import { useLearningStore } from "@/stores/learningStore";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Volume2, TrendingUp, AlertCircle } from "lucide-react";

export function VocabularyList() {
  const { vocabulary } = useLearningStore();

  const sortedVocab = [...vocabulary].sort((a, b) => b.mastery - a.mastery);
  const masteredWords = sortedVocab.filter(w => w.mastery >= 80);
  const learningWords = sortedVocab.filter(w => w.mastery < 80 && w.mastery >= 40);
  const needsWorkWords = sortedVocab.filter(w => w.mastery < 40);

  const WordCard = ({ word }: { word: typeof vocabulary[0] }) => (
    <div className="bg-card rounded-xl p-4 shadow-soft hover:shadow-card transition-all">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-display font-bold text-lg">{word.word}</span>
          <p className="text-sm text-muted-foreground">{word.pronunciation}</p>
        </div>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      <p className="text-sm mb-3">{word.translation}</p>
      
      <div className="flex items-center gap-2">
        <Progress value={word.mastery} className="flex-1 h-2" />
        <span className={cn(
          "text-xs font-bold",
          word.mastery >= 80 ? "text-success" :
          word.mastery >= 40 ? "text-warning" : "text-destructive"
        )}>
          {word.mastery}%
        </span>
      </div>
      
      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
        <span>✓ {word.timesCorrect}</span>
        <span>✗ {word.timesIncorrect}</span>
      </div>
    </div>
  );

  if (vocabulary.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display font-bold text-lg mb-2">No words yet!</h3>
        <p className="text-muted-foreground">
          Start a conversation to begin learning vocabulary.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {masteredWords.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-success-light flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <h3 className="font-display font-bold">Mastered ({masteredWords.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {masteredWords.map(word => (
              <WordCard key={word.id} word={word} />
            ))}
          </div>
        </div>
      )}

      {learningWords.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-warning-light flex items-center justify-center">
              <span className="text-warning text-sm">📚</span>
            </div>
            <h3 className="font-display font-bold">Learning ({learningWords.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {learningWords.map(word => (
              <WordCard key={word.id} word={word} />
            ))}
          </div>
        </div>
      )}

      {needsWorkWords.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <h3 className="font-display font-bold">Needs Work ({needsWorkWords.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {needsWorkWords.map(word => (
              <WordCard key={word.id} word={word} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
