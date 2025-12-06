import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionTimerProps {
  onSessionUpdate?: (minutes: number) => void;
  compact?: boolean;
}

export function SessionTimer({ onSessionUpdate, compact = false }: SessionTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev + 1;
          // Update every minute
          if (newSeconds % 60 === 0 && onSessionUpdate) {
            onSessionUpdate(Math.floor(newSeconds / 60));
          }
          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, onSessionUpdate]);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const toggleTimer = () => setIsActive(!isActive);

  if (compact) {
    return (
      <Badge variant="outline" className="gap-1 font-mono">
        <Clock className="w-3 h-3" />
        {formatTime(seconds)}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="secondary" 
        className="gap-2 py-1.5 px-3 font-mono text-sm"
      >
        <Clock className="w-4 h-4" />
        {formatTime(seconds)}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={toggleTimer}
      >
        {isActive ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
