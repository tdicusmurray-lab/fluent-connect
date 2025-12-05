import { useAuth, useUser, UserButton as ClerkUserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

export function UserButton() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  if (!isLoaded) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
    );
  }

  if (isSignedIn && user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium hidden sm:block">
          {user.firstName || user.emailAddresses[0]?.emailAddress}
        </span>
        <ClerkUserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'w-9 h-9',
            }
          }}
        />
      </div>
    );
  }

  return (
    <Button onClick={() => navigate("/auth")} variant="ghost" size="sm">
      <LogIn className="w-4 h-4 mr-2" />
      Sign In
    </Button>
  );
}
