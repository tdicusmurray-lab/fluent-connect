import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2 } from "lucide-react";

interface PricingCardProps {
  onUpgrade: () => void;
  isLoading?: boolean;
  isSubscribed?: boolean;
}

export function PricingCard({ onUpgrade, isLoading, isSubscribed }: PricingCardProps) {
  const features = [
    "Unlimited conversations",
    "All story modes unlocked",
    "Advanced vocabulary tracking",
    "Pronunciation feedback",
    "Priority support",
    "No ads",
  ];

  return (
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
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-success-light flex items-center justify-center">
                <Check className="w-3 h-3 text-success" />
              </div>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {isSubscribed ? (
          <Button disabled size="lg" className="w-full" variant="secondary">
            <Check className="w-4 h-4 mr-2" />
            Currently Subscribed
          </Button>
        ) : (
          <Button 
            onClick={onUpgrade} 
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
        )}

        <p className="text-xs text-muted-foreground text-center mt-4">
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
