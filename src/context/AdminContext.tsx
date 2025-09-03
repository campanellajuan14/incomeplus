import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface AdminUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
}

interface AdminContextType {
  adminUser: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_own_admin_profile');
      
      if (error) {
        console.error('Error checking admin status:', error);
        return null;
      }
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const adminData = await checkAdminStatus();
          setAdminUser(adminData);
        }
      } catch (error) {
        console.error('Error initializing admin:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const adminData = await checkAdminStatus();
          setAdminUser(adminData);
        } else if (event === 'SIGNED_OUT') {
          setAdminUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user && data.user.email) {
        let adminData = await checkAdminStatus();
        
        // If no admin data found, try to create it for the first admin
        if (!adminData) {
          try {
            // Check if this might be the first admin (no other admins exist)
            const { data: existingAdmins } = await supabase
              .from('admin_users')
              .select('id')
              .limit(1);
            
            if (!existingAdmins || existingAdmins.length === 0) {
              // This could be the first admin, try to use the secure function
              const { data: result, error: functionError } = await supabase
                .rpc('create_admin_user', {
                  target_user_id: data.user.id,
                  admin_name: data.user.user_metadata?.name || 'Admin User',
                  admin_email: data.user.email
                });

              if (!functionError && result) {
                // Successfully created, now check admin status again
                adminData = await checkAdminStatus();
              } else {
                console.log('Could not create admin record:', functionError);
              }
            }
          } catch (error) {
            console.log('Error creating admin record:', error);
          }
        }
        
        if (!adminData) {
          await supabase.auth.signOut();
          return { error: new Error('Access denied. Admin privileges required.') };
        }
        setAdminUser(adminData);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, name?: string): Promise<{ error: Error | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/admin/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name || 'Admin User'
          }
        }
      });

      if (error) {
        return { error };
      }

      if (data.user && data.user.email) {
        // Try to create admin record immediately after signup
        try {
          const { error: insertError } = await supabase
            .from('admin_users')
            .insert({
              user_id: data.user.id,
              name: name || 'Admin User',
              email: data.user.email,
              role: 'admin',
              status: 'active'
            });

          if (!insertError) {
            // Successfully created admin record, check status
            const adminData = await checkAdminStatus();
            if (adminData) {
              setAdminUser(adminData);
            }
          } else {
            console.log('Admin record creation failed:', insertError);
            // For existing users, try to check admin status anyway
            setTimeout(async () => {
              const adminData = await checkAdminStatus();
              if (adminData) {
                setAdminUser(adminData);
              }
            }, 1000);
          }
        } catch (insertError) {
          console.log('Error creating admin record:', insertError);
          // Fall back to checking admin status
          setTimeout(async () => {
            const adminData = await checkAdminStatus();
            if (adminData) {
              setAdminUser(adminData);
            }
          }, 1000);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
  };

  const value: AdminContextType = {
    adminUser,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: !!adminUser,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};