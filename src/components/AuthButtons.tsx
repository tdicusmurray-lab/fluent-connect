import { Button } from "@/components/ui/button";

const providers = [
  { id: 'google', name: 'Google', icon: '🔵', color: 'bg-[#4285F4]' },
  { id: 'github', name: 'GitHub', icon: '⚫', color: 'bg-[#333]' },
  { id: 'facebook', name: 'Facebook', icon: '🔵', color: 'bg-[#1877F2]' },
  { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-[#1DA1F2]' },
  { id: 'instagram', name: 'Instagram', icon: '📸', color: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-[#000]' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-[#0A66C2]' },
];

interface AuthButtonsProps {
  onAuth: (provider: string) => void;
}

export function AuthButtons({ onAuth }: AuthButtonsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center mb-4">
        Sign in to save your progress
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        {providers.slice(0, 4).map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            onClick={() => onAuth(provider.id)}
            className="h-12 gap-2"
          >
            <span className="text-lg">{provider.icon}</span>
            {provider.name}
          </Button>
        ))}
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {providers.slice(4).map((provider) => (
          <Button
            key={provider.id}
            variant="ghost"
            size="sm"
            onClick={() => onAuth(provider.id)}
            className="gap-1"
          >
            <span>{provider.icon}</span>
            {provider.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
