import { useState } from 'react';
import { useLearningStore } from '@/stores/learningStore';
import { languages } from '@/data/languages';
import { Language } from '@/types/learning';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function LanguageSwitcher() {
  const { targetLanguage, setTargetLanguage } = useLearningStore();
  const [open, setOpen] = useState(false);

  const handleSelect = (language: Language) => {
    setTargetLanguage(language);
    setOpen(false);
    toast.success(`Switched to ${language.name}`, {
      description: `Now learning ${language.nativeName}`,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-lg">{targetLanguage?.flag || '🌍'}</span>
          <span className="hidden sm:inline">{targetLanguage?.name || 'Select'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="grid grid-cols-2 gap-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors hover:bg-accent",
                targetLanguage?.code === lang.code && "bg-primary/10"
              )}
            >
              <span className="text-xl">{lang.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{lang.name}</p>
                <p className="text-xs text-muted-foreground truncate">{lang.nativeName}</p>
              </div>
              {targetLanguage?.code === lang.code && (
                <Check className="w-4 h-4 text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
