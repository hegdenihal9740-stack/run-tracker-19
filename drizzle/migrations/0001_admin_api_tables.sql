CREATE TABLE public.batches (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL,
 program text NOT NULL,
 start_date date,
 trainer text,
 schedule text,
 status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Upcoming','Active','Completed')),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.batches TO authenticated;
GRANT ALL ON public.batches TO service_role;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read batches" ON public.batches FOR SELECT TO authenticated USING (true);

CREATE TABLE public.students (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid UNIQUE,
 student_code text NOT NULL UNIQUE,
 name text NOT NULL,
 email text NOT NULL UNIQUE,
 phone text,
 program text,
 batch_id uuid REFERENCES public.batches(id) ON DELETE SET NULL,
 admission_year text,
 status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive','Graduated')),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own record" ON public.students FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.leave_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 from_date date NOT NULL,
 to_date date NOT NULL,
 reason text NOT NULL CHECK (length(trim(reason)) > 0),
 status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Declined')),
 remark text,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (to_date >= from_date)
);
GRANT SELECT, INSERT ON public.leave_requests TO authenticated;
GRANT ALL ON public.leave_requests TO service_role;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own leave" ON public.leave_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Students submit own leave" ON public.leave_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'Pending' AND remark IS NULL);

CREATE TABLE public.certificate_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 certificate_type text NOT NULL,
 purpose text,
 status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Issued','Declined')),
 certificate_no text,
 remark text,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.certificate_requests TO authenticated;
GRANT ALL ON public.certificate_requests TO service_role;
ALTER TABLE public.certificate_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own certificates" ON public.certificate_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Students submit own certificates" ON public.certificate_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'Pending' AND certificate_no IS NULL AND remark IS NULL);

CREATE TABLE public.fee_payments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
 amount numeric(12,2) NOT NULL CHECK (amount > 0),
 receipt_no text NOT NULL UNIQUE,
 payment_mode text NOT NULL,
 paid_on date NOT NULL DEFAULT current_date,
 note text,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fee_payments TO authenticated;
GRANT ALL ON public.fee_payments TO service_role;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own fees" ON public.fee_payments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()));

GRANT UPDATE ON public.student_feedback TO service_role;