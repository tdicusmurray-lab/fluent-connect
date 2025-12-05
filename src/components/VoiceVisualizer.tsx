import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VoiceVisualizerProps {
  isActive: boolean;
  className?: string;
}

export function VoiceVisualizer({ isActive, className }: VoiceVisualizerProps) {
  const bars = 5;

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full bg-primary transition-all duration-150",
            isActive ? "animate-pulse" : "h-2"
          )}
          style={{
            height: isActive ? `${Math.random() * 20 + 10}px` : '8px',
            animationDelay: `${i * 100}ms`,
            animationDuration: '300ms',
          }}
        />
      ))}
    </div>
  );
}

export function PulsingMic({ isActive, className }: VoiceVisualizerProps) {
  return (
    <div className={cn("relative", className)}>
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-destructive/20 animate-pulse" />
        </>
      )}
    </div>
  );
}
