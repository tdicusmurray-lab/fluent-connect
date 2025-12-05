import { Button } from "@/components/ui/button";
import { Check, Sparkles, DollarSign } from "lucide-react";

interface PricingCardProps {
  onUpgrade: () => void;
}

export function PricingCard({ onUpgrade }: PricingCardProps) {
  const features = [
    "Unlimited conversations",
    "All story modes unlocked",
    "Advanced vocabulary tracking",
    "Pronunciation feedback",
    "Priority support",
    "No ads",
  ];

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
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
            <DollarSign className="w-8 h-8 text-success" />
            <span className="text-5xl font-display font-bold">5</span>
          </div>
          <p className="text-muted-foreground text-sm">one-time payment</p>
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

        <Button onClick={onUpgrade} size="lg" className="w-full">
          Upgrade Now
        </Button>

        <div className="mt-4 p-4 bg-muted rounded-xl">
          <p className="text-sm text-center">
            <span className="font-bold">Pay via CashApp:</span>
            <br />
            <span className="text-primary font-mono">$mycashdirect2022</span>
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          After payment, send screenshot to verify and unlock premium features.
        </p>
      </div>
    </div>
  );
}
