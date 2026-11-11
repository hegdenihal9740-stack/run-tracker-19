import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare, ArrowRightLeft, Send, Star, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCloudAuth } from '@/components/auth-provider'
import { supabase } from '@/integrations/supabase/client'
import { feedbackError } from './feedbackRules'
import { SHIFT_COURSES, USER } from './data'
import { createId } from './createId'
import './feedback.css'

export default function Feedback({ data, updateData }) {
  const { user } = useCloudAuth()
  const first = data.courses.find(c => c.completed > 0 && c.completed < c.lessons) || data.courses[0]
  const currentCourse = USER.program || SHIFT_COURSES[0]
  const [form, setForm] = useState({ kind: 'course_feedback', module: String(first?.id || ''), target: '', rating: 0, category: 'Teaching', message: '', course: currentCourse, targetCourse: '' })
  const [busy, setBusy] = useState(false)
  const locked = useRef(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const history = useQuery({
    queryKey: ['student-feedback', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return []
      const { data: rows, error } = await supabase.from('student_feedback').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (error) throw error
      return rows || []
    },
  })
  const entries = user ? history.data || [] : data.feedback || []
  const shift = form.kind === 'module_shift'
  const set = (key, value) => { setForm(f => ({ ...f, [key]: value })); setError(''); setNotice('') }
  async function submit(e) {
    e.preventDefault()
    if (locked.current) return
    const validation = feedbackError(form)
    if (validation) { setError(validation); return }
    const course = data.courses.find(c => String(c.id) === form.module)
    if (!shift && !course) { setError('Please select a valid module.'); return }
    if (shift && (!SHIFT_COURSES.includes(form.course) || !SHIFT_COURSES.includes(form.targetCourse))) { setError('Please select a valid course.'); return }
    const record = {
      kind: form.kind,
      module_id: shift ? null : course.id, module_title: shift ? form.course : course.title,
      target_module_id: null, target_module_title: shift ? form.targetCourse : null,
      rating: shift ? null : Number(form.rating), category: shift ? null : form.category,
      message: form.message.trim(), status: shift ? 'Pending' : 'Submitted',
    }
    locked.current = true; setBusy(true); setError(''); setNotice('')
    try {
      if (user) {
        const { error: saveError } = await supabase.from('student_feedback').insert({ ...record, user_id: user.id })
        if (saveError) throw saveError
        await history.refetch()
      } else {
        updateData(d => ({ ...d, feedback: [{ ...record, id: createId(), created_at: new Date().toISOString() }, ...(d.feedback || [])] }))
      }
      setForm(f => ({ ...f, message: '', rating: 0, target: '', targetCourse: '' }))
      setNotice(user ? (shift ? 'Course shift request submitted. Your current course remains unchanged.' : 'Thank you. Your course feedback has been submitted.') : 'Saved on this device in demo mode. Not sent to the institute.')
    } catch { setError('Could not submit right now. Your comments are still here; please try again.') }
    finally { locked.current = false; setBusy(false) }
  }
  return <div className="page-stack student-feedback">
    <div className="section-heading"><div><div className="eyebrow">STUDENT VOICE</div><h2>Feedback & Course Shift Requests</h2></div></div>
    <div className="feedback-modes" role="tablist" aria-label="Feedback type">
      <Button variant={shift ? 'outline' : 'default'} className={!shift ? 'primary-button' : 'secondary-button'} role="tab" aria-selected={!shift} disabled={busy} onClick={() => set('kind', 'course_feedback')}><MessageSquare/>Course feedback</Button>
      <Button variant={shift ? 'default' : 'outline'} className={shift ? 'primary-button' : 'secondary-button'} role="tab" aria-selected={shift} disabled={busy} onClick={() => set('kind', 'module_shift')}><ArrowRightLeft/>Course shift</Button>
    </div>
    {notice && <div role="status" className="feedback-notice">{notice}</div>}
    <div className="feedback-workspace">
      <section className="feedback-form-section"><h3>{shift ? 'Request a course shift' : 'Share your course feedback'}</h3>
        <form onSubmit={submit}>
          {shift ? <><div><label htmlFor="feedback-course">Current course</label><select id="feedback-course" value={form.course} disabled required>{SHIFT_COURSES.map(c => <option key={c} value={c}>{c}</option>)}</select></div><div><label htmlFor="feedback-target">Requested course</label><select id="feedback-target" value={form.targetCourse} disabled={busy} onChange={e => set('targetCourse', e.target.value)} required><option value="">Select a course</option>{SHIFT_COURSES.filter(c => c !== form.course).map(c => <option key={c} value={c}>{c}</option>)}</select></div><p className="muted-text">Pending institute review. No course or progress changes are made automatically.</p></> : <><div><label htmlFor="feedback-module">Course module</label><select id="feedback-module" value={form.module} disabled={busy} onChange={e => set('module', e.target.value)} required>{data.courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div><div><label htmlFor="feedback-category">Feedback category</label><select id="feedback-category" value={form.category} disabled={busy} onChange={e => set('category', e.target.value)}>{['Teaching', 'Course content', 'Study materials', 'Class timing', 'Other'].map(c => <option key={c}>{c}</option>)}</select></div><fieldset className="feedback-rating" disabled={busy}><legend>Overall rating</legend><div className="feedback-rating-options">{[1,2,3,4,5].map(n => <label key={n} title={`${n} out of 5`}><input type="radio" name="feedback-rating" value={n} checked={Number(form.rating) === n} onChange={() => set('rating', n)} aria-label={`${n} out of 5`}/><Star size={21} fill={Number(form.rating) >= n ? 'currentColor' : 'none'}/></label>)}</div></fieldset></>}
          <div><label htmlFor="feedback-message">{shift ? 'Reason for course shift' : 'Your comments'}</label><textarea id="feedback-message" value={form.message} maxLength={5000} required disabled={busy} onChange={e => set('message', e.target.value)}/></div>
          {error && <p role="alert" className="feedback-error">{error}</p>}
          <div><Button type="submit" className="primary-button" disabled={busy}><Send/>{busy ? 'Submitting…' : shift ? 'Submit shift request' : 'Submit feedback'}</Button></div>
        </form>
      </section>
      <section className="feedback-history"><h3>Your submissions <span className="muted-text">({entries.length})</span></h3>
        {user && history.isPending ? <p role="status" className="feedback-state">Loading submissions…</p> : user && history.isError ? <div role="alert"><p className="feedback-error">Could not load your submissions.</p><Button variant="outline" onClick={() => history.refetch()}><RotateCcw/>Retry</Button></div> : entries.length === 0 ? <p className="feedback-state">No submissions yet.</p> : entries.map(entry => <article className="feedback-entry" key={entry.id}><div className="feedback-entry-head"><strong>{entry.kind === 'module_shift' ? 'Course shift request' : 'Course feedback'}</strong><span className={`status-pill status-${entry.status.toLowerCase()}`}><i/>{entry.status}</span></div><strong>{entry.module_title}</strong>{entry.target_module_title && <p>Requested: {entry.target_module_title}</p>}{entry.rating && <p>{entry.rating}/5 · {entry.category}</p>}<p>{entry.message}</p><small>{new Date(entry.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</small>{entry.staff_reply && <p><strong>Institute response</strong><br/>{entry.staff_reply}</p>}</article>)}
      </section>
    </div>
  </div>
}