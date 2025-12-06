import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLearningStore } from '@/stores/learningStore';
import { Volume2, BookmarkPlus, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Sample words of the day for different languages
const wordsOfTheDay: Record<string, { word: string; translation: string; pronunciation: string; example: string; partOfSpeech: string }[]> = {
  es: [
    { word: 'mariposa', translation: 'butterfly', pronunciation: 'mah-ree-POH-sah', example: 'La mariposa es muy bonita.', partOfSpeech: 'noun' },
    { word: 'soñar', translation: 'to dream', pronunciation: 'soh-NYAR', example: 'Me gusta soñar con viajes.', partOfSpeech: 'verb' },
    { word: 'amanecer', translation: 'sunrise/dawn', pronunciation: 'ah-mah-neh-SEHR', example: 'El amanecer es hermoso.', partOfSpeech: 'noun' },
    { word: 'esperanza', translation: 'hope', pronunciation: 'es-peh-RAHN-sah', example: 'Tengo esperanza en el futuro.', partOfSpeech: 'noun' },
    { word: 'estrella', translation: 'star', pronunciation: 'es-TREH-yah', example: 'Mira esa estrella brillante.', partOfSpeech: 'noun' },
    { word: 'sonrisa', translation: 'smile', pronunciation: 'sohn-REE-sah', example: 'Tu sonrisa es contagiosa.', partOfSpeech: 'noun' },
    { word: 'corazón', translation: 'heart', pronunciation: 'koh-rah-SOHN', example: 'Mi corazón late rápido.', partOfSpeech: 'noun' },
  ],
  fr: [
    { word: 'papillon', translation: 'butterfly', pronunciation: 'pah-pee-YON', example: 'Le papillon est magnifique.', partOfSpeech: 'noun' },
    { word: 'rêver', translation: 'to dream', pronunciation: 'reh-VEY', example: "J'aime rêver de voyages.", partOfSpeech: 'verb' },
    { word: 'soleil', translation: 'sun', pronunciation: 'soh-LEY', example: 'Le soleil brille.', partOfSpeech: 'noun' },
  ],
  de: [
    { word: 'Schmetterling', translation: 'butterfly', pronunciation: 'SHMET-ter-ling', example: 'Der Schmetterling ist schön.', partOfSpeech: 'noun' },
    { word: 'träumen', translation: 'to dream', pronunciation: 'TROY-men', example: 'Ich träume von Reisen.', partOfSpeech: 'verb' },
  ],
  it: [
    { word: 'farfalla', translation: 'butterfly', pronunciation: 'far-FAL-la', example: 'La farfalla è bellissima.', partOfSpeech: 'noun' },
    { word: 'sognare', translation: 'to dream', pronunciation: 'son-YAH-reh', example: 'Mi piace sognare.', partOfSpeech: 'verb' },
  ],
};

export function WordOfTheDay() {
  const { targetLanguage, addWord, addXp, vocabulary } = useLearningStore();
  const [todayWord, setTodayWord] = useState<typeof wordsOfTheDay['es'][0] | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (!targetLanguage) return;

    const langCode = targetLanguage.code;
    const words = wordsOfTheDay[langCode] || wordsOfTheDay['es'];
    
    // Use date as seed for consistent daily word
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const wordIndex = dayOfYear % words.length;
    
    setTodayWord(words[wordIndex]);
    
    // Check if already added
    const alreadyAdded = vocabulary.some(v => v.word === words[wordIndex].word);
    setIsAdded(alreadyAdded);
  }, [targetLanguage, vocabulary]);

  const handleSpeak = () => {
    if (todayWord && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(todayWord.word);
      utterance.lang = targetLanguage?.code || 'es';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAddToVocabulary = () => {
    if (!todayWord || isAdded) return;

    addWord({
      id: `wotd-${Date.now()}`,
      word: todayWord.word,
      translation: todayWord.translation,
      pronunciation: todayWord.pronunciation,
      partOfSpeech: todayWord.partOfSpeech,
      examples: [todayWord.example],
      mastery: 0,
      timesCorrect: 0,
      timesIncorrect: 0,
    });
    
    addXp(10);
    setIsAdded(true);
    
    toast.success('Word added!', {
      description: `"${todayWord.word}" added to your vocabulary. +10 XP`,
    });
  };

  if (!todayWord) return null;

  return (
    <Card className="p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-24 h-24 gradient-secondary opacity-20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-secondary" />
          <h3 className="font-display font-bold text-sm">Word of the Day</h3>
          <Badge variant="outline" className="text-xs ml-auto">
            {targetLanguage?.flag} {targetLanguage?.name}
          </Badge>
        </div>

        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-2xl font-display font-bold">{todayWord.word}</p>
            <p className="text-sm text-muted-foreground">{todayWord.pronunciation}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSpeak}>
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-lg mb-1">{todayWord.translation}</p>
        <Badge variant="secondary" className="text-xs mb-3">
          {todayWord.partOfSpeech}
        </Badge>

        <div className="bg-muted rounded-lg p-3 mb-3">
          <p className="text-sm italic text-muted-foreground">
            "{todayWord.example}"
          </p>
        </div>

        <Button 
          onClick={handleAddToVocabulary} 
          disabled={isAdded}
          className="w-full"
          variant={isAdded ? "secondary" : "default"}
        >
          {isAdded ? (
            <>Added to vocabulary ✓</>
          ) : (
            <>
              <BookmarkPlus className="w-4 h-4 mr-2" />
              Add to vocabulary (+10 XP)
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
