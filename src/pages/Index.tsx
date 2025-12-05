import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OwlCharacter } from "@/components/OwlCharacter";
import { LanguageSelector } from "@/components/LanguageSelector";
import { UserButton } from "@/components/UserButton";
import { useLearningStore } from "@/stores/learningStore";
import { Language } from "@/types/learning";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, MessageCircle, BookOpen, Globe } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { targetLanguage, setTargetLanguage, progress } = useLearningStore();
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language | null>(targetLanguage);

  const handleGetStarted = () => {
    if (targetLanguage) {
      navigate("/dashboard");
    } else {
      setShowLanguageSelect(true);
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLang(lang);
  };

  const handleContinue = () => {
    if (selectedLang) {
      setTargetLanguage(selectedLang);
      toast({
        title: `Let's learn ${selectedLang.name}!`,
        description: "You have 150 free messages to start.",
      });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-gradient">LingoLive</span>
          </div>
          
          <div className="flex items-center gap-3">
            {progress.messagesUsed > 0 && (
              <Button onClick={() => navigate("/dashboard")} variant="outline">
                Continue Learning
              </Button>
            )}
            <UserButton />
          </div>
        </header>

        {!showLanguageSelect ? (
          /* Hero Section */
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            <div className="space-y-6 animate-fade-in">
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Learn by
                <span className="text-gradient"> Talking</span>
                <br />
                Not Typing
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Have real conversations with your AI language tutor. 
                Speak English, get responses in your target language. 
                Learn naturally, just like living abroad.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button onClick={handleGetStarted} size="xl">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Free (150 messages)
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/pricing")}>
                  View Pricing
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Real conversations</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-muted-foreground">Story scenarios</span>
                </div>
              </div>
            </div>

            <div className="h-[400px] lg:h-[500px] animate-scale-in">
              <OwlCharacter />
            </div>
          </div>
        ) : (
          /* Language Selection */
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                What language do you want to learn?
              </h2>
              <p className="text-muted-foreground">
                You'll speak English, and your tutor will respond in your chosen language.
              </p>
            </div>

            <LanguageSelector 
              selectedLanguage={selectedLang} 
              onSelect={handleLanguageSelect} 
            />

            <div className="flex justify-center gap-4 mt-8">
              <Button variant="ghost" onClick={() => setShowLanguageSelect(false)}>
                Back
              </Button>
              <Button 
                onClick={handleContinue} 
                disabled={!selectedLang}
                size="lg"
              >
                Continue with {selectedLang?.name || "..."}
              </Button>
            </div>

            <div className="mt-12 bg-card rounded-2xl p-6 shadow-card text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Sign in to save your progress across devices
              </p>
              <Button onClick={() => navigate("/auth")} variant="outline">
                Sign In / Sign Up
              </Button>
            </div>
          </div>
        )}

        {/* Features Section */}
        {!showLanguageSelect && (
          <section className="py-20">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              Why LingoLive Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🎭",
                  title: "Story Mode Scenarios",
                  description: "Practice ordering at restaurants, shopping, getting directions, and more real-life situations."
                },
                {
                  icon: "🧠",
                  title: "Smart Word Tracking",
                  description: "We remember what you know. New words are introduced gradually based on your progress."
                },
                {
                  icon: "🗣️",
                  title: "Video Conversations",
                  description: "Talk to your AI companion face-to-face with our 3D character that responds to you."
                }
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="bg-card rounded-2xl p-6 shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="text-4xl mb-4 block">{feature.icon}</span>
                  <h3 className="font-display font-bold text-xl mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Index;
