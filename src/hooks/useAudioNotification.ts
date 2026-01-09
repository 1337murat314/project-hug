import { useRef, useCallback, useState } from 'react';

export type SoundOption = {
  id: string;
  name: string;
  path: string;
};

export const soundOptions: SoundOption[] = [
  { id: 'notification1', name: 'Bell Chime', path: '/sounds/notification1.wav' },
  { id: 'notification2', name: 'Magic', path: '/sounds/magic.wav' },
  { id: 'notification3', name: 'Slots', path: '/sounds/slots.wav' }
];

export const useAudioNotification = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const userActivityAudioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedSound, setSelectedSound] = useState(() => {
    try {
      return localStorage.getItem('adminSelectedSound') || soundOptions[0].id;
    } catch {
      return soundOptions[0].id;
    }
  });

  const playClickSound = useCallback(async () => {
    try {
      if (!clickAudioRef.current) {
        clickAudioRef.current = new Audio('/sounds/click.wav');
        clickAudioRef.current.preload = 'auto';
      }

      clickAudioRef.current.volume = 0.5;
      clickAudioRef.current.currentTime = 0;
      
      await clickAudioRef.current.play();
    } catch (error) {
      console.warn('Could not play click sound:', error);
    }
  }, []);

  const playUserActivitySound = useCallback(async () => {
    try {
      if (!userActivityAudioRef.current) {
        userActivityAudioRef.current = new Audio('/sounds/user-activity.wav');
        userActivityAudioRef.current.preload = 'auto';
      }

      userActivityAudioRef.current.volume = 0.7;
      userActivityAudioRef.current.currentTime = 0;
      
      console.log('🔊 Playing user activity sound');
      await userActivityAudioRef.current.play();
    } catch (error) {
      console.warn('Could not play user activity sound:', error);
    }
  }, []);

  const playNotificationSound = useCallback(async () => {
    try {
      const selectedSoundOption = soundOptions.find(s => s.id === selectedSound);
      if (!selectedSoundOption) return;

      // Create or reuse audio element
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.preload = 'auto';
      }

      audioRef.current.src = selectedSoundOption.path;
      audioRef.current.volume = 0.8;
      
      // Reset audio to start
      audioRef.current.currentTime = 0;
      
      // Play the sound
      console.log('🔊 Playing notification sound:', selectedSoundOption.name);
      await audioRef.current.play();
      
    } catch (error) {
      console.warn('Could not play notification sound:', error);
      // Try to play with user gesture if autoplay failed
      if (error.name === 'NotAllowedError') {
        console.warn('Autoplay blocked - user interaction required');
      }
    }
  }, [selectedSound]);

  const changeSound = useCallback((soundId: string) => {
    setSelectedSound(soundId);
    try {
      localStorage.setItem('adminSelectedSound', soundId);
    } catch (error) {
      console.warn('Could not save sound preference:', error);
    }
  }, []);

  const testSound = useCallback(async (soundId?: string) => {
    try {
      const testSoundOption = soundOptions.find(s => s.id === (soundId || selectedSound));
      if (!testSoundOption) return;

      const testAudio = new Audio(testSoundOption.path);
      testAudio.volume = 0.7;
      await testAudio.play();
    } catch (error) {
      console.warn('Could not play test sound:', error);
    }
  }, [selectedSound]);

  return { 
    playNotificationSound, 
    playClickSound,
    playUserActivitySound,
    selectedSound, 
    changeSound, 
    testSound, 
    soundOptions 
  };
};