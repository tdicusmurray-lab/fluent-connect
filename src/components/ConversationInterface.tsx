import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import { OwlCharacter } from "./OwlCharacter";
import { useLearningStore } from "@/stores/learningStore";
import { storyModes } from "@/data/storyModes";
import { Message, WordInContext } from "@/types/learning";
import { Mic, MicOff, Send, ArrowLeft, Video, VideoOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversationInterfaceProps {
  onBack: () => void;
}

// Mock responses for demo - in production this would use AI
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
    }
  ],
  default: [
    {
      text: "¡Hola! ¿Cómo estás hoy?",
      translation: "Hello! How are you today?",
      words: [
        { word: "Hola", translation: "Hello", pronunciation: "OH-lah", partOfSpeech: "interjection", isKnown: true, isNew: false },
        { word: "Cómo", translation: "How", pronunciation: "KOH-moh", partOfSpeech: "adverb", isKnown: false, isNew: true },
        { word: "estás", translation: "are you", pronunciation: "es-TAHS", partOfSpeech: "verb", isKnown: false, isNew: false },
        { word: "hoy", translation: "today", pronunciation: "oy", partOfSpeech: "adverb", isKnown: false, isNew: true },
      ]
    }
  ]
};

export function ConversationInterface({ onBack }: ConversationInterfaceProps) {
  const { messages, addMessage, currentStoryMode, useMessage, progress, addXp } = useLearningStore();
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [responseIndex, setResponseIndex] = useState(0);

  const currentStory = storyModes.find(s => s.id === currentStoryMode);

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
        setTimeout(() => setIsSpeaking(false), 2000);
      }, 1000);
    }
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;

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
      content: inputText,
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
      setTimeout(() => setIsSpeaking(false), 2000);
    }, 1500);
  };

  const toggleRecording = () => {
    if (!isRecording) {
      toast({
        title: "Voice recording",
        description: "Speak in English - I'll respond in your target language!",
      });
    }
    setIsRecording(!isRecording);
  };

  const messagesRemaining = progress.messagesLimit - progress.messagesUsed;

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
              {messagesRemaining} messages remaining
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-3">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                onClick={toggleRecording}
                className="shrink-0"
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
              
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type in English..."
                className="flex-1 bg-muted rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              
              <Button onClick={handleSend} disabled={!inputText.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video/Character panel */}
        {isVideoOn && (
          <div className="w-80 border-l border-border bg-card hidden lg:block">
            <div className="h-full flex flex-col">
              <div className="flex-1 bg-muted/50">
                <OwlCharacter isSpeaking={isSpeaking} />
              </div>
              <div className="p-4 border-t border-border">
                <h3 className="font-display font-bold text-sm mb-2">Lingo</h3>
                <p className="text-xs text-muted-foreground">
                  Your AI language companion. Hover over words for translations!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
