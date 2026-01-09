import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVisitorTracking = () => {
  useEffect(() => {
    // Skip tracking when admin is authenticated
    const isAdmin = localStorage.getItem('adminAuthenticated') === 'true';
    if (isAdmin) {
      console.log('👮 Admin mode detected, skipping visitor tracking');
      return;
    }

    let visitorData: {
      ip_address: string;
      isp_name: string;
      user_agent: string;
      country: string | null;
      city: string | null;
    } | null = null;

    const trackVisitor = async () => {
      try {
        // Only fetch IP data once on initial track
        if (!visitorData) {
          console.log('🔵 Initializing visitor tracking...');

          let ipAddress = 'Unknown';
          let ispName = 'Unknown ISP';
          let country: string | null = null;
          let city: string | null = null;

          try {
            const res = await fetch('https://ipwho.is/');
            if (res.ok) {
              const d = await res.json();
              ipAddress = d.ip || 'Unknown';
              ispName = d.connection?.isp || d.connection?.org || 'Unknown ISP';
              country = d.country || null;
              city = d.city || null;
              console.log('✅ Visitor data collected:', { ipAddress, ispName, country, city });
            } else {
              const response = await fetch('https://ipapi.co/json/');
              if (response.ok) {
                const data = await response.json();
                ipAddress = data.ip || 'Unknown';
                ispName = data.org || data.asn || 'Unknown ISP';
                country = data.country_name || null;
                city = data.city || null;
                console.log('✅ Visitor data collected (fallback):', { ipAddress, ispName, country, city });
              } else {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                ipAddress = ipData.ip || 'Unknown';
                console.log('✅ IP address collected:', ipAddress);
              }
            }
          } catch (e) {
            console.error('⚠️ IP discovery failed:', e);
          }

          visitorData = {
            ip_address: ipAddress,
            isp_name: ispName,
            user_agent: navigator.userAgent,
            country,
            city,
          };
        }

        // Track visitor via direct Supabase upsert (RLS is now open)
        await supabase
          .from('visitors')
          .upsert({
            ip_address: visitorData.ip_address,
            isp_name: visitorData.isp_name,
            user_agent: visitorData.user_agent,
            country: visitorData.country,
            city: visitorData.city,
            visited_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'ip_address'
          });

        // Silent success - don't spam console
      } catch (error) {
        // Silent failure - visitor tracking is non-critical
        // Only log on first failure
        if (!visitorData) {
          console.error('❌ Visitor tracking unavailable (API offline)');
        }
      }
    };

    // Initial track
    trackVisitor();

    // Send heartbeat every 5 seconds to keep visitor "active"
    const heartbeatInterval = setInterval(trackVisitor, 5000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, []);
};
