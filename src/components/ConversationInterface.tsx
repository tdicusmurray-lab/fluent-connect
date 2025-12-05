import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import { OwlCharacter } from "./OwlCharacter";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { useLearningStore } from "@/stores/learningStore";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { storyModes } from "@/data/storyModes";
import { Message, WordInContext } from "@/types/learning";
import { Mic, MicOff, Send, ArrowLeft, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversationInterfaceProps {
  onBack: () => void;
}

// Mock responses for demo
const mockResponses: Record<string, { text: string; translation: string; words: WordInContext[] }[]> = {
  restaurant: [
    {
      text: "¡Buenas tardes! Bienvenido a nuestro restaurante. ¿Mesa para cuántos?",
      translation: "Good afternoon! Welcome to our restaurant. Table for how many?",
      words: [
        { word: "Buenas", translation: "Good", pronunciation: "BWEH-nahs", partOfSpeech: "adjective", isKnown: true, isNew: false },
        { word: "tardes", translation: "afternoon", pronunciation: "TAR-des", partOfSpeech: "noun", isKnown: false, isNew: true },
        { word: "Bienvenido", translation: "Welcome", pronunciation: "byen-beh-NEE-doh", partOfSpeech: "adjective", isKnown: false, isNew: true },
        { word: "restaurante", translation: "restaurant", pronunciation: "res-tow-RAHN-teh", partOfSpeech: "noun", isKnown: true, isNew: false },
        { word: "Mesa", translation: "Table", pronunciation: "MEH-sah", partOfSpeech: "noun", isKnown: false, isNew: true },
        { word: "cuántos", translation: "how many", pronunciation: "KWAHN-tohs", partOfSpeech: "pronoun", isKnown: false, isNew: false },
      ]
    },
    {
      text: "Perfecto. Por aquí, por favor. Aquí tiene el menú.",
      translation: "Perfect. This way, please. Here is the menu.",
      words: [
        { word: "Perfecto", translation: "Perfect", pronunciation: "per-FEK-toh", partOfSpeech: "adjective", isKnown: true, isNew: false },
        { word: "aquí", translation: "here", pronunciation: "ah-KEE", partOfSpeech: "adverb", isKnown: false, isNew: true },
        { word: "favor", translation: "please", pronunciation: "fah-VOR", partOfSpeech: "noun", isKnown: true, isNew: false },
        { word: "tiene", translation: "have/has", pronunciation: "TYEH-neh", partOfSpeech: "verb", isKnown: false, isNew: true },
        { word: "menú", translation: "menu", pronunciation: "meh-NOO", partOfSpeech: "noun", isKnown: true, isNew: false },
      ]
    },
    {
      text: "¿Qué le gustaría beber? Tenemos agua, vino, y cerveza.",
      translation: "What would you like to drink? We have water, wine, and beer.",
      words: [
        { word: "gustaría", translation: "would like", pronunciation: "goos-tah-REE-ah", partOfSpeech: "verb", isKnown: false, isNew: true },
        { word: "beber", translation: "to drink", pronunciation: "beh-BEHR", partOfSpeech: "verb", isKnown: false, isNew: true },
        { word: "Tenemos", translation: "We have", pronunciation: "teh-NEH-mos", partOfSpeech: "verb", isKnown: false, isNew: false },
        { word: "agua", translation: "water", pronunciation: "AH-gwah", partOfSpeech: "noun", isKnown: true, isNew: false },
        { word: "vino", translation: "wine", pronunciation: "BEE-noh", partOfSpeech: "noun", isKnown: false, isNew: true },
        { word: "cerveza", translation: "beer", pronunciation: "sehr-BEH-sah", partOfSpeech: "noun", isKnown: false, isNew: true },
      ]
    }
  ],
  default: [
    {
      text: "¡Hola! ¿Cómo estás hoy? Me alegro de verte.",
      translation: "Hello! How are you today? I'm glad to see you.",
      words: [
        { word: "Hola", translation: "Hello", pronunciation: "OH-lah", partOfSpeech: "interjection", isKnown: true, isNew: false },
        { word: "Cómo", translation: "How", pronunciation: "KOH-moh", partOfSpeech: "adverb", isKnown: false, isNew: true },
        { word: "estás", translation: "are you", pronunciation: "es-TAHS", partOfSpeech: "verb", isKnown: false, isNew: false },
        { word: "hoy", translation: "today", pronunciation: "oy", partOfSpeech: "adverb", isKnown: false, isNew: true },
        { word: "alegro", translation: "glad", pronunciation: "ah-LEH-groh", partOfSpeech: "verb", isKnown: false, isNew: true },
        { word: "verte", translation: "to see you", pronunciation: "BEHR-teh", partOfSpeech: "verb", isKnown: false, isNew: true },
      ]
    },
    {
      text: "¡Qué bien! ¿Qué te gustaría practicar hoy?",
      translation: "Great! What would you like to practice today?",
      words: [
        { word: "Qué", translation: "What/How", pronunciation: "keh", partOfSpeech: "pronoun", isKnown: true, isNew: false },
        { word: "bien", translation: "good/well", pronunciation: "byen", partOfSpeech: "adverb", isKnown: true, isNew: false },
        { word: "gustaría", translation: "would like", pronunciation: "goos-tah-REE-ah", partOfSpeech: "verb", isKnown: false, isNew: false },
        { word: "practicar", translation: "to practice", pronunciation: "prahk-tee-KAHR", partOfSpeech: "verb", isKnown: false, isNew: true },
      ]
    }
  ]
};

export function ConversationInterface({ onBack }: ConversationInterfaceProps) {
  const { messages, addMessage, currentStoryMode, useMessage, progress, addXp, targetLanguage } = useLearningStore();
  const [inputText, setInputText] = useState("");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [responseIndex, setResponseIndex] = useState(0);

  const currentStory = storyModes.find(s => s.id === currentStoryMode);

  // Speech recognition hook - simplified API
  const {
    isListening,
    isSupported: speechRecognitionSupported,
    error: speechError,
    transcript,
    interimTranscript,
    toggleListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition('en-US');

  // Speech synthesis hook
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking: isSynthesizing,
    isSupported: speechSynthesisSupported,
  } = useSpeechSynthesis({
    lang: targetLanguage?.code || 'es',
    onStart: () => setIsSpeaking(true),
    onEnd: () => setIsSpeaking(false),
  });

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Show errors
  useEffect(() => {
    if (speechError) {
      toast({
        title: "Microphone Error",
        description: speechError === 'not-allowed' 
          ? "Microphone access denied. Please allow microphone permissions." 
          : `Speech recognition error: ${speechError}`,
        variant: "destructive",
      });
    }
  }, [speechError, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Send initial greeting when entering conversation
    if (messages.length === 0) {
      const storyKey = currentStoryMode || 'default';
      const responses = mockResponses[storyKey] || mockResponses.default;
      const response = responses[0];
      
      setTimeout(() => {
        setIsSpeaking(true);
        addMessage({
          id: Date.now().toString(),
          role: 'assistant',
          content: response.text,
          translation: response.translation,
          words: response.words,
          timestamp: new Date(),
        });
        
        if (autoSpeak && speechSynthesisSupported) {
          speak(response.text);
        } else {
          setTimeout(() => setIsSpeaking(false), 2000);
        }
      }, 1000);
    }
  }, []);

  const handleSend = () => {
    const textToSend = inputText.trim();
    if (!textToSend) return;

    // Stop listening if active
    if (isListening) {
      stopListening();
    }
    resetTranscript();

    if (!useMessage()) {
      toast({
        title: "Out of messages!",
        description: "Upgrade to premium for unlimited conversations.",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    });

    setInputText("");
    addXp(5);

    // Simulate AI response
    setTimeout(() => {
      setIsSpeaking(true);
      const storyKey = currentStoryMode || 'default';
      const responses = mockResponses[storyKey] || mockResponses.default;
      const nextIndex = (responseIndex + 1) % responses.length;
      const response = responses[nextIndex];
      
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        translation: response.translation,
        words: response.words,
        timestamp: new Date(),
      });
      
      setResponseIndex(nextIndex);
      addXp(10);
      
      if (autoSpeak && speechSynthesisSupported) {
        speak(response.text);
      } else {
        setTimeout(() => setIsSpeaking(false), 2000);
      }
    }, 1500);
  };

  const handleMicClick = () => {
    if (!speechRecognitionSupported) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in your browser. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isListening) {
      resetTranscript();
      setInputText("");
    }
    
    toggleListening();
  };

  const toggleAutoSpeak = () => {
    if (isSynthesizing) {
      stopSpeaking();
    }
    setAutoSpeak(!autoSpeak);
  };

  const messagesRemaining = progress.messagesLimit - progress.messagesUsed;
  const displayText = inputText || (isListening ? interimTranscript : '');

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-display font-bold">
              {currentStory ? currentStory.title : "Free Conversation"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {messagesRemaining} messages remaining • {targetLanguage?.flag} {targetLanguage?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoSpeak ? "default" : "muted"}
            size="icon"
            onClick={toggleAutoSpeak}
            title={autoSpeak ? "Auto-speak enabled" : "Auto-speak disabled"}
          >
            {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button
            variant={isVideoOn ? "default" : "muted"}
            size="icon"
            onClick={() => setIsVideoOn(!isVideoOn)}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentStory && (
              <div className="bg-muted rounded-xl p-4 mb-4">
                <p className="text-sm text-muted-foreground italic">
                  📖 {currentStory.scenario}
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-border p-4 bg-card">
            {/* Listening indicator */}
            {isListening && (
              <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
                <VoiceVisualizer isActive={isListening} />
                <div className="flex-1">
                  <p className="text-xs text-destructive font-medium mb-1">🎤 Listening... Speak in English</p>
                  <p className="text-sm">
                    {transcript && <span className="text-foreground">{transcript} </span>}
                    {interimTranscript && <span className="text-muted-foreground italic">{interimTranscript}</span>}
                    {!transcript && !interimTranscript && (
                      <span className="text-muted-foreground">Say something...</span>
                    )}
                  </p>
                </div>
                <Button size="sm" variant="destructive" onClick={stopListening}>
                  Stop
                </Button>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                variant={isListening ? "destructive" : "default"}
                size="icon"
                onClick={handleMicClick}
                className={`shrink-0 relative ${isListening ? 'animate-pulse' : ''}`}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
                {isListening && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping" />
                )}
              </Button>
              
              <input
                type="text"
                value={displayText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type or click mic to speak..."
                className="flex-1 bg-muted rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              
              <Button onClick={handleSend} disabled={!displayText.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </div>

            {!speechRecognitionSupported && (
              <p className="text-xs text-warning mt-2 text-center">
                ⚠️ Voice input requires Chrome, Edge, or Safari
              </p>
            )}
          </div>
        </div>

        {/* Video/Character panel */}
        {isVideoOn && (
          <div className="w-80 border-l border-border bg-card hidden lg:block">
            <div className="h-full flex flex-col">
              <div className="flex-1 bg-muted/50">
                <OwlCharacter isSpeaking={isSpeaking || isSynthesizing} />
              </div>
              <div className="p-4 border-t border-border">
                <h3 className="font-display font-bold text-sm mb-2">Lingo</h3>
                <p className="text-xs text-muted-foreground">
                  {isSynthesizing ? (
                    <span className="text-primary">🔊 Speaking...</span>
                  ) : isListening ? (
                    <span className="text-destructive">🎤 Listening to you...</span>
                  ) : (
                    "Click the mic to speak, or type. Hover over words for translations!"
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
