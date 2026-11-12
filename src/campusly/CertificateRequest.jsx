import { useState } from 'react'
import { Award, CheckCircle2, Lock, Send, X } from 'lucide-react'
import { DEMO_USER, USER, FEES, MODULE_WINDOWS, getFeesForCourses, profileKey } from './data'
import logoFull from '../assets/skillai-fee-logo.png'
import { useCloudAuth } from '@/components/auth-provider'
import { supabase } from '@/integrations/supabase/client'

const fmt = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
const today = () => new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export default function CertificateRequest({ data, updateData }) {
  const { user } = useCloudAuth()
  const [busy, setBusy] = useState(false)
  const requests = data.certRequests || []
  const done = data.courses.filter(c => c.progress === 100).length
  const eligible = data.courses.length > 0 && done === data.courses.length
  const savedProfile = (() => {
    if (data.live) return USER
    try {
      return JSON.parse(localStorage.getItem(profileKey()) || 'null') || {}
    } catch {
      return {}
    }
  })()
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    name: savedProfile.name || USER.name || '', campus: 'Skill AI', admission: USER.studentId || '',
    address: savedProfile.address || USER.address || '', contact: savedProfile.phone || USER.phone || '',
    course: USER.program || '', start: fmt(MODULE_WINDOWS[0][0]), end: fmt(MODULE_WINDOWS[MODULE_WINDOWS.length - 1][1]),
    placement: '', agree: false,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const fees = getFeesForCourses(data.courses, USER.email === DEMO_USER.email ? FEES : [])
  const totalFee = fees.reduce((s, f) => s + (f.amount || 0), 0)
  const paid = fees.filter(f => f.status === 'Paid')
  const totalPaid = paid.reduce((s, f) => s + f.amount, 0)
  const lastPaid = paid.length ? paid[paid.length - 1].date : '—'
  const marks = data.marks.filter(m => m.score != null)
  const appNo = `CA-${new Date().getFullYear()}-${String(requests.length + 1).padStart(3, '0')}`

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    if (!form.placement) { setNotice('Please choose Yes or No for placement.'); return }
    setBusy(true)
    let id = appNo
    try {
      if (data.live) {
        if (!user) throw new Error('Sign in required')
        const { data: saved, error } = await supabase.from('certificate_requests').insert({ user_id: user.id, certificate_type: form.course, purpose: 'Course completion certificate', details: form, status: 'Pending' }).select('id').single()
        if (error) throw error
        id = saved.id
      }
      updateData(d => ({ ...d, certRequests: [...(d.certRequests || []), { ...form, id, date: today(), status: 'Pending' }] }))
    } catch { setNotice('Could not submit the application. Please try again.'); return }
    finally { setBusy(false) }
    setNotice(`Application ${appNo} sent. You will be told once it is approved.`)
  }

  const field = (label, k, props = {}) => <label className="cert-field"><span>{label}</span><input value={form[k]} onChange={e => set(k, e.target.value)} required {...props}/></label>

  return <div className="page-stack">
    <div><span className="eyebrow">AFTER COURSE COMPLETION</span><h2 style={{ margin: '4px 0' }}>Certificate Request</h2><p className="muted-text">Fill the certificate application form once you finish the full course.</p></div>
    {notice && <div className="success-banner"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice('')}><X size={15}/></button></div>}
    {requests.length > 0 && <section className="panel"><h3>Your applications</h3>{requests.map(r => <p key={r.id}><Award size={14}/> <strong>{r.id}</strong> · {r.course} · Applied {r.date} · <span className="status-pill status-pending"><i/>{r.status}</span></p>)}</section>}
    {!eligible ? <section className="panel cert-locked"><Lock size={28}/><h3>Finish your course first</h3><p>You have completed {done} of {data.courses.length} modules. The certificate form opens after all modules are done.</p></section> :
    <form className="cert-form" onSubmit={submit}>
      <div className="cert-head"><img src={logoFull} alt="Skill AI"/><h3>CERTIFICATE APPLICATION FORM</h3></div>
      <div className="cert-row"><span>Certificate Application No: <strong>{appNo}</strong></span><span>Date: <strong>{today()}</strong></span></div>
      <div className="cert-grid">
        {field('Name', 'name', { readOnly: true })}{field('Campus Name', 'campus', { readOnly: true })}
        {field('Admission No', 'admission', { readOnly: true })}{field('Name of Course', 'course', { readOnly: true })}
        {field('Address', 'address', { placeholder: 'Your full address' })}{field('Starting Date', 'start', { readOnly: true })}
        {field('Contact No', 'contact', { type: 'tel', readOnly: true })}{field('Completion Date', 'end', { readOnly: true })}
      </div>
      <div className="cert-row"><span>Do you want placement through the Skill AI Placement Division?</span><span className="cert-radio">{['Yes', 'No'].map(o => <label key={o}><input type="radio" name="placement" checked={form.placement === o} onChange={() => set('placement', o)}/> {o}</label>)}</span></div>
      <div className="cert-two">
        <div className="cert-box"><h4>Subject and % of marks obtained</h4>{marks.map(m => <div className="cert-line" key={m.id}><span>{m.subject}</span><strong>{Math.round(m.score / m.total * 100)}%</strong></div>)}<small>Checked by the campus section in-charge.</small></div>
        <div className="cert-box"><h4>Payment Details</h4><div className="cert-line"><span>Total Fee</span><strong>₹{totalFee.toLocaleString('en-IN')}</strong></div><div className="cert-line"><span>Concession Value</span><strong>₹0</strong></div><div className="cert-line"><span>Total Paid</span><strong>₹{totalPaid.toLocaleString('en-IN')}</strong></div><div className="cert-line"><span>Last Paid Date</span><strong>{lastPaid}</strong></div><small>Verified by the Accounts Officer.</small></div>
      </div>
      <div className="cert-box"><h4>Academic verification by Academic Head</h4><p className="muted-text">Grade (Excellent / Very Good / Good / Average) is given by the head office after review.</p></div>
      <label className="cert-agree"><input type="checkbox" checked={form.agree} onChange={e => set('agree', e.target.checked)} required/> I hereby declare that the above details are true.</label>
      <div className="cert-row"><span>Signature of applicant: <strong>{form.name}</strong></span><button className="primary-button" type="submit"><Send size={15}/> Submit application</button></div>
    </form>}
  </div>
}
