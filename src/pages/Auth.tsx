import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Globe, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSignedIn, isLoading: authLoading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isSignedIn) {
      navigate("/dashboard");
    }
  }, [authLoading, isSignedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'sign-in') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          navigate("/dashboard");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account created!",
            description: "You can now start learning.",
          });
          navigate("/dashboard");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="bg-card rounded-2xl shadow-card p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Globe className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold">
              {mode === 'sign-up' ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === 'sign-up' 
                ? "Start your language learning journey" 
                : "Continue your learning journey"}
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="bg-muted rounded-xl p-1 flex">
              <button
                onClick={() => setMode('sign-in')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'sign-in' 
                    ? 'bg-card shadow-soft text-foreground' 
                    : 'text-muted-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('sign-up')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'sign-up' 
                    ? 'bg-card shadow-soft text-foreground' 
                    : 'text-muted-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="rounded-xl"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {mode === 'sign-up' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
        </div>

        <div className="mt-6 bg-success-light rounded-xl p-4 text-center">
          <p className="text-sm font-medium text-success">
            ✓ Secure Authentication
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Your data is protected with industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
}
