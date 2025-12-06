import { useVocabulary } from "@/hooks/useVocabulary";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Volume2, TrendingUp, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Word } from "@/types/learning";

export function VocabularyList() {
  const { user } = useAuth();
  const { vocabulary, loading, deleteWord, stats } = useVocabulary();

  const sortedVocab = [...vocabulary].sort((a, b) => b.mastery - a.mastery);
  const masteredWords = sortedVocab.filter(w => w.mastery >= 80);
  const learningWords = sortedVocab.filter(w => w.mastery < 80 && w.mastery >= 40);
  const needsWorkWords = sortedVocab.filter(w => w.mastery < 40);

  const handleDelete = async (wordId: string) => {
    await deleteWord(wordId);
  };

  const WordCard = ({ word }: { word: Word }) => (
    <div className="bg-card rounded-xl p-4 shadow-soft hover:shadow-card transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-display font-bold text-lg">{word.word}</span>
          <p className="text-sm text-muted-foreground">{word.pronunciation}</p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          </button>
          {user && (
            <button 
              onClick={() => handleDelete(word.id)}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          )}
        </div>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading vocabulary...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display font-bold text-lg mb-2">Sign in to track vocabulary</h3>
        <p className="text-muted-foreground">
          Your vocabulary will be saved when you're signed in.
        </p>
      </div>
    );
  }

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
      {/* Stats summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{stats.totalWords} total words</span>
        <span className="text-success">{stats.knownWords} mastered</span>
        <span className="text-warning">{stats.learningWords} learning</span>
      </div>

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
