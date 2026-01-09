import { useEffect } from 'react';
import { useForm } from '@/contexts/FormContext';

export const useAdminRedirectCheck = () => {
  const { isAdmin } = useForm();

  useEffect(() => {
    // This hook is no longer needed as FormContext handles all redirects
    // Kept for backwards compatibility but does nothing
    if (isAdmin) return;
  }, [isAdmin]);
};
