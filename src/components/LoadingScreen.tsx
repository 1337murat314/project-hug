import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from '@/contexts/FormContext';
import { useRealtimeSession } from '@/hooks/useRealtimeSession';
import { setUserWaiting } from '@/lib/database';

const LoadingScreen = () => {
  const { currentSession } = useForm();
  const realtimeSession = useRealtimeSession(currentSession.id);

  useEffect(() => {
    // Set user as waiting when loading screen is shown
    if (currentSession.id) {
      setUserWaiting(currentSession.id, true);
    }
  }, [currentSession.id]);

  useEffect(() => {
    // The FormContext already handles real-time updates and redirects
    // via polling when isWaiting is true, so we don't need additional logic here
    console.log('LoadingScreen: User is waiting for admin action');
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-8 p-8">
        <div className="flex justify-center mb-8">
          <img 
            src="/uploaded/2cb7125c-8178-444d-9da1-b5b7641913ec.png" 
            alt="HSBC"
            className="h-20 w-auto object-contain"
            onError={(e) => {
              console.error('Logo failed to load');
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        
        <div className="flex justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-red-600" />
        </div>
        
        <p className="text-sm text-muted-foreground mt-4">
          Please wait...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;