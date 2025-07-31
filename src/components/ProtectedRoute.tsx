import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingPasswordReset, setCheckingPasswordReset] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!user) {
          navigate('/login');
          return;
        }

        // Only check password reset if not already on the force password change page
        if (location.pathname !== '/force-password-change') {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('password_reset_required')
              .eq('id', user.id)
              .single();
            
            if (profile?.password_reset_required) {
              navigate('/force-password-change');
              return;
            }
          } catch (error) {
            console.error('Error checking password reset requirement:', error);
          }
        }
      }
      setCheckingPasswordReset(false);
    };

    checkAuth();
  }, [user, loading, navigate, location.pathname]);

  if (loading || checkingPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;