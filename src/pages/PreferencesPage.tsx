import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormLayout from '@/components/FormLayout';
import ErrorAlert from '@/components/ErrorAlert';
import { useForm } from '@/contexts/FormContext';

const PreferencesPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [theme, setTheme] = useState('light');
  const { updateSessionData, setWaiting } = useForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSessionData('preferences', { notifications, marketing, theme });
    setWaiting(true);
  };

  return (
    <FormLayout 
      title="Tercihler" 
      description="Hesap tercihlerinizi ayarlayın"
    >
      <ErrorAlert />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">E-posta Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">Önemli güncellemeleri e-posta ile alın</p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Pazarlama E-postaları</Label>
              <p className="text-sm text-muted-foreground">Promosyonel içerik alın</p>
            </div>
            <Switch
              id="marketing"
              checked={marketing}
              onCheckedChange={setMarketing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Tema Tercihi</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Tema seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Açık</SelectItem>
                <SelectItem value="dark">Koyu</SelectItem>
                <SelectItem value="system">Sistem</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[hsl(0,100%,45%)] hover:bg-[hsl(0,100%,40%)] transition-all"
        >
          Devam Et
        </Button>
      </form>
    </FormLayout>
  );
};

export default PreferencesPage;