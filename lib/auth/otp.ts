import { supabase } from '@/lib/supabase';

/**
 * Request an OTP code to be sent to the given email.
 * Creates a new user if one doesn't exist (shouldCreateUser: true).
 */
export async function requestOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

/**
 * Verify the 6-digit OTP code for the given email.
 * Returns the session on success.
 */
export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
  return data.session;
}
