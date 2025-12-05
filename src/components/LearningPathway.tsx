import { cn } from "@/lib/utils";
import { Check, Lock, Star } from "lucide-react";

interface PathwayStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  current: boolean;
  locked: boolean;
}

const pathwaySteps: PathwayStep[] = [
  { id: '1', title: 'Basics', description: 'Greetings & introductions', icon: '👋', completed: true, current: false, locked: false },
  { id: '2', title: 'Numbers', description: 'Count to 100', icon: '🔢', completed: true, current: false, locked: false },
  { id: '3', title: 'Food & Drink', description: 'Restaurant vocabulary', icon: '🍽️', completed: false, current: true, locked: false },
  { id: '4', title: 'Shopping', description: 'Buying essentials', icon: '🛒', completed: false, current: false, locked: false },
  { id: '5', title: 'Travel', description: 'Getting around', icon: '✈️', completed: false, current: false, locked: true },
  { id: '6', title: 'Home & Family', description: 'Daily life', icon: '🏠', completed: false, current: false, locked: true },
  { id: '7', title: 'Work', description: 'Professional vocabulary', icon: '💼', completed: false, current: false, locked: true },
  { id: '8', title: 'Health', description: 'Medical terms', icon: '🏥', completed: false, current: false, locked: true },
];

export function LearningPathway() {
  return (
    <div className="relative">
      {/* Connection line */}
      <div className="absolute left-6 top-0 bottom-0 w-1 bg-muted rounded-full" />
      
      <div className="space-y-4">
        {pathwaySteps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "relative flex items-start gap-4 p-4 rounded-2xl transition-all",
              step.current && "bg-primary/5",
              step.completed && "opacity-80",
              step.locked && "opacity-50"
            )}
          >
            {/* Icon circle */}
            <div
              className={cn(
                "relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0",
                step.completed && "bg-success",
                step.current && "gradient-primary animate-pulse-glow",
                !step.completed && !step.current && !step.locked && "bg-muted",
                step.locked && "bg-muted"
              )}
            >
              {step.completed ? (
                <Check className="w-6 h-6 text-primary-foreground" />
              ) : step.locked ? (
                <Lock className="w-5 h-5 text-muted-foreground" />
              ) : (
                <span>{step.icon}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "font-display font-bold",
                  step.locked && "text-muted-foreground"
                )}>
                  {step.title}
                </h3>
                {step.current && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              
              {step.completed && (
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-secondary text-secondary" />
                  ))}
                </div>
              )}
            </div>

            {/* Progress indicator for current */}
            {step.current && (
              <div className="text-right">
                <span className="text-lg font-bold text-primary">65%</span>
                <p className="text-xs text-muted-foreground">Progress</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
