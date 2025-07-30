-- Create activity_logs table for tracking client activities
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity logs
CREATE POLICY "Authenticated users can manage activity logs" 
ON public.activity_logs 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_activity_logs_client_id ON public.activity_logs(client_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);