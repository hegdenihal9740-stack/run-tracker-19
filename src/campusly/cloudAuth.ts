import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { signInStudent } from '@/lib/student-login.functions';

export function signInWithGoogle() {
  return lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
}

export function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email: email.trim(), password });
}

export async function signInWithStudentIdentifier(identifier: string, password: string) {
  const result = await signInStudent({ data: { identifier, password } });
  if (result.error || !result.session) return { error: { message: result.error || 'Could not sign in.' } };
  return supabase.auth.setSession(result.session);
}

export function sendPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export function saveRecoveryPassword(password: string) {
  return supabase.auth.updateUser({ password });
}
