import { useEffect, useRef, useCallback, useState } from 'react';

// Ambient sound URLs (royalty-free sounds)
const ambientSounds: Record<string, string> = {
  restaurant: 'https://assets.mixkit.co/sfx/preview/mixkit-restaurant-crowd-talking-ambience-444.mp3',
  cafe: 'https://assets.mixkit.co/sfx/preview/mixkit-coffee-shop-ambience-397.mp3',
  beach: 'https://assets.mixkit.co/sfx/preview/mixkit-beach-waves-ambience-1195.mp3',
  city: 'https://assets.mixkit.co/sfx/preview/mixkit-city-traffic-ambience-23.mp3',
  park: 'https://assets.mixkit.co/sfx/preview/mixkit-park-birds-singing-1194.mp3',
  airport: 'https://assets.mixkit.co/sfx/preview/mixkit-airport-terminal-hall-ambience-397.mp3',
  library: 'https://assets.mixkit.co/sfx/preview/mixkit-library-room-ambience-1859.mp3',
  shopping: 'https://assets.mixkit.co/sfx/preview/mixkit-mall-crowd-ambience-328.mp3',
  party: 'https://assets.mixkit.co/sfx/preview/mixkit-party-crowd-ambience-371.mp3',
  gym: 'https://assets.mixkit.co/sfx/preview/mixkit-gym-workout-ambience-2188.mp3',
};

// UI/interaction sound effects
const sfxSounds = {
  success: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3',
  error: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
  levelUp: 'https://assets.mixkit.co/sfx/preview/mixkit-bonus-earned-in-video-game-2058.mp3',
  achievement: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
  click: 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3',
  swoosh: 'https://assets.mixkit.co/sfx/preview/mixkit-fast-small-sweep-transition-166.mp3',
  owlHoot: 'https://assets.mixkit.co/sfx/preview/mixkit-owl-hooting-at-night-1765.mp3',
  wingFlap: 'https://assets.mixkit.co/sfx/preview/mixkit-bird-wings-flapping-1633.mp3',
  pop: 'https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3',
};

export type SoundEffect = keyof typeof sfxSounds;
export type AmbientSound = keyof typeof ambientSounds;

interface AudioManagerOptions {
  enabled?: boolean;
  ambientVolume?: number;
  sfxVolume?: number;
}

export function useAudioManager(options: AudioManagerOptions = {}) {
  const { enabled = true, ambientVolume = 0.3, sfxVolume = 0.5 } = options;
  
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const sfxAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentAmbientRef = useRef<string | null>(null);
  const [isMuted, setIsMuted] = useState(!enabled);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
    };
  }, []);

  // Play ambient sound for a scenario
  const playAmbient = useCallback((scenario: string) => {
    if (isMuted) return;
    
    const soundKey = scenario as AmbientSound;
    const soundUrl = ambientSounds[soundKey] || ambientSounds.park;
    
    // Don't restart if same sound
    if (currentAmbientRef.current === soundUrl && ambientAudioRef.current) {
      return;
    }

    // Stop current ambient
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
    }

    try {
      const audio = new Audio(soundUrl);
      audio.volume = ambientVolume;
      audio.loop = true;
      audio.crossOrigin = 'anonymous';
      
      audio.play().then(() => {
        ambientAudioRef.current = audio;
        currentAmbientRef.current = soundUrl;
        setIsAmbientPlaying(true);
      }).catch((err) => {
        console.log('Ambient audio blocked by browser:', err.message);
      });
    } catch (err) {
      console.log('Error creating ambient audio:', err);
    }
  }, [isMuted, ambientVolume]);

  // Stop ambient sound
  const stopAmbient = useCallback(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current = null;
      currentAmbientRef.current = null;
      setIsAmbientPlaying(false);
    }
  }, []);

  // Play a sound effect
  const playSfx = useCallback((effect: SoundEffect) => {
    if (isMuted) return;
    
    const soundUrl = sfxSounds[effect];
    if (!soundUrl) return;

    try {
      const audio = new Audio(soundUrl);
      audio.volume = sfxVolume;
      audio.crossOrigin = 'anonymous';
      
      audio.play().catch((err) => {
        console.log('SFX audio blocked:', err.message);
      });

      // Cleanup after playing
      audio.onended = () => {
        audio.remove();
      };
    } catch (err) {
      console.log('Error playing SFX:', err);
    }
  }, [isMuted, sfxVolume]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted && ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        setIsAmbientPlaying(false);
      }
      return newMuted;
    });
  }, []);

  // Set ambient volume
  const setAmbientVolume = useCallback((volume: number) => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return {
    playAmbient,
    stopAmbient,
    playSfx,
    toggleMute,
    setAmbientVolume,
    isMuted,
    isAmbientPlaying,
  };
}
