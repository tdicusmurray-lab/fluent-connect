import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { 
  Check, 
  Sparkles, 
  Loader2, 
  MessageCircle, 
  BookOpen, 
  BarChart3, 
  Mic, 
  Headphones, 
  Ban,
  Crown,
  Infinity,
  Settings
} from "lucide-react";

interface PremiumTabProps {
  progress: {
    messagesUsed: number;
    messagesLimit: number;
    isPremium: boolean;
  };
  createCheckout: () => Promise<void>;
  targetLanguage: {
    name: string;
    flag: string;
  };
}

const premiumFeatures = [
  {
    icon: Infinity,
    title: "Unlimited Conversations",
    description: "Practice as much as you want with no message limits",
  },
  {
    icon: BookOpen,
    title: "All Story Modes",
    description: "Access every scenario from restaurants to job interviews",
  },
  {
    icon: BarChart3,
    title: "Advanced Vocabulary Tracking",
    description: "Detailed analytics on your word mastery and progress",
  },
  {
    icon: Mic,
    title: "Pronunciation Feedback",
    description: "Get real-time feedback on your speaking accuracy",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description: "Get help faster with dedicated support access",
  },
  {
    icon: Ban,
    title: "No Ads",
    description: "Enjoy an uninterrupted learning experience",
  },
];

export function PremiumTab({ progress, createCheckout, targetLanguage }: PremiumTabProps) {
  const { subscribed, isLoading, subscriptionEnd } = useSubscription();

  if (subscribed) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Subscribed Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-2">
            You're a Premium Member!
          </h2>
          <p className="text-muted-foreground">
            Enjoy unlimited access to all LingoLive features
          </p>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-card rounded-2xl p-6 shadow-card border-2 border-primary">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">LingoLive Premium</h3>
                <p className="text-sm text-muted-foreground">Active Subscription</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold">$4.99</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>
          
          {subscriptionEnd && (
            <div className="bg-muted/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-muted-foreground">
                Next billing date: <span className="font-medium text-foreground">
                  {new Date(subscriptionEnd).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </p>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={() => window.open('mailto:support@lingolive.app')}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Subscription
          </Button>
        </div>

        {/* Unlocked Features Grid */}
        <div>
          <h3 className="font-display text-xl font-bold mb-4 text-center">
            Your Unlocked Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {premiumFeatures.map((feature, i) => (
              <div 
                key={i} 
                className="bg-card rounded-xl p-4 shadow-soft border border-border flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm">{feature.title}</h4>
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Stats */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h3 className="font-display text-lg font-bold mb-4">Your Learning Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-3xl font-display font-bold text-primary">{progress.messagesUsed}</p>
              <p className="text-sm text-muted-foreground">Messages sent</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-3xl font-display font-bold text-primary">∞</p>
              <p className="text-sm text-muted-foreground">Messages remaining</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Non-subscribed view
  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="font-display text-2xl font-bold mb-2">Upgrade to Premium</h2>
        <p className="text-muted-foreground">
          You've used {progress.messagesUsed} of your {progress.messagesLimit} free messages.
        </p>
      </div>
      
      <div className="bg-card rounded-2xl shadow-card overflow-hidden border-2 border-primary">
        <div className="gradient-primary p-6 text-center">
          <Sparkles className="w-10 h-10 text-primary-foreground mx-auto mb-3" />
          <h3 className="font-display text-2xl font-bold text-primary-foreground">
            LingoLive Premium
          </h3>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Unlock your full potential
          </p>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl text-muted-foreground">$</span>
              <span className="text-5xl font-display font-bold">4.99</span>
            </div>
            <p className="text-muted-foreground text-sm">per month</p>
          </div>

          <ul className="space-y-3 mb-6">
            {premiumFeatures.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span className="text-sm">{feature.title}</span>
              </li>
            ))}
          </ul>

          <Button 
            onClick={createCheckout} 
            size="lg" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Subscribe Now'
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
