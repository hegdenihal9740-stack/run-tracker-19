import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export function signInWithGoogle() {
  return lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
}

export function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email: email.trim(), password });
}

export function sendPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export function saveRecoveryPassword(password: string) {
  return supabase.auth.updateUser({ password });
}
