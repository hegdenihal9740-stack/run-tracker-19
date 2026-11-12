import { supabase } from '@/integrations/supabase/client';

export const formatRecordDate = (date: string) => new Date(date.slice(0, 10) + 'T12:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export async function loadStudentRecords(userId: string) {
  const [studentResult, profileResult, leavesResult, certificatesResult] = await Promise.all([
    supabase.from('students').select('*,batches(*)').eq('user_id', userId).maybeSingle(),
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('leave_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('certificate_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);
  for (const result of [studentResult, profileResult, leavesResult, certificatesResult]) if (result.error) throw result.error;
  const student = studentResult.data;
  if (!student || student.status !== 'Active') throw new Error('Your student account is not linked to an active admission. Contact your office.');
  const { data: payments, error } = await supabase.from('fee_payments').select('*').eq('student_id', student.id).order('paid_on', { ascending: true });
  if (error) throw error;
  const profile = profileResult.data;
  const details = profile?.details && typeof profile.details === 'object' && !Array.isArray(profile.details) ? profile.details : {};
  return {
    account: { ...details, name: student.name, email: student.email, phone: student.phone || '', studentId: student.student_code, program: student.program || '', batch: student.batches?.name || '', admissionYear: student.admission_year || '', joined: formatRecordDate(student.created_at), photo: profile?.photo || '' },
    data: {
      live: true, student, batch: student.batches, courses: [], materials: [], attendance: [], marks: [], assignments: [], timetable: [], notifications: [], classTests: {}, feedback: [], certificates: [],
      leaves: (leavesResult.data || []).map(row => ({ ...(row.details as object), id: row.id, type: 'Personal', from: formatRecordDate(row.from_date), to: formatRecordDate(row.to_date), days: Math.round((Date.parse(row.to_date) - Date.parse(row.from_date)) / 86400000) + 1, reason: row.reason, status: row.status, remarks: row.remark || '', applied: formatRecordDate(row.created_at) })),
      certRequests: (certificatesResult.data || []).map(row => ({ ...(row.details as object), id: row.id, course: row.certificate_type, date: formatRecordDate(row.created_at), status: row.status, remark: row.remark, certificateNo: row.certificate_no })),
      fees: (payments || []).map(row => ({ id: row.id, title: row.note || 'Fee payment', amount: Number(row.amount), receipt: row.receipt_no, method: row.payment_mode, date: formatRecordDate(row.paid_on), status: 'Paid', code: '', module: '—' })),
    },
  };
}