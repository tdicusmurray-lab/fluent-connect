import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import { OwlCharacter } from "./OwlCharacter";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { useLearningStore } from "@/stores/learningStore";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { storyModes } from "@/data/storyModes";
import { Message, WordInContext } from "@/types/learning";
import { Mic, MicOff, Send, ArrowLeft, Video, VideoOff, Volume2, VolumeX, Loader2, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ConversationInterfaceProps {
  onBack: () => void;
}

export function ConversationInterface({ onBack }: ConversationInterfaceProps) {
  const navigate = useNavigate();
  const { messages, addMessage, currentStoryMode, useMessage, progress, addXp, targetLanguage } = useLearningStore();
  const { addWord } = useVocabulary();
  const { user, isSignedIn, isLoading: authLoading } = useAuth();
  const { syncProgressToDatabase } = useProfile();
  const [inputText, setInputText] = useState("");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [greetingSent, setGreetingSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const currentStory = storyModes.find(s => s.id === currentStoryMode);
  const messagesRemaining = progress.messagesLimit - progress.messagesUsed;
  const displayText = inputText || (isListening ? interimTranscript : '');

  // Save words from AI response to database
  const saveWordsToDatabase = useCallback(async (words: any[]) => {
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
  }, [user, addWord]);

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

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send initial greeting
  useEffect(() => {
    if (messages.length === 0 && isSignedIn && !authLoading && !greetingSent) {
      setGreetingSent(true);
      
      const sendGreeting = async () => {
        setIsLoading(true);
        setIsSpeaking(true);
        
        try {
          const greeting = currentStory 
            ? `Start the roleplay scenario. Greet me in ${targetLanguage?.name || 'Spanish'}.`
            : `Greet me and ask what I'd like to practice in ${targetLanguage?.name || 'Spanish'}.`;
          
          const { data, error } = await supabase.functions.invoke('language-chat', {
            body: {
              messages: [{ role: 'user', content: greeting }],
              targetLanguage: targetLanguage?.name || 'Spanish',
              storyContext: currentStory?.scenario || null,
            }
          });

          if (error) throw new Error(error.message || "Failed to get AI response");
          if (data.error) throw new Error(data.error);
          
          const words: WordInContext[] = (data.words || []).map((w: any) => ({
            word: w.word,
            translation: w.translation,
            pronunciation: w.pronunciation || '',
            partOfSpeech: w.partOfSpeech || 'unknown',
            isKnown: false,
            isNew: w.isNew ?? true,
          }));

          // Save new words to database
          saveWordsToDatabase(data.words || []);

          addMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: data.text,
            translation: data.translation,
            words,
            timestamp: new Date(),
          });

          if (autoSpeak && speechSynthesisSupported && data.text) {
            speak(data.text);
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
  }, [isSignedIn, authLoading, messages.length, greetingSent, currentStory, targetLanguage, autoSpeak, speechSynthesisSupported, speak, toast, addMessage, saveWordsToDatabase]);

  // Sync progress when leaving the conversation
  const handleBack = useCallback(async () => {
    if (user && messages.length > 0) {
      await syncProgressToDatabase();
      toast({
        title: "Progress saved",
        description: "Your XP and streak have been saved.",
      });
    }
    onBack();
  }, [user, messages.length, syncProgressToDatabase, toast, onBack]);

  const handleSend = useCallback(async () => {
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

      const { data, error } = await supabase.functions.invoke('language-chat', {
        body: {
          messages: conversationHistory,
          targetLanguage: targetLanguage?.name || 'Spanish',
          storyContext: currentStory?.scenario || null,
        }
      });

      if (error) throw new Error(error.message || "Failed to get AI response");
      if (data.error) throw new Error(data.error);

      const words: WordInContext[] = (data.words || []).map((w: any) => ({
        word: w.word,
        translation: w.translation,
        pronunciation: w.pronunciation || '',
        partOfSpeech: w.partOfSpeech || 'unknown',
        isKnown: false,
        isNew: w.isNew ?? true,
      }));

      // Save new words to database
      saveWordsToDatabase(data.words || []);

      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text,
        translation: data.translation,
        words,
        timestamp: new Date(),
      });

      addXp(10);

      if (autoSpeak && speechSynthesisSupported && data.text) {
        speak(data.text);
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
  }, [inputText, isLoading, isListening, stopListening, resetTranscript, useMessage, toast, addMessage, addXp, messages, targetLanguage, currentStory, saveWordsToDatabase, autoSpeak, speechSynthesisSupported, speak]);

  const handleMicClick = useCallback(() => {
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
  }, [speechRecognitionSupported, toast, isListening, resetTranscript, toggleListening]);

  const toggleAutoSpeak = useCallback(() => {
    if (isSynthesizing) {
      stopSpeaking();
    }
    setAutoSpeak(prev => !prev);
  }, [isSynthesizing, stopSpeaking]);

  // Show loading skeleton while checking auth
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <div className="w-64 h-64 bg-muted rounded-2xl animate-pulse" />
        <div className="space-y-3 w-full max-w-sm">
          <div className="h-8 bg-muted rounded-lg animate-pulse" />
          <div className="h-4 bg-muted rounded-lg animate-pulse w-3/4 mx-auto" />
          <div className="h-4 bg-muted rounded-lg animate-pulse w-1/2 mx-auto" />
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
          <div className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
        <div className="w-64 h-64">
          <OwlCharacter isSpeaking={false} />
        </div>
        <h2 className="text-2xl font-display font-bold">Sign In to Start Learning</h2>
        <p className="text-muted-foreground max-w-md">
          You need to be signed in to have conversations with our AI language tutor and track your progress.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={() => navigate('/auth')}>
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
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
            variant={autoSpeak ? "default" : "secondary"}
            size="icon"
            onClick={toggleAutoSpeak}
            title={autoSpeak ? "Auto-speak enabled" : "Auto-speak disabled"}
          >
            {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button
            variant={isVideoOn ? "default" : "secondary"}
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
                    "Thinking..."
                  ) : isSpeaking || isSynthesizing ? (
                    "Speaking..."
                  ) : (
                    "Ready to help you learn!"
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
