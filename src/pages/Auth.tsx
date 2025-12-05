import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, ArrowLeft } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>(
    location.pathname.includes('sign-up') ? 'sign-up' : 'sign-in'
  );

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/dashboard");
    }
  }, [isLoaded, isSignedIn, navigate]);

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

          <div className="flex justify-center mb-4">
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

          <div className="flex justify-center [&_.cl-rootBox]:w-full [&_.cl-card]:shadow-none [&_.cl-card]:bg-transparent [&_.cl-headerTitle]:hidden [&_.cl-headerSubtitle]:hidden [&_.cl-socialButtonsBlockButton]:rounded-xl [&_.cl-formButtonPrimary]:gradient-primary [&_.cl-formButtonPrimary]:rounded-xl [&_.cl-footerActionLink]:text-primary">
            {mode === 'sign-in' ? (
              <SignIn 
                routing="path" 
                path="/sign-in"
                signUpUrl="/sign-up"
                afterSignInUrl="/dashboard"
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-primary hover:bg-primary/90',
                    socialButtonsBlockButton: 'border-border hover:bg-muted',
                    formFieldInput: 'rounded-xl border-border focus:ring-primary',
                    card: 'shadow-none',
                  }
                }}
              />
            ) : (
              <SignUp 
                routing="path" 
                path="/sign-up"
                signInUrl="/sign-in"
                afterSignUpUrl="/dashboard"
                appearance={{
                  elements: {
                    formButtonPrimary: 'bg-primary hover:bg-primary/90',
                    socialButtonsBlockButton: 'border-border hover:bg-muted',
                    formFieldInput: 'rounded-xl border-border focus:ring-primary',
                    card: 'shadow-none',
                  }
                }}
              />
            )}
          </div>
        </div>

        <div className="mt-6 bg-success-light rounded-xl p-4 text-center">
          <p className="text-sm font-medium text-success">
            ✓ Authentication Enabled
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sign in with Google, GitHub, Facebook, Twitter, and more!
          </p>
        </div>
      </div>
    </div>
  );
}
