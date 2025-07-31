import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateEmployeeRequest {
  full_name: string;
  email: string;
  password: string;
  job_title?: string;
  employment_status?: string;
  role: 'EMPLOYEE' | 'ACCOUNTANT' | 'ADMIN';
  hire_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    console.log('Creating employee with data:', { ...requestData, password: '[REDACTED]' });

    // Create the auth user using admin client
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: requestData.email,
      password: requestData.password,
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
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: requestData.full_name,
        email: requestData.email,
        role: requestData.role,
        job_title: requestData.job_title,
        employment_status: requestData.employment_status,
        hire_date: requestData.hire_date || null,
        emergency_contact_name: requestData.emergency_contact_name,
        emergency_contact_phone: requestData.emergency_contact_phone,
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
        message: 'Employee created successfully'
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