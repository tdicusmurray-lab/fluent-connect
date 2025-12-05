import { useState, useCallback, useRef } from 'react';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(language: string = 'en-US'): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Check support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionAPI = typeof window !== 'undefined' 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition 
    : null;
  const isSupported = !!SpeechRecognitionAPI;

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    // Create new instance each time to avoid state issues
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      setError(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      console.log('Speech recognition result:', event);
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      if (final) {
        setTranscript(prev => prev + (prev ? ' ' : '') + final);
        setInterimTranscript('');
      } else {
        setInterimTranscript(interim);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setError('Failed to start speech recognition. Please check microphone permissions.');
    }
  }, [SpeechRecognitionAPI, language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    isSupported,
    error,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}
