import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressCard } from "@/components/ProgressCard";
import { StoryModeCard } from "@/components/StoryModeCard";
import { ConversationInterface } from "@/components/ConversationInterface";
import { VocabularyList } from "@/components/VocabularyList";
import { LearningPathway } from "@/components/LearningPathway";
import { PremiumTab } from "@/components/PremiumTab";
import { OwlCharacter } from "@/components/OwlCharacter";
import { useLearningStore } from "@/stores/learningStore";
import { storyModes } from "@/data/storyModes";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { 
  MessageCircle, 
  BookOpen, 
  Map, 
  Settings, 
  Crown,
  Globe,
  ArrowLeft,
  Menu,
  X
} from "lucide-react";

type Tab = 'learn' | 'stories' | 'vocabulary' | 'pathway' | 'premium';

export default function Dashboard() {
  const navigate = useNavigate();
  const { createCheckout } = useSubscription();
  const { targetLanguage, setStoryMode, clearMessages, progress } = useLearningStore();
  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [isInConversation, setIsInConversation] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!targetLanguage) {
    navigate("/");
    return null;
  }

  const handleStartConversation = (storyId?: string) => {
    if (storyId) {
      setStoryMode(storyId);
    } else {
      setStoryMode(null);
    }
    clearMessages();
    setIsInConversation(true);
  };

  if (isInConversation) {
    return <ConversationInterface onBack={() => setIsInConversation(false)} />;
  }

  const tabs = [
    { id: 'learn' as Tab, icon: MessageCircle, label: 'Learn' },
    { id: 'stories' as Tab, icon: BookOpen, label: 'Stories' },
    { id: 'vocabulary' as Tab, icon: Globe, label: 'Words' },
    { id: 'pathway' as Tab, icon: Map, label: 'Path' },
    { id: 'premium' as Tab, icon: Crown, label: 'Premium' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">LingoLive</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'gradient-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-2">
            <span className="text-3xl">{targetLanguage.flag}</span>
            <div>
              <p className="font-bold text-sm">{targetLanguage.name}</p>
              <p className="text-xs text-muted-foreground">{targetLanguage.nativeName}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">LingoLive</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="flex overflow-x-auto pb-2 px-2 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:p-8 p-4 pt-32 lg:pt-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'learn' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h2 className="font-display text-2xl font-bold mb-4">
                    Ready to practice?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Start a conversation and your AI tutor will introduce new {targetLanguage.name} words 
                    based on what you already know.
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" onClick={() => handleStartConversation()}>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Free Conversation
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setActiveTab('stories')}>
                      <BookOpen className="w-5 h-5 mr-2" />
                      Story Mode
                    </Button>
                  </div>
                </div>

                <div className="h-[300px] bg-card rounded-2xl shadow-card overflow-hidden">
                  <OwlCharacter />
                </div>
              </div>

              <div>
                <ProgressCard />
              </div>
            </div>
          )}

          {activeTab === 'stories' && (
            <div>
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold mb-2">Story Modes</h2>
                <p className="text-muted-foreground">
                  Practice real-life scenarios and build confidence in specific situations.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {storyModes.map((story) => (
                  <StoryModeCard
                    key={story.id}
                    story={story}
                    onClick={() => handleStartConversation(story.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vocabulary' && (
            <div>
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold mb-2">Your Vocabulary</h2>
                <p className="text-muted-foreground">
                  Track your progress on words you're learning.
                </p>
              </div>
              
              <VocabularyList />
            </div>
          )}

          {activeTab === 'pathway' && (
            <div>
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold mb-2">Learning Pathway</h2>
                <p className="text-muted-foreground">
                  Your personalized journey to fluency in {targetLanguage.name}.
                </p>
              </div>
              
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <LearningPathway />
              </div>
            </div>
          )}

          {activeTab === 'premium' && (
            <PremiumTab 
              progress={progress} 
              createCheckout={createCheckout}
              targetLanguage={targetLanguage}
            />
          )}
        </div>
      </main>
    </div>
  );
}
