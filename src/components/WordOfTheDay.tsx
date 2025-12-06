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
  ],
  fr: [
    { word: 'papillon', translation: 'butterfly', pronunciation: 'pah-pee-YON', example: 'Le papillon est magnifique.', partOfSpeech: 'noun' },
    { word: 'rêver', translation: 'to dream', pronunciation: 'reh-VEY', example: "J'aime rêver de voyages.", partOfSpeech: 'verb' },
    { word: 'soleil', translation: 'sun', pronunciation: 'soh-LEY', example: 'Le soleil brille.', partOfSpeech: 'noun' },
  ],
  de: [
    { word: 'Schmetterling', translation: 'butterfly', pronunciation: 'SHMET-ter-ling', example: 'Der Schmetterling ist schön.', partOfSpeech: 'noun' },
    { word: 'träumen', translation: 'to dream', pronunciation: 'TROY-men', example: 'Ich träume von Reisen.', partOfSpeech: 'verb' },
    { word: 'Freundschaft', translation: 'friendship', pronunciation: 'FROYNT-shaft', example: 'Freundschaft ist wichtig.', partOfSpeech: 'noun' },
  ],
  it: [
    { word: 'farfalla', translation: 'butterfly', pronunciation: 'far-FAL-la', example: 'La farfalla è bellissima.', partOfSpeech: 'noun' },
    { word: 'sognare', translation: 'to dream', pronunciation: 'son-YAH-reh', example: 'Mi piace sognare.', partOfSpeech: 'verb' },
    { word: 'amore', translation: 'love', pronunciation: 'ah-MOH-reh', example: "L'amore è bellissimo.", partOfSpeech: 'noun' },
  ],
  pt: [
    { word: 'borboleta', translation: 'butterfly', pronunciation: 'bor-boh-LEH-tah', example: 'A borboleta é linda.', partOfSpeech: 'noun' },
    { word: 'sonhar', translation: 'to dream', pronunciation: 'soh-NYAR', example: 'Gosto de sonhar.', partOfSpeech: 'verb' },
    { word: 'saudade', translation: 'longing/nostalgia', pronunciation: 'sow-DAH-jee', example: 'Tenho saudade de casa.', partOfSpeech: 'noun' },
  ],
  ja: [
    { word: '蝶', translation: 'butterfly', pronunciation: 'chou', example: '蝶がきれいです。', partOfSpeech: 'noun' },
    { word: '夢', translation: 'dream', pronunciation: 'yume', example: '夢を見ました。', partOfSpeech: 'noun' },
    { word: '桜', translation: 'cherry blossom', pronunciation: 'sakura', example: '桜が咲いています。', partOfSpeech: 'noun' },
  ],
  ko: [
    { word: '나비', translation: 'butterfly', pronunciation: 'nabi', example: '나비가 예뻐요.', partOfSpeech: 'noun' },
    { word: '꿈', translation: 'dream', pronunciation: 'kkum', example: '좋은 꿈을 꿨어요.', partOfSpeech: 'noun' },
    { word: '사랑', translation: 'love', pronunciation: 'sarang', example: '사랑해요.', partOfSpeech: 'noun' },
  ],
  zh: [
    { word: '蝴蝶', translation: 'butterfly', pronunciation: 'hú dié', example: '蝴蝶很美丽。', partOfSpeech: 'noun' },
    { word: '梦想', translation: 'dream', pronunciation: 'mèng xiǎng', example: '我有一个梦想。', partOfSpeech: 'noun' },
    { word: '幸福', translation: 'happiness', pronunciation: 'xìng fú', example: '幸福很重要。', partOfSpeech: 'noun' },
  ],
  ru: [
    { word: 'бабочка', translation: 'butterfly', pronunciation: 'BA-boch-ka', example: 'Бабочка очень красивая.', partOfSpeech: 'noun' },
    { word: 'мечтать', translation: 'to dream', pronunciation: 'mech-TAT', example: 'Я люблю мечтать.', partOfSpeech: 'verb' },
    { word: 'звезда', translation: 'star', pronunciation: 'zvez-DA', example: 'Звезда ярко светит.', partOfSpeech: 'noun' },
    { word: 'любовь', translation: 'love', pronunciation: 'lyu-BOV', example: 'Любовь прекрасна.', partOfSpeech: 'noun' },
    { word: 'счастье', translation: 'happiness', pronunciation: 'SCHAS-tye', example: 'Счастье важно.', partOfSpeech: 'noun' },
  ],
  ar: [
    { word: 'فراشة', translation: 'butterfly', pronunciation: 'fa-RA-sha', example: 'الفراشة جميلة.', partOfSpeech: 'noun' },
    { word: 'حلم', translation: 'dream', pronunciation: 'hulm', example: 'عندي حلم كبير.', partOfSpeech: 'noun' },
    { word: 'نجمة', translation: 'star', pronunciation: 'NAJ-ma', example: 'النجمة لامعة.', partOfSpeech: 'noun' },
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
