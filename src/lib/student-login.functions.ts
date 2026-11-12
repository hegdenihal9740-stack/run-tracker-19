import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

// Credential verification returns a session only, never an anonymous email lookup.
export const signInStudent = createServerFn({ method: 'POST' })
  .inputValidator((input) => z.object({ identifier: z.string().trim().min(1).max(255), password: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { createClient } = await import('@supabase/supabase-js');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const invalid = { error: 'Registration number, email or password is incorrect.', session: null };
    const field = data.identifier.includes('@') ? 'email' : 'student_code';
    // Wildcards cannot be used to resolve another student's identity.
    if (/[%_*]/.test(data.identifier)) return invalid;
    const { data: student } = await supabaseAdmin.from('students').select('email,user_id,status').ilike(field, data.identifier).maybeSingle();
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) throw new Error('Account service unavailable');
    const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    // Verify credentials even for an unknown registration number to avoid a fast lookup oracle.
    const email = student?.email || (field === 'email' ? data.identifier : 'unknown-student@invalid.local');
    const { data: result, error } = await auth.auth.signInWithPassword({ email, password: data.password });
    if (error || !result.session || !student || student.status !== 'Active' || student.user_id !== result.user.id) return invalid;
    return { error: null, session: { access_token: result.session.access_token, refresh_token: result.session.refresh_token } };
  });