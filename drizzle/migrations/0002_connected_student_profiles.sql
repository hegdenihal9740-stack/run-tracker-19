CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT '',
 photo text NOT NULL DEFAULT '',
 details jsonb NOT NULL DEFAULT '{}'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE FUNCTION public.create_student_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles(id, display_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', '')) ON CONFLICT (id) DO NOTHING;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.create_student_profile() FROM PUBLIC;
CREATE TRIGGER create_student_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_student_profile();
INSERT INTO public.profiles(id, display_name) SELECT id, COALESCE(raw_user_meta_data->>'name', '') FROM auth.users ON CONFLICT (id) DO NOTHING;
CREATE UNIQUE INDEX students_code_normalized_unique ON public.students (lower(student_code));
CREATE UNIQUE INDEX students_email_normalized_unique ON public.students (lower(email));
CREATE UNIQUE INDEX students_user_unique ON public.students(user_id) WHERE user_id IS NOT NULL;
ALTER TABLE public.leave_requests ADD COLUMN details jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.certificate_requests ADD COLUMN details jsonb NOT NULL DEFAULT '{}'::jsonb;