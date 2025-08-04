import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateEmployeeRequest {
  full_name: string;
  email: string;
  job_title?: string;
  employment_status?: string;
  role: 'EMPLOYEE' | 'ACCOUNTANT' | 'ADMIN';
  hire_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

// Generate a secure temporary password
function generateSecurePassword(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
  let password = '';
  
  // Ensure at least one character from each required category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '@#$%&*'[Math.floor(Math.random() * 6)]; // Special character
  
  // Fill the rest randomly
  for (let i = 4; i < 12; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting create-employee function...');
    
    // Check if required environment variables are available
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, serviceRoleKey: !!serviceRoleKey });
      throw new Error('Missing required environment variables');
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify that the requesting user is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'ADMIN') {
      throw new Error('Insufficient permissions - Admin required');
    }

    const requestData: CreateEmployeeRequest = await req.json();
    console.log('Request data received:', { ...requestData, password: '[REDACTED]' });

    // Validate required fields
    if (!requestData.full_name || !requestData.email) {
      throw new Error('Missing required fields: full_name and email are required');
    }

    // Generate secure temporary password
    const temporaryPassword = generateSecurePassword();

    console.log('Creating employee with data:', { ...requestData, temporaryPassword: '[REDACTED]' });

    // Create the auth user using admin client
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: requestData.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: requestData.full_name
      }
    });

    if (createUserError) {
      console.error('Error creating user:', createUserError);
      throw createUserError;
    }

    if (!newUser.user) {
      throw new Error('Failed to create user');
    }

    console.log('User created successfully:', newUser.user.id);

    // Update the profile that was automatically created by the trigger
    console.log('Updating profile for user:', newUser.user.id);
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: requestData.full_name,
        role: requestData.role,
        job_title: requestData.job_title || null,
        employment_status: requestData.employment_status || null,
        hire_date: requestData.hire_date || null,
        emergency_contact_name: requestData.emergency_contact_name || null,
        emergency_contact_phone: requestData.emergency_contact_phone || null,
        email: requestData.email,
        password_reset_required: true
      })
      .eq('id', newUser.user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw updateError;
    }

    console.log('Employee created and profile updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUser.user.id,
        temporary_password: temporaryPassword,
        message: 'Employee created successfully with secure temporary password'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in create-employee function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);