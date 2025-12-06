import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import { OwlCharacter } from "./OwlCharacter";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { useLearningStore } from "@/stores/learningStore";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useAuth } from "@/hooks/useAuth";
import { storyModes } from "@/data/storyModes";
import { Message, WordInContext } from "@/types/learning";
import { Mic, MicOff, Send, ArrowLeft, Video, VideoOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ConversationInterfaceProps {
  onBack: () => void;
}

export function ConversationInterface({ onBack }: ConversationInterfaceProps) {
  const { messages, addMessage, currentStoryMode, useMessage, progress, addXp, targetLanguage } = useLearningStore();
  const { addWord } = useVocabulary();
  const { user } = useAuth();
  const [inputText, setInputText] = useState("");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentStory = storyModes.find(s => s.id === currentStoryMode);

  // Save words from AI response to database
  const saveWordsToDatabase = async (words: any[]) => {
    if (!user || !words.length) return;
    
    for (const w of words) {
      if (w.isNew && w.word && w.translation) {
        await addWord({
          word: w.word,
          translation: w.translation,
          pronunciation: w.pronunciation,
          partOfSpeech: w.partOfSpeech,
        });
      }
    }
  };

  // Speech recognition hook
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

  // Call AI for response
  const getAIResponse = async (conversationHistory: { role: string; content: string }[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('language-chat', {
        body: {
          messages: conversationHistory,
          targetLanguage: targetLanguage?.name || 'Spanish',
          storyContext: currentStory?.scenario || null,
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to get AI response");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (err) {
      console.error("AI response error:", err);
      throw err;
    }
  };

  // Send initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const sendGreeting = async () => {
        setIsLoading(true);
        setIsSpeaking(true);
        
        try {
          const greeting = currentStory 
            ? `Start the roleplay scenario. Greet me in ${targetLanguage?.name || 'Spanish'}.`
            : `Greet me and ask what I'd like to practice in ${targetLanguage?.name || 'Spanish'}.`;
          
          const response = await getAIResponse([{ role: 'user', content: greeting }]);
          
          const words: WordInContext[] = (response.words || []).map((w: any) => ({
            word: w.word,
            translation: w.translation,
            pronunciation: w.pronunciation || '',
            partOfSpeech: w.partOfSpeech || 'unknown',
            isKnown: false,
            isNew: w.isNew ?? true,
          }));

          // Save new words to database
          saveWordsToDatabase(response.words || []);

          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: response.text,
            translation: response.translation,
            words,
            timestamp: new Date(),
          });

          if (autoSpeak && speechSynthesisSupported && response.text) {
            speak(response.text);
          } else {
            setIsSpeaking(false);
          }
        } catch (err) {
          console.error("Failed to get greeting:", err);
          toast({
            title: "Connection Error",
            description: "Failed to start conversation. Please try again.",
            variant: "destructive",
          });
          setIsSpeaking(false);
        } finally {
          setIsLoading(false);
        }
      };

      sendGreeting();
    }
  }, []);

  const handleSend = async () => {
    const textToSend = inputText.trim();
    if (!textToSend || isLoading) return;

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
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setInputText("");
    addXp(5);

    // Get AI response
    setIsLoading(true);
    setIsSpeaking(true);

    try {
      // Build conversation history
      const conversationHistory = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: textToSend }
      ];

      const response = await getAIResponse(conversationHistory);

      const words: WordInContext[] = (response.words || []).map((w: any) => ({
        word: w.word,
        translation: w.translation,
        pronunciation: w.pronunciation || '',
        partOfSpeech: w.partOfSpeech || 'unknown',
        isKnown: false,
        isNew: w.isNew ?? true,
      }));

      // Save new words to database
      saveWordsToDatabase(response.words || []);

      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        translation: response.translation,
        words,
        timestamp: new Date(),
      });

      addXp(10);

      if (autoSpeak && speechSynthesisSupported && response.text) {
        speak(response.text);
      } else {
        setIsSpeaking(false);
      }
    } catch (err: any) {
      console.error("Failed to get response:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      setIsSpeaking(false);
    } finally {
      setIsLoading(false);
    }
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
            
            {isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Starting conversation...</span>
              </div>
            )}
            
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && messages.length > 0 && (
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
                <span className="text-muted-foreground text-sm">Lingo is typing...</span>
              </div>
            )}
            
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
                disabled={isLoading}
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
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
                placeholder="Type or click mic to speak..."
                disabled={isLoading}
                className="flex-1 bg-muted rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              
              <Button onClick={handleSend} disabled={!displayText.trim() || isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
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
                  {isLoading ? (
                    <span className="text-primary">💭 Thinking...</span>
                  ) : isSynthesizing ? (
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
