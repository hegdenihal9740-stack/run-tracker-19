import { beforeEach, describe, expect, it, vi } from 'vitest';
const rows = vi.hoisted(() => ({ values: {} as Record<string, unknown> }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: (table: string) => {
  const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: rows.values[table], error: null }), order: async () => ({ data: rows.values[table], error: null }) };
  return query;
} } }));
import { loadStudentRecords } from '@/campusly/cloudRecords';
describe('Shared student records', () => {
  beforeEach(() => { rows.values = { students: { id: 'student-1', name: 'Manoj', student_code: 'STU-2026-1017', email: 'student@example.test', status: 'Active', created_at: '2026-11-12', batches: { name: 'Admin batch' } }, profiles: { photo: 'photo', details: {} }, leave_requests: [], certificate_requests: [], fee_payments: [] }; });
  it('uses the admin registration and batch without demo academic data', async () => {
    const result = await loadStudentRecords('user-1');
    expect(result.account.studentId).toBe('STU-2026-1017');
    expect(result.account.batch).toBe('Admin batch');
    expect(result.data.marks).toEqual([]);
    expect(result.data.courses).toEqual([]);
  });
  it('reads recorded payments and staff decisions', async () => {
    rows.values['fee_payments'] = [{ id: 'payment-1', amount: '2500', receipt_no: 'REC-1', payment_mode: 'UPI', paid_on: '2026-11-12' }];
    rows.values['leave_requests'] = [{ id: 'leave-1', from_date: '2026-11-12', to_date: '2026-11-13', status: 'Approved', remark: 'Approved by office', created_at: '2026-11-12', details: {} }];
    const result = await loadStudentRecords('user-1');
    expect(result.data.fees[0]?.amount).toBe(2500);
    expect(result.data.fees[0]?.receipt).toBe('REC-1');
    expect(result.data.leaves[0]?.status).toBe('Approved');
    expect(result.data.leaves[0]?.days).toBe(2);
  });
  it('does not open an inactive admission', async () => {
    rows.values['students'] = { status: 'Inactive' };
    await expect(loadStudentRecords('user-1')).rejects.toThrow('active admission');
  });
});