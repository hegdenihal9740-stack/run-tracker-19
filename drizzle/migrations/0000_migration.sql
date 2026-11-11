CREATE TABLE public.student_feedback (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 kind text NOT NULL CHECK (kind IN ('course_feedback','module_shift')),
 module_id integer NOT NULL CHECK (module_id BETWEEN 1 AND 10),
 module_title text NOT NULL,
 target_module_id integer,
 target_module_title text,
 rating integer,
 category text,
 message text NOT NULL CHECK (length(trim(message)) > 0),
 status text NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted','Pending','Reviewed','Approved','Declined')),
 staff_reply text,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT feedback_kind_fields CHECK ((kind = 'course_feedback' AND rating BETWEEN 1 AND 5 AND rating IS NOT NULL AND target_module_id IS NULL AND status IN ('Submitted','Reviewed')) OR (kind = 'module_shift' AND target_module_id BETWEEN 1 AND 10 AND target_module_id IS NOT NULL AND target_module_id <> module_id AND rating IS NULL AND status IN ('Pending','Approved','Declined')))
);
GRANT SELECT, INSERT ON public.student_feedback TO authenticated;
GRANT ALL ON public.student_feedback TO service_role;
ALTER TABLE public.student_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own feedback" ON public.student_feedback FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Students submit own feedback" ON public.student_feedback FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND staff_reply IS NULL AND ((kind = 'course_feedback' AND status = 'Submitted') OR (kind = 'module_shift' AND status = 'Pending')));
CREATE INDEX student_feedback_user_created ON public.student_feedback (user_id, created_at DESC);