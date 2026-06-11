import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({ scheme: 'karny-budget' });

/**
 * Hook that returns the Google auth request and a handler to sign in.
 * Usage:
 *   const { request, promptAsync } = useGoogleAuth();
 *   <Button onPress={() => promptAsync()} disabled={!request} />
 */
export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    redirectUri,
  });

  return { request, response, promptAsync };
}

/**
 * Exchange a Google ID token for a Supabase session.
 */
export async function signInWithGoogleToken(idToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
  return data.session;
}
