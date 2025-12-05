import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { PricingCard } from "@/components/PricingCard";
import { ArrowLeft, Check, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

export default function Pricing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSignedIn } = useUser();
  const { subscribed, isLoading, createCheckout } = useSubscription();

  const handleUpgrade = async () => {
    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to Premium.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      await createCheckout();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const freeFeatures = [
    "150 free messages",
    "Basic story modes",
    "Word tracking",
    "3D AI companion",
  ];

  return (
    <div className="min-h-screen gradient-hero py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Globe className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold text-gradient">LingoLive</span>
          </div>

          <div className="w-20" />
        </header>

        {/* Pricing Content */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Simple, Honest Pricing
            </h1>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="font-display text-2xl font-bold">Free Trial</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Get started with no commitment
                </p>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-6">
                  <span className="text-5xl font-display font-bold">$0</span>
                  <p className="text-muted-foreground text-sm">forever free trial</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {freeFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        <Check className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  Start Free
                </Button>
              </div>
            </div>

            {/* Premium Tier */}
            <PricingCard 
              onUpgrade={handleUpgrade} 
              isLoading={isLoading}
              isSubscribed={subscribed}
            />
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  q: "How does payment work?",
                  a: "We use Stripe for secure payment processing. Your card is charged monthly and you can cancel anytime."
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes! You can cancel your subscription at any time. You'll keep access until the end of your billing period."
                },
                {
                  q: "Can I try before I buy?",
                  a: "Absolutely! You get 150 free messages to try everything before deciding."
                },
                {
                  q: "What languages are supported?",
                  a: "Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Russian, and Arabic."
                },
              ].map((faq, i) => (
                <div key={i} className="bg-card rounded-xl p-5 shadow-soft">
                  <h3 className="font-bold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
