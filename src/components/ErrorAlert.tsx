import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { useForm } from '@/contexts/FormContext';

const ErrorAlert = () => {
  const { currentSession, clearError } = useForm();

  // Only show error if it's for the current page
  if (!currentSession.hasError || !currentSession.errorMessage || 
      currentSession.errorPage !== currentSession.currentPage) {
    return null;
  }

  const isLoginPage = currentSession.currentPage === 1;
  
  return (
    <Alert 
      variant={isLoginPage ? "default" : "destructive"} 
      className={`mb-4 ${isLoginPage ? 'bg-white border-red-500 text-red-600' : ''}`}
    >
      <AlertCircle className={`h-4 w-4 ${isLoginPage ? 'text-red-600' : ''}`} />
      <AlertDescription className="flex items-center justify-between">
        <span>{currentSession.errorMessage}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearError}
          className={`h-6 w-6 p-0 ${isLoginPage ? 'hover:bg-red-100 text-red-600' : 'hover:bg-destructive/20'}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;