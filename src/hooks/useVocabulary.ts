import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Word } from '@/types/learning';

interface DbVocabulary {
  id: string;
  user_id: string;
  word: string;
  translation: string;
  pronunciation: string | null;
  part_of_speech: string | null;
  mastery_level: number;
  times_seen: number;
  times_correct: number;
  last_practiced: string;
  created_at: string;
}

export function useVocabulary() {
  const { user } = useAuth();
  const [vocabulary, setVocabulary] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const mapDbToWord = (db: DbVocabulary): Word => ({
    id: db.id,
    word: db.word,
    translation: db.translation,
    pronunciation: db.pronunciation || '',
    partOfSpeech: db.part_of_speech || '',
    examples: [],
    mastery: db.mastery_level,
    timesCorrect: db.times_correct,
    timesIncorrect: db.times_seen - db.times_correct,
    lastPracticed: new Date(db.last_practiced),
  });

  useEffect(() => {
    if (!user) {
      setVocabulary([]);
      setLoading(false);
      return;
    }

    const fetchVocabulary = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vocabulary:', error);
        setLoading(false);
        return;
      }

      setVocabulary(data.map(mapDbToWord));
      setLoading(false);
    };

    fetchVocabulary();
  }, [user]);

  const addWord = useCallback(async (word: { word: string; translation: string; pronunciation?: string; partOfSpeech?: string }) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('vocabulary')
      .upsert({
        user_id: user.id,
        word: word.word,
        translation: word.translation,
        pronunciation: word.pronunciation || null,
        part_of_speech: word.partOfSpeech || null,
      }, { onConflict: 'user_id,word' })
      .select()
      .single();

    if (error) {
      console.error('Error adding word:', error);
      return { error: error.message };
    }

    const newWord = mapDbToWord(data);
    setVocabulary(prev => {
      const exists = prev.find(w => w.id === newWord.id);
      if (exists) return prev;
      return [newWord, ...prev];
    });

    return { data: newWord };
  }, [user]);

  const updateMastery = useCallback(async (wordId: string, correct: boolean) => {
    if (!user) return { error: 'Not authenticated' };

    // Find current word
    const currentWord = vocabulary.find(w => w.id === wordId);
    if (!currentWord) return { error: 'Word not found' };

    const newMastery = correct
      ? Math.min(100, currentWord.mastery + 10)
      : Math.max(0, currentWord.mastery - 5);

    const totalSeen = currentWord.timesCorrect + currentWord.timesIncorrect + 1;

    const { data, error } = await supabase
      .from('vocabulary')
      .update({
        mastery_level: newMastery,
        times_seen: totalSeen,
        times_correct: correct ? currentWord.timesCorrect + 1 : currentWord.timesCorrect,
        last_practiced: new Date().toISOString(),
      })
      .eq('id', wordId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating mastery:', error);
      return { error: error.message };
    }

    const updatedWord = mapDbToWord(data);
    setVocabulary(prev => prev.map(w => w.id === wordId ? updatedWord : w));

    return { data: updatedWord };
  }, [user, vocabulary]);

  const deleteWord = useCallback(async (wordId: string) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('vocabulary')
      .delete()
      .eq('id', wordId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting word:', error);
      return { error: error.message };
    }

    setVocabulary(prev => prev.filter(w => w.id !== wordId));
    return { success: true };
  }, [user]);

  const stats = {
    totalWords: vocabulary.length,
    knownWords: vocabulary.filter(w => w.mastery >= 80).length,
    learningWords: vocabulary.filter(w => w.mastery < 80).length,
  };

  return {
    vocabulary,
    loading,
    addWord,
    updateMastery,
    deleteWord,
    stats,
  };
}
