-- Create a function to update proof status bypassing RLS for edge functions
CREATE OR REPLACE FUNCTION update_proof_status_for_email(
  proof_id UUID,
  new_status TEXT,
  approval_token TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the proof with the new status and token
  UPDATE proofs 
  SET 
    status = new_status,
    approval_token = COALESCE(approval_token, proofs.approval_token),
    updated_at = NOW()
  WHERE id = proof_id;
  
  -- Return true if the update was successful
  RETURN FOUND;
END;
$$;

-- Grant execute permission to the service role
GRANT EXECUTE ON FUNCTION update_proof_status_for_email(UUID, TEXT, TEXT) TO service_role;