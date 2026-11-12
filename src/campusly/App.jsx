if (typeof document !== "undefined") document.addEventListener("pointerdown", e => { const b = e.target.closest?.("button"); if (!b || b.disabled) return; b.classList.remove("tapping"); void b.offsetWidth; b.classList.add("tapping"); b.addEventListener("animationend", () => b.classList.remove("tapping"), { once: true }) }, { passive: true })
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './campusly.css'
import feeReceiptLogo from '@/assets/skillai-fee-logo.png'
import NeuralBackground from './NeuralBackground.jsx'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Award, Bell, BookOpen,
  CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ClipboardList,
  Clock3, Download, FileText, GraduationCap, LayoutDashboard, LogOut, MessageSquare,
  MoreHorizontal, Search, Settings2, ShieldCheck, Sparkles, TrendingUp, UserRound, X,
  CircleHelp, CirclePlus, CalendarCheck, ChartNoAxesColumn, BookMarked, FileCheck2, Send,
  Paperclip, ExternalLink, RotateCcw, Mail, Phone, LockKeyhole, Eye, EyeOff, Inbox, Filter,
  Building2,
} from 'lucide-react'
import { DEMO_USER, USER, findAccount, setCurrentUser, profileKey, loadDemoData, saveDemoData, resetDemoData, EXAM_SLOTS, FEES, getFeesForCourses } from './data.js'
import { loadBatches, studentBatches, fmtTime, endTime } from './batches.js'
import { buildBatchModuleSchedule, getWeekDates, getWeekStart, toDateKey } from './batchSchedule.js'
import { buildFeeReceiptData, downloadFeeReceiptDocx } from './feeReceipt.js'
import StudentOnboarding from './StudentOnboarding.jsx'
import { DEMO_PASSWORD_KEY, getMissingStudentProfileFields, verifyStudentPassword } from './studentOnboarding.js'
import { NotebookPen, Wallet, MapPin, Layers, Moon, Sun } from 'lucide-react'

function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => { setDark(localStorage.getItem('portal-theme') === 'dark') }, [])
  useEffect(() => { document.documentElement.classList.remove('portal-dark') }, [])
  const toggle = () => { const next = !dark; setDark(next); localStorage.setItem('portal-theme', next ? 'dark' : 'light') }
  return <button className="icon-button" onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'}>{dark ? <Sun size={19}/> : <Moon size={19}/>}</button>
}
function Reveal({ children, delay = 0 }) {
  const [node, setNode] = useState(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!node) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.12 })
    obs.observe(node)
    return () => obs.disconnect()
  }, [node])
  return <div ref={setNode} className={cx('reveal', visible && 'reveal-in')} style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}
import { lessonTest, scoreTest, QUESTIONS_PER_TEST } from './classTests.js'
import { MODULE_ROADMAP } from './sessions.js'
import { MyBatch } from './BatchSystem.jsx'
import { Button } from '@/components/ui/button'
import { LeaveLetter, downloadLeaveDocx } from './LeaveLetter.jsx'
import StudentProfile from './Profile.jsx'
import CertificateRequest from './CertificateRequest.jsx'
import Feedback from './Feedback.jsx'
import HubDashboard from './HubDashboard.jsx'
import Resume from './Resume.jsx'
import BottomNav from './BottomNav.jsx'
import { PortalNavigation, usePortalState, useResetNavigation } from './navigation.jsx'
import { useCloudAuth } from '@/components/auth-provider'
import { supabase } from '@/integrations/supabase/client'
import { signInWithStudentIdentifier, sendPasswordReset } from './cloudAuth'
import { loadStudentRecords } from './cloudRecords'
import ConnectedBatch from './ConnectedBatch.jsx'

const navGroups = [
  { label: 'LEARNING', items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'My Course', icon: BookOpen },
    { id: 'materials', label: 'Study Materials', icon: BookMarked },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  ] },
  { label: 'ACADEMICS', items: [
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'marks', label: 'Marks & Results', icon: ChartNoAxesColumn },
    { id: 'classtests', label: 'Class Tests', icon: FileCheck2 },
    { id: 'exams', label: 'Exam Slots', icon: NotebookPen },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList},
    { id: 'leave', label: 'Leave Applications', icon: FileCheck2 },
    { id: 'certrequest', label: 'Certificate Request', icon: Award },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ] },
  { label: 'CAREER', items: [
    { id: 'resume', label: 'My Resume', icon: FileText },
  ] },
  { label: 'FINANCE', items: [
    { id: 'fees', label: 'Fees & Payments', icon: Wallet },
  ] },
  { label: 'INSTITUTE', items: [
    { id: 'about', label: 'About Institute', icon: Building2 },
  ] },
]

const titles = {
  get dashboard() { return [`Welcome, ${(USER.name || 'there').split(' ')[0]} 👋`, 'Here’s what’s happening with your learning today.'] },
  courses: ['My Course', 'Explore every module, lesson, and skill in your programme.'],
  materials: ['Study Materials', 'Everything you need to keep learning in one place.'],
  timetable: ['Class Timetable', 'Plan your week and stay on top of every session.'],
  attendance: ['Attendance', 'Track your class participation and attendance record.'],
  marks: ['Marks & Results', 'Your marks are published module-wise, once each module ends.'],
  assignments: ['Assignments', 'Manage your tasks, due dates, and submissions.'],
  batch: ['My Batch & Sessions', 'Your batch, class timings and session progress.'],
  classtests: ['Class Tests', 'Take a 10-question test after each lesson and see your score.'],
  exams: ['Exam Slots', 'Your upcoming exam dates, times and venues.'],
  fees: ['Fees & Payments', 'See what is paid and what is still pending.'],
  certrequest: ['Certificate Request', 'Apply for your course certificate after finishing.'],
  leave: ['Leave Applications', 'Apply for leave and follow your request status.'],
  feedback: ['Feedback', 'Course feedback & course shift requests.'],
  certificates: ['Certificates', 'View your achievements and completion certificates.'],
  notifications: ['Notifications', 'Stay up to date with your learning activity.'],
  profile: ['My Profile', 'Manage your personal and student information.'],
  resume: ['My Resume', 'Build a resume from skills in your completed course modules.'],
  about: ['About Institute', 'Learn more about your institute, its learning environment, and how to get in touch.'],
}

function cx(...values) { return values.filter(Boolean).join(' ') }
function percent(score, total) { return total ? Math.round((score / total) * 100) : 0 }
function initials(name = '') { return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() }
function getGrade(p) { return p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B+' : p >= 60 ? 'B' : p >= 50 ? 'C' : 'Needs work' }
function todayLabel() { return new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()) }
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
function todayShort() { return DAY_SHORT[new Date().getDay()] }
export function daysUntil(dateStr, now = new Date()) { const d = new Date(dateStr); if (isNaN(d)) return null; const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()); const b = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return Math.round((b - a) / 86400000) }
export function dueInfo(a, now = new Date()) {
  if (a.status === 'Submitted') return { label: 'Submitted', tone: 'green' }
  const n = daysUntil(a.due, now)
  if (n === null) return { label: `Due ${a.due}`, tone: 'blue' }
  if (n < 0) return { label: `Overdue by ${-n} day${n === -1 ? '' : 's'}`, tone: 'red' }
  if (n === 0) return { label: 'Due today', tone: 'red' }
  if (n === 1) return { label: 'Due tomorrow', tone: 'orange' }
  if (n <= 3) return { label: `Due in ${n} days`, tone: 'orange' }
  return { label: `Due in ${n} days`, tone: 'blue' }
}
// How many more classes can be missed while staying at or above 75%, or how many must be attended to get back.
export function attendanceBuffer(present, total, min = 0.75) {
  if (total === 0) return { safe: true, count: 0 }
  if (present / total >= min) return { safe: true, count: Math.floor(present / min - total) }
  return { safe: false, count: Math.ceil((min * total - present) / (1 - min)) }
}
function toMinutes(t) { const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(t || ''); if (!m) return 0; let h = +m[1] % 12; if (m[3].toUpperCase() === 'PM') h += 12; return h * 60 + +m[2] }
function nextClass(timetable, now = new Date()) {
  const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const todayIdx = order.indexOf(DAY_SHORT[now.getDay()])
  const mins = now.getHours() * 60 + now.getMinutes()
  for (let off = 0; off < 7; off++) {
    const idx = todayIdx < 0 ? off : todayIdx + off
    if (idx >= order.length) break
    const d = timetable.find(t => t.day === order[idx]); if (!d) continue
    const c = d.classes.find(c => off > 0 || toMinutes(c.time) + 60 > mins)
    if (c) return { ...c, day: d.day, date: d.date, when: off === 0 ? (toMinutes(c.time) <= mins ? 'Happening now' : 'Today') : off === 1 ? 'Tomorrow' : d.day }
  }
  return null
}
function DueTag({ a }) { const i = dueInfo(a); return <span className={cx('due-tag', `due-${i.tone}`)}><Clock3 size={12}/>{i.label}</span> }

function Login({ onLogin, previewMode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [forgot, setForgot] = useState(false)
  const [sent, setSent] = useState(false)
  async function submit(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      if (forgot && previewMode) {
        setError('Password reset will be available after the portal is connected to its account service.')
      } else if (previewMode) {
        const identifier = email.trim().toLowerCase()
        const isDemoStudent = identifier === DEMO_USER.email || identifier === DEMO_USER.studentId.toLowerCase()
        const savedPassword = localStorage.getItem(DEMO_PASSWORD_KEY)
        const validPassword = savedPassword
          ? await verifyStudentPassword(password, savedPassword)
          : password === DEMO_USER.password
        if (isDemoStudent && validPassword) onLogin({ ...DEMO_USER })
        else setError('Registration number or password is incorrect. Use the demo student account to preview the portal.')
      } else if (forgot) {
        const { error } = await sendPasswordReset(email)
        if (error) setError(error.message)
        else setSent(true)
      } else if ([DEMO_USER.email, DEMO_USER.studentId.toLowerCase()].includes(email.trim().toLowerCase()) && password === DEMO_USER.password) {
        onLogin({ ...DEMO_USER })
      } else {
        const { error } = await signInWithStudentIdentifier(email, password)
        if (error) setError(error.message)
      }
    } catch { setError('Could not connect. Please try again.') }
    finally { setBusy(false) }
  }
  return <div className="login-page" style={{ gridTemplateColumns: '1fr' }}>
    <div className="login-bg neural-bg" aria-hidden="true">
      <NeuralBackground/>
      <div className="neural-vignette"/>
    </div>
    <div className="login-main">
      <form className="login-form login-animate" onSubmit={submit}>
        <div className="login-heading"><span className="eyebrow">STUDENT PORTAL</span><h2>{forgot ? 'Forgot password' : 'Welcome back'}</h2><p>{forgot ? 'Receive a secure password reset link by email.' : 'Enter your details to access your learning dashboard.'}</p>{previewMode && <p className="login-terms" role="status">Preview mode: sample data and changes stay on this device.</p>}</div>
        {error && <div className="form-error" role="alert">{error}</div>}
        {sent && <p role="status">If an account exists for this email, you’ll receive a reset link. Check your inbox and spam folder.</p>}
        {!sent && <>
        <label className="field-label" htmlFor="email">{forgot ? 'Email address' : 'Registration number or email'}</label>
        <div className="input-wrap"><Mail size={18}/><input id="email" type={forgot ? 'email' : 'text'} value={email} onChange={e => setEmail(e.target.value)} placeholder={forgot ? 'you@example.com' : 'e.g. MBD-2026-0148'} required autoComplete="username"/></div>
        {!forgot && <><div className="password-label"><label className="field-label" htmlFor="password">Password</label><Button className="link-button h-auto" variant="link" type="button" onClick={() => { setForgot(true); setError(''); setSent(false) }}>Forgot password?</Button></div>
        <div className="input-wrap"><LockKeyhole size={18}/><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"/><button className="icon-button input-icon" type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
        </>}
        <Button className="primary-button login-submit h-auto" type="submit" disabled={busy}>{busy ? 'Please wait…' : forgot ? 'Send reset link' : 'Sign in'} <ArrowRight size={17}/></Button>
        </>}
        {forgot ? <Button type="button" variant="link" className="link-button mt-3" onClick={() => { setForgot(false); setSent(false); setError('') }}>Back to sign in</Button> : <>
        <Button type="button" variant="outline" className="secondary-button login-submit h-auto mt-3" disabled={busy} onClick={() => { if (previewMode) onLogin({ ...DEMO_USER }, true); else { setEmail(DEMO_USER.studentId); if (!localStorage.getItem(DEMO_PASSWORD_KEY)) setPassword(DEMO_USER.password); setError('') } }}><GraduationCap size={17}/>{previewMode ? 'Open demo portal (no password)' : 'Fill demo registration number'}</Button>
        </>}
              </form>
      <span className="login-version">Student Portal</span>
    </div>
  </div>
}

function Sidebar({ page, setPage, data, onLogout, mobileOpen, setMobileOpen }) {
  const unread = data.notifications.filter(n => !n.read).length
  return <>
    {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu"/>}
    <aside className={cx('sidebar', mobileOpen && 'sidebar-open')}>
      <div className="sidebar-brand"><button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18}/></button></div>
      <nav className="side-nav">{navGroups.map(group => <div className="nav-group" key={group.label}><div className="nav-group-label">{group.label}</div>{group.items.map(item => {
        const Icon = item.icon
        const count = item.id === 'notifications' ? unread : item.id === 'assignments' ? data.assignments.filter(a => a.status !== 'Submitted').length : item.count
        return <button key={item.id} className={cx('nav-link', page === item.id && 'active')} onClick={() => { setPage(item.id); setMobileOpen(false) }}><Icon size={18}/><span>{item.label}</span>{count && <span className={cx('nav-count', item.id === 'notifications' && unread > 0 && 'nav-count-alert')}>{count}</span>}</button>
      })}</div>)}</nav>
      <div className="sidebar-bottom"><button className="nav-link logout-link" onClick={onLogout}><LogOut size={18}/><span>Sign out</span></button><button type="button" className="sidebar-user" aria-label="Open student profile" onClick={() => { setPage('profile'); setMobileOpen(false) }}><span className="avatar avatar-small">{initials(USER.name)}</span><span className="sidebar-user-text"><strong>{USER.name}</strong><span>Student account</span></span><MoreHorizontal size={18}/></button></div>
    </aside>
  </>
}

function ProfileMenu({ setPage, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDown = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = e => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown); window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey) }
  }, [open])
  const go = id => { setPage(id); setOpen(false) }
  return <div className="profile-menu-wrap" ref={ref}>
    <button className={cx('topbar-profile', open && 'is-open')} onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="menu"><div className="avatar">{initials(USER.name)}</div><div><strong>{USER.name}</strong><span>Student</span></div><ChevronDown size={15} className="profile-chevron"/></button>
    {open && <div className="profile-menu" role="menu">
      <div className="profile-menu-head"><div className="avatar">{initials(USER.name)}</div><div><strong>{USER.name}</strong><span>Reg No: {USER.studentId || '—'}</span><span>Batch {USER.batch || '—'}</span></div></div>
      <button role="menuitem" className="profile-menu-item" style={{ animationDelay: '40ms' }} onClick={() => go('profile')}><UserRound size={16}/>View full profile</button>
      <button role="menuitem" className="profile-menu-item profile-menu-danger" style={{ animationDelay: '80ms' }} onClick={() => { setOpen(false); onLogout?.() }}><LogOut size={16}/>Sign out</button>
    </div>}
  </div>
}

function Topbar({ page, setPage, data, search, setSearch, onLogout }) {
  const unread = data.notifications.filter(n => !n.read).length
  return <header className="topbar"><div className="topbar-left"><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><strong>{titles[page]?.[0] || 'Dashboard'}</strong></div></div><div className="topbar-actions"><div className="global-search"><Search size={16}/><input type="search" placeholder="Search anything..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search portal"/><kbd>⌘ K</kbd></div><button className="icon-button notification-button" aria-label="Open notifications" onClick={() => setPage('notifications')}><Bell size={19}/>{unread > 0 && <i/>}</button><div className="topbar-divider"/><ProfileMenu setPage={setPage} onLogout={onLogout}/></div></header>
}

function SectionHeading({ eyebrow, title, subtitle, action }) {
  return <div className="section-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>
}
function Panel({ title, subtitle, action, children, className = '' }) {
  return <section className={cx('panel', className)}><div className="panel-heading"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>
}
function ProgressBar({ value, color = 'violet' }) {
  return <div className="progress-track"><div className={cx('progress-fill', `fill-${color}`)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }}/></div>
}
function StatusPill({ children }) {
  const status = String(children).toLowerCase().replaceAll(' ', '-')
  return <span className={cx('status-pill', `status-${status}`)}><i/>{children}</span>
}
function EmptyState({ icon: Icon = Inbox, title, text }) {
  return <div className="empty-state"><div><Icon size={23}/></div><strong>{title}</strong><p>{text}</p></div>
}
function StatCard({ icon: Icon, label, value, detail, trend, tone = 'violet' }) {
  return <div className="stat-card"><div className="stat-top"><div className={cx('stat-icon', `tone-${tone}`)}><Icon size={19}/></div>{trend && <span className="stat-trend"><ArrowUpRight size={13}/>{trend}</span>}</div><div className="stat-value">{value}</div><div className="stat-label">{label}</div><div className="stat-detail">{detail}</div></div>
}

function Dashboard({ data, setPage }) {
  return <HubDashboard data={data} setPage={setPage}/>
}

function AboutInstitute() {
  return <div className="page-stack">
    <SectionHeading
      eyebrow="YOUR INSTITUTE"
      title="About the Institute"
      subtitle="Institute details, training focus, and location."
    />
    <section className="about-institute-card panel">
      <div className="about-institute-icon"><Building2 size={26}/></div>
      <div className="about-institute-copy">
        <span className="eyebrow">INSTITUTE PROFILE</span>
        <h3>Skill AI</h3>
        <p>A computer training and skill development institute in Mangalore.</p>
      </div>
      <div className="about-institute-details">
        <div className="about-institute-detail">
          <div className="about-institute-detail-icon"><GraduationCap size={19}/></div>
          <div>
            <h4>Institute Details &amp; Offerings</h4>
            <p>Computer training and skill development.</p>
          </div>
        </div>
        <div className="about-institute-detail">
          <div className="about-institute-detail-icon"><MapPin size={19}/></div>
          <div>
            <h4>Location</h4>
            <address>6th, Paradigm Plaza, Near RTO Office, Old Kent Road, Pandeshwar, Mangalore-575001, Karnataka</address>
            <a href="https://www.google.com/maps/search/?api=1&query=6th%2C+Paradigm+Plaza%2C+Near+RTO+Office%2C+Old+Kent+Road%2C+Pandeshwar%2C+Mangalore-575001%2C+Karnataka" target="_blank" rel="noreferrer">
              View on Google Maps <ExternalLink size={14}/>
            </a>
          </div>
        </div>
        <div className="about-institute-detail">
          <div className="about-institute-detail-icon"><Mail size={19}/></div>
          <div>
            <h4>Contact</h4>
            <div className="about-institute-contact-links">
              <a href="mailto:Connect@skillaiindia.com">Connect@skillaiindia.com</a>
              <a href="https://skillaiindia.com/" target="_blank" rel="noreferrer">
                skillaiindia.com <ExternalLink size={14}/>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
}
// eslint-disable-next-line no-unused-vars
function QuickLinks({ setPage }) {
  const items = navGroups.flatMap(g => g.items).filter(i => i.id !== 'dashboard')
  return <div className="page-stack"><div className="quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>{items.map(i => { const Icon = i.icon; return <button key={i.id} onClick={() => { setPage(i.id); window.scrollTo(0, 0) }} style={{ minHeight: 96, flexDirection: 'column', justifyContent: 'center' }}><Icon size={24}/>{i.label}</button> })}</div></div>
}

function Courses({ data, setPage }) {
  const [filter, setFilter] = useState('All modules')
  const [openModule, setOpenModule] = useState(() => data.courses.find(c => c.completed < c.lessons)?.id ?? data.courses[0]?.id ?? null)
  const mods = data.courses.map((c, i) => ({ ...c, state: c.progress === 100 ? 'Completed' : (i === 0 || data.courses[i - 1].progress === 100) ? 'Current' : 'Locked' }))
  const shown = mods.filter(c => filter === 'All modules' || c.state === filter)
  const done = mods.filter(c => c.state === 'Completed').length
  return <div className="page-stack roadmap-page">
    <SectionHeading
      eyebrow="MASTER'S PROGRAMME · INDUSTRY-EMBEDDED"
      title="Learning Roadmap"
      subtitle="Your journey, phase by phase — from AI foundations to an industry-ready capstone."
      action={<button className="secondary-button" onClick={() => setPage('materials')}><BookMarked size={16}/> Study materials</button>}
    />
    <div className="roadmap-programme panel">
      <div className="roadmap-programme-copy">
        <span className="eyebrow">YOUR PROGRAMME</span>
        <h3>{USER.program || 'Your programme'}</h3>
        <p>12 months · {mods.length} modules · Foundation to advanced</p>
      </div>
      <div className="roadmap-programme-progress">
        <span>{done} of {mods.length} modules completed</span>
        <ProgressBar value={mods.length ? (done / mods.length) * 100 : 0}/>
      </div>
    </div>
    <div className="filter-row">
      <div className="segmented">{['All modules', 'Current', 'Completed', 'Locked'].map(f => <button key={f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div>
      <span className="muted-text">{shown.length} phases</span>
    </div>
    <div className="roadmap-list">
      {shown.map(c => {
        const roadmap = MODULE_ROADMAP[c.id]
        const isOpen = openModule === c.id
        return <article key={c.id} className={cx('roadmap-module', `roadmap-${c.state.toLowerCase()}`, isOpen && 'open')}>
          <div className="roadmap-marker" aria-hidden="true">{c.state === 'Completed' ? <Check size={16}/> : String(c.id).padStart(2, '0')}</div>
          <div className="roadmap-module-content panel">
            <button className="roadmap-toggle" aria-expanded={isOpen} onClick={() => setOpenModule(isOpen ? null : c.id)}>
              <div className="roadmap-module-heading">
                <span className="roadmap-module-code">MODULE {String(c.id).padStart(2, '0')} · {c.code}</span>
                <span className="roadmap-duration">{c.duration} · {c.lessons} sessions</span>
                <StatusPill>{c.state}</StatusPill>
              </div>
              <h3>{c.title.replace(/^Module \d+: /, '')}</h3>
              <p>{roadmap?.overview}</p>
              <div className="roadmap-progress">
                <ProgressBar value={c.progress} color={c.color}/>
                <span>{c.completed}/{c.lessons} sessions · {c.progress}%</span>
                <ChevronDown size={18} className="roadmap-chevron"/>
              </div>
            </button>
            {isOpen && <div className="roadmap-details">
              <div className="roadmap-detail-section">
                <h4>Core subjects</h4>
                <div className="roadmap-tags">{c.subjects.map(s => <span className="roadmap-tag" key={s.num}><strong>{s.num}</strong>{s.name}</span>)}</div>
              </div>
              <div className="roadmap-detail-section">
                <h4>Skills you’ll build</h4>
                <div className="roadmap-skills">{(roadmap?.skills || []).map(skill => <span key={skill}><Sparkles size={13}/>{skill}</span>)}</div>
              </div>
              <div className="roadmap-detail-section">
                <h4>Career pathways</h4>
                <div className="roadmap-skills roadmap-roles">{(roadmap?.roles || []).map(role => <span key={role}><UserRound size={13}/>{role}</span>)}</div>
              </div>
              <div className="roadmap-lessons-heading">
                <h4>Lesson-by-lesson roadmap</h4>
                <span>{c.sessions.filter(s => s.done).length} of {c.sessions.length} completed</span>
              </div>
              <ol className="roadmap-lessons">{c.sessions.map(s => <li key={s.num} className={s.done ? 'lesson-complete' : ''}>
                <span className="roadmap-lesson-number">{String(s.num).padStart(2, '0')}</span>
                <span>{s.topic.replace(/^Session \d+: /, '')}</span>
                {s.done && <Check size={15} aria-label="Completed"/>}
              </li>)}</ol>
              {c.materials.length > 0 && <div className="roadmap-resources"><FileText size={15}/><strong>Module resources:</strong>{c.materials.map(m => <span key={m.name}>{m.name}</span>)}</div>}
            </div>}
          </div>
        </article>
      })}
    </div>
    {shown.length === 0 && <EmptyState title="No modules here" text="Modules in your course will appear here."/>}
  </div>
}

function Materials({ data, search }) {
  const [open, setOpen] = useState(() => (data.courses.find(c => c.progress < 100) || data.courses[0]).id)
  const q = search.toLowerCase()
  const totalNotes = data.courses.reduce((n, c) => n + c.sessions.filter(s => s.done).length, 0)
  return <div className="page-stack"><SectionHeading eyebrow="LEARNING LIBRARY" title="Study Materials" subtitle="Open a module to get its lesson-wise notes."/><div className="resource-summary"><div><div className="resource-summary-icon"><BookMarked size={20}/></div><div><strong>{totalNotes} lesson notes ready</strong><span>Across {data.courses.length} modules</span></div></div><span className="library-label"><ShieldCheck size={15}/> Student library</span></div>
    <div className="mat-modules">{data.courses.map(c => {
      const lessons = c.sessions.filter(s => !q || `${s.topic} ${c.title}`.toLowerCase().includes(q))
      if (q && !lessons.length) return null
      const ready = c.sessions.filter(s => s.done).length
      const isOpen = open === c.id || !!q
      return <section key={c.id} className={cx('panel mat-module', isOpen && 'open')}>
        <button className="mat-head" onClick={() => setOpen(open === c.id ? null : c.id)} aria-expanded={isOpen}>
          <div className={cx('file-icon', `banner-${c.color}`)}><BookOpen size={18}/></div>
          <div className="mat-title"><strong>{c.title}</strong><span className="muted-text">{c.sessions.length} lessons · {ready} notes available</span></div>
          <ChevronDown size={18} className="mat-chev"/>
        </button>
        {isOpen && <div className="mat-body">
          {c.materials.length > 0 && <div className="mat-extra"><span className="eyebrow">MODULE RESOURCES</span>{c.materials.map(m => <span key={m.name} className="course-tag"><FileText size={13}/> {m.name}</span>)}</div>}
          <ol className="mat-lessons">{lessons.map(s => {
            const name = s.topic.replace(/^Session \d+: /, '')
            return <li key={s.num} className={s.done ? '' : 'locked'}>
              <span className="session-num">{s.num}</span>
              <div className="mat-lesson"><strong>Lesson {s.num}: {name}</strong><span className="muted-text">{s.done ? 'Lesson notes · PDF · 850 KB' : 'Notes available after this class'}</span></div>
              {s.done ? <button className="primary-button small-download" aria-label={`Download notes for lesson ${s.num}`}><Download size={15}/> Notes</button> : <span className="type-pill"><LockKeyhole size={12}/> Soon</span>}
            </li>
          })}</ol>
        </div>}
      </section>
    })}</div>
    {q && !data.courses.some(c => c.sessions.some(s => `${s.topic} ${c.title}`.toLowerCase().includes(q))) && <EmptyState title="No matching lessons" text="Try another search."/>}
  </div>
}

function Timetable({ data }) {
  const [batches] = useState(loadBatches)
  const batch = studentBatches(batches, USER.email)[0]
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const weekDates = getWeekDates(weekStart)
  const modules = buildBatchModuleSchedule(data.courses, batch?.startDate)
  const batchDays = new Set((batch?.days || '').split(',').map(day => day.trim()).filter(Boolean))
  const weekLabel = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' })
  const weekYear = new Intl.DateTimeFormat('en-IN', { year: 'numeric' })
  const firstDay = weekDates[0]
  const lastDay = weekDates[weekDates.length - 1]
  const rangeLabel = firstDay.getFullYear() === lastDay.getFullYear()
    ? `${weekLabel.format(firstDay)} – ${weekLabel.format(lastDay)}, ${weekYear.format(lastDay)}`
    : `${new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(firstDay)} – ${new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(lastDay)}`

  return <div className="page-stack">
    <SectionHeading eyebrow="YOUR WEEK AT A GLANCE" title="Class Timetable" subtitle="Browse your module classes week by week."/>
    {batch ? <>
      <section className="calendar-batch-summary">
        <div className="calendar-batch-icon"><Layers size={19}/></div>
        <div className="calendar-batch-name"><span>ASSIGNED BATCH · {batch.id}</span><strong>{batch.name}</strong><small>{batch.course}</small></div>
        <div className="calendar-batch-time"><Clock3 size={16}/><span>{batch.days} · {fmtTime(batch.time)} – {endTime(batch.time, batch.duration)}</span></div>
        <div className="calendar-batch-location"><Building2 size={15}/><span>{batch.mode} · {batch.room || 'Location to be confirmed'}</span></div>
      </section>
      <div className="week-calendar-toolbar">
        <div className="week-calendar-heading"><span>WEEKLY SCHEDULE</span><strong>{rangeLabel}</strong></div>
        <div className="week-calendar-actions">
          <button className="secondary-button" onClick={() => setWeekStart(getWeekStart(new Date()))}>Today</button>
          <button className="week-step-button" aria-label="Previous week" onClick={() => setWeekStart(date => new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7))}><ChevronLeft size={17}/></button>
          <button className="week-step-button" aria-label="Next week" onClick={() => setWeekStart(date => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7))}><ChevronRight size={17}/></button>
        </div>
      </div>
      <div className="timetable-grid calendar-week-grid">
        {weekDates.map(date => {
          const key = toDateKey(date)
          const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
          const module = modules.find(item => key >= item.startDate && key <= item.endDate)
          const isBatchDay = batchDays.has(dayName)
          const inBatchPeriod = key >= batch.startDate && key <= batch.endDate
          const hasClass = isBatchDay && inBatchPeriod && module
          const isToday = key === toDateKey(new Date())
          return <section className={`day-column calendar-day-column${isToday ? ' today-column' : ''}`} key={key}>
            <div className="day-header"><span>{new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(date)}</span><strong>{date.getDate()}</strong></div>
            {isToday && <span className="calendar-today-label">TODAY</span>}
            <div className="day-classes">
              {hasClass ? <article className={`class-card calendar-class-card class-${module.color}`}>
                <span className="calendar-module-label">MODULE {module.id} · PLANNED CLASS</span>
                <strong>{module.title.replace(/^Module \d+: /, '')}</strong>
                <span className="class-time"><Clock3 size={12}/>{fmtTime(batch.time)} – {endTime(batch.time, batch.duration)}</span>
                <small className="class-room">{batch.room || batch.mode}</small>
              </article> : <p className="calendar-empty-day">{!inBatchPeriod ? 'Outside batch dates' : isBatchDay ? 'No module scheduled' : 'No class'}</p>}
            </div>
          </section>
        })}
      </div>
      <div className="notice-card"><CalendarCheck size={19}/><div><strong>Module schedule</strong><p>Module dates follow the course plan, aligned to your batch start date. Regular classes follow your assigned batch days and times; check notifications for any updates.</p></div></div>
    </> : <div className="panel empty-state"><div><CalendarDays size={20}/></div><strong>No batch assigned yet</strong><p>Your module timetable and class timings will appear here after the admin team assigns your batch.</p></div>}
  </div>
}

function Attendance({ data }) {
  const [term, setTerm] = useState(() => {
    const currentCourse =
      data.courses.find(c => c.completed < c.lessons) ??
      data.courses[data.courses.length - 1]
    return currentCourse?.title ?? 'All modules'
  })
  const short = d => { const [dd, mm] = d.split(' '); return `${dd}-${mm}` }
  const toNum = d => { const dt = new Date(d); return isNaN(dt) ? d : `${String(dt.getDate()).padStart(2, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${dt.getFullYear()}` }
  const selectedSem = term === 'All modules' ? null : data.courses.find(c => c.title === term) || null
  const shown = selectedSem ? [selectedSem] : data.courses
  const recordsFor = c => data.attendance.filter(a => c.title.endsWith(a.course))
  const rows = shown.map(c => {
    const r = recordsFor(c)
    const attended = r.filter(a => a.status === 'Present')
    const absent = r.filter(a => a.status === 'Absent')
    const pct = r.length ? (attended.length / r.length * 100) : null
    return { code: c.code, title: c.title, subject: c.title.replace(/^Module \d+: /, ''), faculty: c.instructor, conducted: r.length, attended: attended.length, pct, absent: absent.map(a => short(a.date)).reverse().join(', '), last: attended[0] ? toNum(attended[0].date) : '—' }
  })
  return <div className="page-stack">
    <div className="panel att-report"><h3 className="att-title">Your Attendance Report</h3><label className="field-label att-label">MODULE</label><select className="select-control att-select" value={term} onChange={e => setTerm(e.target.value)}><option>All modules</option>{data.courses.map(c => <option key={c.id}>{c.title}</option>)}</select><span className="muted-text">{shown.length} of {data.courses.length} modules shown</span></div>
    <div className="panel att-table-panel"><div className="table-scroll"><table className="att-table"><thead><tr><th>CODE</th><th>MODULE</th><th>FACULTY</th><th>CONDUCTED</th><th>ATTENDED</th><th>EXEMPTED</th><th>EXCUSED</th><th>ALLOWED</th><th>%</th><th>ABSENT DATES</th><th>LAST ATTENDED</th></tr></thead><tbody>{rows.map(r => <tr key={r.code}><td>{r.code}</td><td>{r.subject}</td><td>{r.faculty}</td><td>{r.conducted}</td><td>{r.attended}</td><td>0</td><td>0</td><td>0</td><td className={r.pct === null ? '' : r.pct < 75 ? 'att-low' : 'att-ok'}>{r.pct === null ? '—' : `${r.pct.toFixed(2)}%`}</td><td>{r.absent || '—'}</td><td>{r.last}</td></tr>)}</tbody></table></div>{rows.length === 0 && <EmptyState title="No attendance yet" text="Attendance appears once classes for this module are held."/>}</div>
  </div>
}

function downloadMarkCard(data) {
  const published = data.marks.filter(m => m.status === 'Published' && m.score !== null)
  const totalScore = published.reduce((s, m) => s + m.score, 0)
  const totalPossible = published.reduce((s, m) => s + m.total, 0)
  const overall = Math.round(totalScore / Math.max(1, totalPossible) * 100)
  const rows = published.map(m => `<tr><td>Module ${m.module}</td><td>${m.subject} (${m.code})</td><td>${m.examType || 'Module Final'}</td><td>${m.date}</td><td>${m.score}/${m.total}</td><td>${getGrade(percent(m.score, m.total))}</td></tr>`).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mark Card - ${USER.name}</title><style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#222}h1{font-size:22px;margin-bottom:2px}.sub{color:#666;font-size:13px;margin-bottom:24px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #ccc;padding:8px 10px;font-size:13px;text-align:left}th{background:#f4f4f4}.overall{margin-top:18px;font-size:15px;font-weight:bold}.foot{margin-top:30px;font-size:11px;color:#888}</style></head><body><h1>Skill AI — Student Mark Card</h1><div class="sub">${USER.name} · Student ID ${USER.studentId} · Batch ${USER.batch} · ${USER.program || ''}</div><table><thead><tr><th>Module</th><th>Subject</th><th>Exam</th><th>Date</th><th>Score</th><th>Grade</th></tr></thead><tbody>${rows}</tbody></table><p class="overall">Overall score: ${overall}% (${totalScore} out of ${totalPossible} points)</p><p class="foot">Generated from the Student Portal on ${new Date().toLocaleDateString('en-IN')}. Marks are published module-wise by the institute.</p></body></html>`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mark-card-${String(USER.studentId || 'student').toLowerCase()}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}

function downloadFeeReceipt(fee, fees) {
  const isPaid = fee.status === 'Paid' && fee.receipt
  if (isPaid) {
    const receipt = buildFeeReceiptData(fee, fees, USER)
    downloadFeeReceiptDocx(receipt).catch(error => {
      console.error('Fee receipt download failed.', error)
      window.alert(`Could not generate the fee receipt: ${error instanceof Error ? error.message : String(error)}`)
    })
    return
  }
  const title = `Fee Challan ${fee.id}`
  const rows = [
    ['Challan number', fee.id],
    ['Module', `Module ${fee.module} (${fee.code})`],
    ['Course / subject', fee.title],
    ['Amount', fee.amount === null ? 'Not set — awaiting fee confirmation' : rupee(fee.amount)],
    ['Due date', fee.date || 'Not scheduled'],
    ['Status', fee.status],
  ]
  const tableRows = rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title} - ${USER.name}</title><style>body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;color:#222}h1{font-size:22px;margin-bottom:2px}.sub{color:#666;font-size:13px;margin-bottom:24px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #ccc;padding:8px 10px;font-size:13px;text-align:left}th{background:#f4f4f4;width:35%}.foot{margin-top:30px;font-size:11px;color:#888}</style></head><body><h1>Skill AI — Fee Challan</h1><div class="sub">${USER.name} · Student ID ${USER.studentId} · Batch ${USER.batch} · ${USER.program || ''}</div><table><tbody>${tableRows}</tbody></table><p class="foot">This challan reflects the current fee status on record. Amount and payment details are set by the institute once the fee is confirmed. Generated from the Student Portal on ${new Date().toLocaleDateString('en-IN')}.</p></body></html>`
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `fee-challan-${fee.id.toLowerCase()}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}


function Marks({ data }) {
  const published = data.marks.filter(m => m.status === 'Published' && m.score !== null)
  const totalScore = published.reduce((s, m) => s + m.score, 0)
  const totalPossible = published.reduce((s, m) => s + m.total, 0)
  const remaining = data.marks.filter(m => m.status !== 'Published').length
  const [showCard, setShowCard] = usePortalState('markCard', false)
  const overallPct = Math.round(totalScore / Math.max(1, totalPossible) * 100)
  const publishedModules = new Set(published.map(m => m.module)).size
  return <div className="page-stack"><SectionHeading eyebrow="ACADEMIC PERFORMANCE" title="Marks & Results" subtitle="Theory and practical marks are published module-wise after each module ends."/><div className="stats-grid three-stats"><StatCard icon={ChartNoAxesColumn} label="Modules published" value={publishedModules} detail="Module marks released" tone="violet"/><StatCard icon={TrendingUp} label="Overall score" value={`${Math.round(totalScore / Math.max(1, totalPossible) * 100)}%`} detail={`${totalScore} out of ${totalPossible} points`} tone="green"/><StatCard icon={Clock3} label="Marks remaining" value={remaining} detail="Theory and practical marks pending" tone="orange"/></div><Panel title="Module marks" subtitle="Module 2 includes separate 100-mark Theory and Practical exams"><div className="table-scroll"><table><thead><tr><th>MODULE</th><th>SUBJECT</th><th>EXAM</th><th>DATE</th><th>SCORE</th><th>GRADE</th><th>STATUS</th></tr></thead><tbody>{data.marks.map(m => <tr key={m.id}><td><div className="leave-request-cell"><strong>Module {m.module}</strong><span>{m.code}</span></div></td><td>{m.subject}</td><td>{m.examType ? <span className="course-tag">{m.examType}</span> : 'Module Final'}</td><td className="muted-text">{m.date}</td><td>{m.score === null ? '—' : <strong>{m.score}<span className="muted-text">/{m.total}</span></strong>}</td><td>{m.score === null ? '—' : <span className="grade-pill">{getGrade(percent(m.score, m.total))}</span>}</td><td><StatusPill>{m.status}</StatusPill></td></tr>)}</tbody></table></div></Panel><Panel title="Instructor feedback" subtitle="Notes shared with your published marks"><div className="feedback-list">{published.length ? published.map(m => <div className="feedback-row" key={m.id}><div className="feedback-icon"><MessageSquare size={17}/></div><div><strong>Module {m.module} · {m.examType || 'Module Final'} · {m.subject}</strong><span>{m.code}</span><p>{m.feedback}</p></div></div>) : <EmptyState title="No feedback yet" text="Feedback appears alongside each published module mark."/>}</div></Panel><div className="notice-card"><ShieldCheck size={19}/><div><strong>How module marks work</strong><p>Each module publishes its exam marks after the module ends. Module 2 has two separate exams: Theory and Practical, with 100 marks each.</p></div></div>{showCard && <Modal title="Mark card" onClose={() => setShowCard(false)}><div className="modal-course-tag">{USER.program || 'Your program'}</div><h3 className="modal-assignment-title">{USER.name}</h3><p className="modal-description">Student ID {USER.studentId} · Batch {USER.batch}</p><div className="table-scroll"><table><thead><tr><th>MODULE</th><th>EXAM</th><th>SUBJECT</th><th>SCORE</th><th>GRADE</th></tr></thead><tbody>{published.map(m => <tr key={m.id}><td><strong className="normal-weight">Module {m.module}</strong></td><td>{m.examType || 'Module Final'}</td><td>{m.subject}</td><td><strong>{m.score}<span className="muted-text">/{m.total}</span></strong></td><td><span className="grade-pill">{getGrade(percent(m.score, m.total))}</span></td></tr>)}</tbody></table></div>{published.length === 0 && <EmptyState title="No published marks yet" text="Your mark card will fill in as module marks are published."/>}<p style={{ marginTop: 14, fontWeight: 700 }}>Overall score: {overallPct}% <span className="muted-text">({totalScore} out of {totalPossible} points)</span></p><div className="modal-actions"><button className="secondary-button" onClick={() => setShowCard(false)}>Close</button><button className="primary-button" onClick={() => downloadMarkCard(data)}><Download size={15}/> Download</button></div></Modal>}</div>
}

function Assignments({ data, updateData }) {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = usePortalState('assignmentTask', null)
  const [submission, setSubmission] = useState('')
  const [fileName, setFileName] = useState('')
  const [notice, setNotice] = useState('')
  const [subject, setSubject] = useState('All modules')
  const [viewing, setViewing] = usePortalState('assignmentSubmission', null)
  const filtered = data.assignments.filter(a => (filter === 'All' || a.status === filter) && (subject === 'All modules' || a.course === subject)).sort((a, b) => (a.status === 'Submitted') - (b.status === 'Submitted') || new Date(a.due) - new Date(b.due))
  function submitAssignment(e) {
    e.preventDefault()
    if (!submission.trim() && !fileName) return
    updateData(d => ({ ...d, assignments: d.assignments.map(a => a.id === selected.id ? { ...a, status: 'Submitted', submission: submission.trim(), fileName, submittedAt: new Date().toLocaleDateString('en-IN') } : a), notifications: [{ id: Date.now(), title: 'Assignment submitted', message: `${selected.title} was submitted successfully.`, time: 'Just now', read: false, kind: 'assignment' }, ...d.notifications] }))
    setNotice('Assignment submitted.')
    setSelected(null); setSubmission(''); setFileName('')
  }
  return <div className="page-stack"><SectionHeading eyebrow="STAY ON TRACK" title="Assignments" subtitle="Keep an eye on deadlines and submit your work on time."/><div className="stats-grid three-stats"><StatCard icon={ClipboardList} label="Total assignments" value={data.assignments.length} detail="Across all subjects" tone="violet"/><StatCard icon={Clock3} label="To do" value={data.assignments.filter(a => a.status !== 'Submitted').length} detail="Need your attention" tone="orange"/><StatCard icon={CheckCircle2} label="Submitted" value={data.assignments.filter(a => a.status === 'Submitted').length} detail="Sent for review" tone="green"/></div>{notice && <div className="success-banner"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice('')}><X size={15}/></button></div>}<div className="filter-row"><div className="segmented">{['All', 'Not started', 'In progress', 'Submitted'].map(f => <button className={filter === f ? 'selected' : ''} key={f} onClick={() => setFilter(f)}>{f}</button>)}</div><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><select className="select-control" aria-label="Filter by module" value={subject} onChange={e => setSubject(e.target.value)}><option>All modules</option>{[...new Set(data.assignments.map(a => a.course))].map(c => <option key={c}>{c}</option>)}</select><span className="muted-text">{filtered.length} tasks</span></div></div><div className="assignment-list">{filtered.map(a => <article className="assignment-card" key={a.id}><div className={cx('assignment-icon', a.status === 'Submitted' ? 'assignment-done' : 'assignment-open')}>{a.status === 'Submitted' ? <CheckCircle2 size={21}/> : <ClipboardList size={21}/>}</div><div className="assignment-main"><div className="assignment-topline"><span className="course-tag">{a.course}</span><StatusPill>{a.status}</StatusPill></div><h3>{a.title}</h3><p>{a.description}</p><div className="assignment-meta"><DueTag a={a}/><span><CalendarDays size={14}/>Due {a.due}</span><span><Award size={14}/>{a.points} points</span>{a.submittedAt && <span><Check size={14}/>Submitted {a.submittedAt}</span>}</div></div>{a.status === 'Submitted' ? <button className="secondary-button" onClick={() => setViewing(a)}><Eye size={15}/> View submission</button> : <button className="primary-button" onClick={() => { setSelected(a); setSubmission(a.submission || ''); setFileName(a.fileName || '') }}>Open task <ArrowRight size={15}/></button>}</article>)}</div>{filtered.length === 0 && <EmptyState title="Nothing here" text="No tasks match these filters."/>}{viewing && <Modal title="Your submission" onClose={() => setViewing(null)}><div className="modal-course-tag">{viewing.course}</div><h3 className="modal-assignment-title">{viewing.title}</h3><p className="modal-description">Submitted {viewing.submittedAt || 'on time'} · {viewing.points} points</p><label className="field-label">Your answer</label><p className="submission-box">{viewing.submission || 'No written answer was added.'}</p>{viewing.fileName && <span className="selected-file"><FileText size={14}/>{viewing.fileName}</span>}<div className="modal-actions"><button className="primary-button" onClick={() => setViewing(null)}>Done</button></div></Modal>}{selected && <Modal title="Submit assignment" onClose={() => setSelected(null)}><div className="modal-course-tag">{selected.course}</div><h3 className="modal-assignment-title">{selected.title}</h3><p className="modal-description">{selected.description}</p><form onSubmit={submitAssignment}><label className="field-label" htmlFor="submission">Your answer or submission link</label><textarea id="submission" rows="4" value={submission} onChange={e => setSubmission(e.target.value)} placeholder="Write a short note or paste a link to your work..."/><label className="field-label file-label" htmlFor="assignment-file"><Paperclip size={15}/> Attach a file</label><input id="assignment-file" className="file-input" type="file" onChange={e => setFileName(e.target.files?.[0]?.name || '')}/>{fileName && <span className="selected-file"><FileText size={14}/>{fileName}</span>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setSelected(null)}>Cancel</button><button className="primary-button" type="submit"><Send size={15}/> Submit work</button></div></form></Modal>}</div>
}

function Modal({ title, onClose, children, wide, className = '', portal = false }) {
  useEffect(() => { const handler = e => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler) }, [onClose])
  const content = <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><div className={cx('modal-card', wide && 'modal-wide', className)} role="dialog" aria-modal="true" aria-label={title}><div className="modal-header"><h3>{title}</h3><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18}/></button></div>{children}</div></div>
  return portal ? createPortal(content, document.body) : content
}

function Leave({ data, updateData }) {
  const { user } = useCloudAuth()
  const [busy, setBusy] = useState(false)
  const [showForm, setShowForm] = usePortalState('leaveForm', false)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ type: 'Personal', name: USER.name || '', course: USER.program || '', admission: USER.studentId || '', from: '', to: '', reason: '', rejoin: '', doc: '', guardian: '', agree: false })
  const [details, setDetails] = usePortalState('leaveDetails', null)
  const leaves = [...data.leaves].sort((a, b) => b.id.localeCompare(a.id))
  async function apply(e) {
    e.preventDefault()
    if (busy) return
    if (new Date(form.to) < new Date(form.from)) { setNotice('The end date must be on or after the start date.'); return }
    const days = form.daysEdited && Number(form.days) > 0 ? Number(form.days) : Math.round((new Date(form.to) - new Date(form.from)) / 86400000) + 1
    const fmt = date => new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const item = { id: `LV-${Math.floor(1000 + Math.random() * 9000)}`, type: form.type, from: fmt(form.from), to: fmt(form.to), days, reason: form.reason, name: form.name, course: form.course, admission: form.admission, rejoin: form.rejoin ? fmt(form.rejoin) : '', doc: form.doc, guardian: form.guardian, status: 'Pending', remarks: 'Your request has been submitted and is awaiting staff review.', applied: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
    setBusy(true)
    try {
      if (data.live) {
        if (!user) throw new Error('Sign in again to submit your request.')
        const { data: saved, error } = await supabase.from('leave_requests').insert({ user_id: user.id, from_date: form.from, to_date: form.to, reason: form.reason, details: form, status: 'Pending' }).select('id').single()
        if (error) throw error
        item.id = saved.id
      }
      updateData(d => ({ ...d, leaves: [item, ...d.leaves] }))
    } catch { setNotice('Could not submit your leave request. Please try again.'); return }
    finally { setBusy(false) }
    setForm({ type: 'Personal', name: USER.name || '', course: USER.program || '', admission: USER.studentId || '', from: '', to: '', reason: '', rejoin: '', doc: '', guardian: '', agree: false }); setShowForm(false); setNotice(`Leave request ${item.id} submitted successfully.`)
  }
  return <div className="page-stack"><SectionHeading eyebrow="TIME AWAY" title="Leave Applications" subtitle="Submit a request and follow its approval status." action={<button className="primary-button" onClick={() => setShowForm(true)}><CirclePlus size={16}/> Apply for leave</button>}/>{notice && <div className={cx('success-banner', notice.startsWith('The end') && 'error-banner')}><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice('')}><X size={15}/></button></div>}<div className="stats-grid three-stats"><StatCard icon={FileCheck2} label="Total requests" value={data.leaves.length} detail="Leave applications" tone="violet"/><StatCard icon={Clock3} label="Pending review" value={data.leaves.filter(l => l.status === 'Pending').length} detail="Awaiting a decision" tone="orange"/><StatCard icon={CheckCircle2} label="Approved" value={data.leaves.filter(l => l.status === 'Approved').length} detail="Approved requests" tone="green"/></div><Panel title="Your leave requests" subtitle="View the current status and any staff remarks"><div className="table-scroll"><table><thead><tr><th>REQUEST</th><th>LEAVE DATES</th><th>DAYS</th><th>STATUS</th><th/></tr></thead><tbody>{leaves.map(l => <tr key={l.id}><td><div className="leave-request-cell"><strong>{l.type} leave</strong><span>{l.id} · Applied {l.applied}</span></div></td><td>{l.from}{l.to !== l.from && <><br/><span className="muted-text">to {l.to}</span></>}</td><td>{l.days}</td><td><StatusPill>{l.status}</StatusPill></td><td><button className="text-button" onClick={() => setDetails(l)}>Details</button></td></tr>)}</tbody></table></div>{leaves.length === 0 && <EmptyState title="No leave requests yet" text="Use Apply for leave to submit your first request."/>}</Panel>{showForm && <Modal wide title="Apply for leave" onClose={() => setShowForm(false)}><form onSubmit={apply} className="leave-form"><LeaveLetter form={form} set={setForm} onFile={doc => setForm(f => ({ ...f, doc }))}/><label className="muted-text" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}><input type="checkbox" checked={form.agree} onChange={e => setForm({ ...form, agree: e.target.checked })} required style={{ width: 'auto', marginTop: 3 }}/>I confirm the details in this letter are correct.</label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" type="submit"><Send size={15}/> Submit application</button></div></form></Modal>}{details && <Modal wide title={`Leave request ${details.id}`} onClose={() => setDetails(null)}><div className="leave-detail-top"><div className="detail-badge"><FileCheck2 size={20}/></div><div><strong>{details.type} leave</strong><span>{details.from}{details.to !== details.from ? ` – ${details.to}` : ''} · {details.days} day(s)</span></div><StatusPill>{details.status}</StatusPill></div><LeaveLetter form={{ ...details, name: details.name || USER.name, course: details.course || USER.program, admission: details.admission || USER.studentId, fromLabel: details.from, toLabel: details.to, rejoinLabel: details.rejoin, dateLabel: details.applied }}/><div className="modal-actions"><button className="secondary-button" onClick={() => setDetails(null)}>Close</button><button className="primary-button" onClick={() => downloadLeaveDocx({ ...details, name: details.name || USER.name, course: details.course || USER.program, admission: details.admission || USER.studentId })}><Download size={15}/> Download letter (.docx)</button></div></Modal>}</div>
}

function Certificates({ data }) {
  const [selected, setSelected] = usePortalState('certificate', null)
  return <div className="page-stack"><SectionHeading eyebrow="YOUR ACHIEVEMENTS" title="Certificates" subtitle="Celebrate your progress and view your course achievements."/><div className="certificate-banner"><div className="certificate-banner-icon"><Award size={27}/></div><div><span className="eyebrow light">EVERY STEP COUNTS</span><h3>You're building something great.</h3><p>Your completed learning milestones will appear here as certificates.</p></div><div className="certificate-banner-art"><Award size={86}/></div></div><div className="course-grid certificate-grid">{data.certificates.map(c => <article className="certificate-card" key={c.id}><div className="certificate-art"><div className="certificate-seal"><Award size={28}/></div><span className="certificate-watermark">C</span><span className="certificate-caption">CERTIFICATE OF ACHIEVEMENT</span><strong>{c.title}</strong><span className="certificate-institute">{c.issuer}</span></div><div className="certificate-card-bottom"><div><strong>{c.title}</strong><span>{c.status === 'Issued' ? `Issued ${c.date}` : 'Complete the course to unlock'}</span></div><StatusPill>{c.status}</StatusPill><button className="icon-button" disabled={c.status !== 'Issued'} onClick={() => setSelected(c)} title="View certificate"><ExternalLink size={16}/></button></div></article>)}</div>{selected && <Modal title="Certificate preview" onClose={() => setSelected(null)}><div className="certificate-preview"><Award size={38}/><span>CERTIFICATE OF ACHIEVEMENT</span><h3>{selected.title}</h3><p>This is to recognise the learning milestone achieved by</p><strong>{USER.name}</strong><p>Issued by {selected.issuer}</p><small>{selected.id} · {selected.date}</small></div><div className="modal-actions"><button className="secondary-button" onClick={() => setSelected(null)}>Close preview</button></div></Modal>}</div>
}

function Notifications({ data, updateData }) {
  const [filter, setFilter] = useState('All')
  const list = data.notifications.filter(n => filter === 'All' || (filter === 'Unread' ? !n.read : n.read))
  function markAll() { updateData(d => ({ ...d, notifications: d.notifications.map(n => ({ ...n, read: true })) })) }
  function markOne(id) { updateData(d => ({ ...d, notifications: d.notifications.map(n => n.id === id ? { ...n, read: true } : n) })) }
  return <div className="page-stack"><SectionHeading eyebrow="YOUR UPDATES" title="Notifications" subtitle="A quick look at what’s new across your learning space." action={<button className="secondary-button" onClick={markAll}><Check size={15}/> Mark all as read</button>}/><div className="filter-row"><div className="segmented">{['All', 'Unread', 'Read'].map(f => <button key={f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div><span className="muted-text">{list.length} updates</span></div><div className="notification-list">{list.map(n => <article className={cx('notification-card', !n.read && 'notification-unread')} key={n.id}><div className={cx('notification-icon', `notify-${n.kind}`)}>{n.kind === 'result' ? <ChartNoAxesColumn size={19}/> : n.kind === 'assignment' ? <ClipboardList size={19}/> : n.kind === 'leave' ? <FileCheck2 size={19}/> : <BookOpen size={19}/>}</div><div className="notification-content"><div className="notification-title"><strong>{n.title}</strong>{!n.read && <span className="unread-label">NEW</span>}</div><p>{n.message}</p><span><Clock3 size={13}/>{n.time}</span></div>{!n.read && <button className="text-button" onClick={() => markOne(n.id)}>Mark read</button>}</article>)}</div>{list.length === 0 && <EmptyState icon={Bell} title="All caught up" text="There are no notifications in this view."/>}</div>
}

function LegacyProfile({ data, updateData, onReset }) {
  const [profile, setProfile] = useState({ name: USER.name, email: USER.email, phone: USER.phone, program: USER.program, batch: USER.batch })
  const [saved, setSaved] = useState(false)
  useEffect(() => { try { const p = JSON.parse(localStorage.getItem(profileKey()) || 'null'); if (p) setProfile(p) } catch {} }, [])
  function save(e) { e.preventDefault(); localStorage.setItem(profileKey(), JSON.stringify(profile)); setSaved(true); setTimeout(() => setSaved(false), 2500) }
  function reset() { if (window.confirm('Reset all your saved data and profile edits?')) { onReset(); setProfile({ name: USER.name, email: USER.email, phone: USER.phone, program: USER.program, batch: USER.batch }); localStorage.removeItem(profileKey()); setSaved(false) } }
  return <div className="page-stack"><SectionHeading eyebrow="YOUR ACCOUNT" title="My Profile" subtitle="Keep your student information up to date."/><div className="profile-layout"><div className="profile-main"><section className="panel profile-card"><div className="profile-cover"><div className="profile-avatar-large">{initials(profile.name)}</div></div><div className="profile-summary"><div><h3>{profile.name}</h3><p>{profile.program} · {profile.batch}</p><span className="verified-label"><ShieldCheck size={14}/> Student account</span></div><span className="student-id">{USER.studentId}</span></div><div className="profile-divider"/><form className="profile-form" onSubmit={save}><div className="profile-form-heading"><h3>Personal information</h3><p>These details are stored on this device.</p></div><div className="form-two-col"><div><label className="field-label" htmlFor="profile-name">Full name</label><input id="profile-name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required/></div><div><label className="field-label" htmlFor="profile-email">Email address</label><input id="profile-email" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} required/></div><div><label className="field-label" htmlFor="profile-phone">Phone number</label><input id="profile-phone" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}/></div><div><label className="field-label" htmlFor="profile-program">Program</label><input id="profile-program" value={profile.program} onChange={e => setProfile({ ...profile, program: e.target.value })}/></div><div><label className="field-label" htmlFor="profile-batch">Batch</label><input id="profile-batch" value={profile.batch} onChange={e => setProfile({ ...profile, batch: e.target.value })}/></div><div><label className="field-label" htmlFor="profile-id">Student ID</label><input id="profile-id" value={USER.studentId} disabled/></div></div><div className="profile-actions">{saved && <span className="saved-note"><CheckCircle2 size={15}/> Changes saved</span>}<button type="submit" className="primary-button">Save changes <Check size={15}/></button></div></form></section></div><div className="profile-aside"><Panel title="Account details"><div className="account-detail"><span><Mail size={15}/> Email</span><strong>{USER.email}</strong></div><div className="account-detail"><span><GraduationCap size={15}/> Student ID</span><strong>{USER.studentId}</strong></div><div className="account-detail"><span><CalendarDays size={15}/> Joined</span><strong>{USER.joined}</strong></div><div className="account-detail"><span><ShieldCheck size={15}/> Account type</span><strong>Student</strong></div></Panel><Panel title="Data settings"><p className="settings-description">Reset your local changes and return to the original records.</p><button className="danger-outline-button" onClick={reset}><RotateCcw size={15}/> Reset data</button></Panel></div></div></div>
}

function SearchResults({ query, data, setPage }) {
  const q = query.toLowerCase().trim()
  if (!q) return null
  const results = [
    ...data.courses.filter(c => `${c.title} ${c.instructor}`.toLowerCase().includes(q)).map(c => ({ type: 'Course', title: c.title, subtitle: c.instructor, page: 'courses' })),
    ...data.assignments.filter(a => `${a.title} ${a.course}`.toLowerCase().includes(q)).map(a => ({ type: 'Assignment', title: a.title, subtitle: a.due, page: 'assignments' })),
    ...data.marks.filter(m => `module ${m.module} ${m.subject} ${m.code}`.toLowerCase().includes(q)).map(m => ({ type: 'Module mark', title: m.subject, subtitle: `Module ${m.module} · ${m.code}`, page: 'marks' })),
    ...data.notifications.filter(n => `${n.title} ${n.message}`.toLowerCase().includes(q)).map(n => ({ type: 'Notification', title: n.title, subtitle: n.time, page: 'notifications' })),
  ]
  return <div className="search-results"><div className="search-results-heading"><Search size={16}/> Results for “{query}” <span>{results.length}</span></div>{results.length ? results.map((r, i) => <button key={`${r.type}-${i}`} onClick={() => setPage(r.page)}><div><strong>{r.title}</strong><span>{r.type} · {r.subtitle}</span></div><ArrowRight size={15}/></button>) : <p>No matches found. Try a course or assignment name.</p>}</div>
}

export default function App() {
  return <PortalNavigation><PortalApp/></PortalNavigation>
}

function getDemoOnboardingStep() {
  if (!localStorage.getItem(DEMO_PASSWORD_KEY)) return 'password'
  try {
    const profile = JSON.parse(localStorage.getItem(profileKey()) || 'null') || {}
    const mergedProfile = { ...USER, ...profile }
    for (const field of ['photo', 'gender', 'aadhaar', 'address', 'bloodGroup', 'birthDate', 'birthPlace', 'motherTongue', 'email', 'phone', 'education']) {
      if (!mergedProfile[field]) mergedProfile[field] = USER[field] || ''
    }
    return getMissingStudentProfileFields(mergedProfile).length ? 'profile' : null
  } catch {
    return 'profile'
  }
}

function PortalApp() {
  const { user: cloudUser, ready: authReady, recovery, configured: cloudConfigured } = useCloudAuth()
  const previewMode = import.meta.env.DEV && !cloudConfigured
  const [loggedIn, setLoggedIn] = useState(() => { const demo = localStorage.getItem('campusly-demo-session') === DEMO_USER.email; if (demo) setCurrentUser({ ...DEMO_USER }); return demo })
  const [onboardingStep, setOnboardingStep] = useState(() =>
    localStorage.getItem('campusly-demo-session') === DEMO_USER.email ? getDemoOnboardingStep() : null,
  )
  const [page, setPage] = usePortalState('page', 'dashboard')
  const [data, setData] = useState(loadDemoData)
  const [mobileOpen, setMobileOpen] = usePortalState('mobileOpen', false)
  const [search, setSearch] = usePortalState('search', '')
  const showSearch = Boolean(search.trim())
  const resetNavigation = useResetNavigation()
  const [recordError, setRecordError] = useState('')
  const [recordReady, setRecordReady] = useState(false)
  const [retryRecords, setRetryRecords] = useState(0)

  useEffect(() => {
    if (!authReady) return
    let active = true
    if (cloudUser && !recovery) {
      localStorage.removeItem('campusly-demo-session')
      setRecordReady(false); setRecordError(''); setLoggedIn(false)
      loadStudentRecords(cloudUser.id).then(records => {
        if (!active) return
        setCurrentUser(records.account); setData(records.data); setOnboardingStep(null); setLoggedIn(true); setRecordReady(true)
      }).catch(error => { if (active) { setRecordError(error.message || 'Could not load your student records.'); setRecordReady(true) } })
    } else if (localStorage.getItem('campusly-demo-session') !== DEMO_USER.email) setLoggedIn(false)
    return () => { active = false }
  }, [cloudUser, authReady, recovery, retryRecords])

  useEffect(() => {
    if (!cloudUser || !loggedIn) return
    const refresh = () => setRetryRecords(value => value + 1)
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [cloudUser, loggedIn])

  useEffect(() => { if (!data.live) saveDemoData(data) }, [data])
  useEffect(() => { const onKey = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); document.querySelector('.global-search input')?.focus() } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [])
  useEffect(() => {
    // Ripple wave: spawn a soft circle under the pointer on any touchable press.
    const TAP_TARGETS = 'button, .course-card, .course-row, .class-card, .assignment-card, .notice-card, .deadline-item, .fee-challan, .notification-content'
    const spawn = e => {
      const btn = e.target?.closest?.(TAP_TARGETS)
      if (!btn) return
      if (btn.matches('button') && btn.disabled) return
      const rect = btn.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 0.9
      const x = e.clientX || e.clientY ? e.clientX - rect.left : rect.width / 2
      const y = e.clientX || e.clientY ? e.clientY - rect.top : rect.height / 2
      const ripple = document.createElement('span')
      ripple.className = 'click-ripple'
      ripple.style.width = ripple.style.height = `${size}px`
      ripple.style.left = `${x - size / 2}px`
      ripple.style.top = `${y - size / 2}px`
      btn.appendChild(ripple)
      ripple.addEventListener('animationend', () => ripple.remove())
    }
    document.addEventListener('pointerdown', spawn)
    // Lets the :active press state work on iOS for non-button elements too.
    document.addEventListener('touchstart', () => {}, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', spawn)
      document.removeEventListener('touchstart', () => {})
    }
  }, [])
  const updateData = updater => setData(prev => typeof updater === 'function' ? updater(prev) : updater)
  async function logout() { if (cloudConfigured) { const { error } = await supabase.auth.signOut(); if (error) { window.alert('Could not sign out. Please try again.'); return } } localStorage.removeItem('campusly-demo-session'); setLoggedIn(false); setOnboardingStep(null); resetNavigation() }
  function reset() { setData(resetDemoData()); localStorage.removeItem(profileKey()) }
  function login(acc, skipDemoOnboarding = false) { setCurrentUser(acc); localStorage.setItem('campusly-demo-session', acc.email); setData(loadDemoData()); setOnboardingStep(acc.email === DEMO_USER.email && !skipDemoOnboarding ? getDemoOnboardingStep() : null); resetNavigation(); setLoggedIn(true) }
  if (!authReady) return <div className="login-main min-h-screen" role="status">Loading…</div>
  if (cloudUser && !recovery && !recordReady) return <div className="login-main min-h-screen" role="status">Loading student records…</div>
  if (cloudUser && !recovery && recordError) return <div className="login-main min-h-screen"><p role="alert">{recordError}</p><Button onClick={() => setRetryRecords(value => value + 1)}>Retry</Button><Button variant="outline" onClick={logout}>Sign out</Button></div>
  if (!loggedIn || recovery) return <Login onLogin={login} previewMode={previewMode}/>
  if (onboardingStep === 'password') return <StudentOnboarding step="password" onPasswordChanged={() => setOnboardingStep('profile')}/>
  if (onboardingStep === 'profile') return <StudentOnboarding step="profile" onProfileCompleted={() => setOnboardingStep(null)}/>

  const Profile = StudentProfile
  const pageInfo = titles[page] || titles.dashboard
  return <>
    <div className={cx('app-shell', mobileOpen && 'drawer-open')}>
      <Sidebar page={page} setPage={setPage} data={data} onLogout={logout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
      <main className="main-area" data-tab={page}>
        <Topbar onLogout={logout} page={page} setPage={setPage} data={data} search={search} setSearch={value => setSearch(value)}/>
        <div className="content-area">
          {showSearch && search.trim() ? <>
            <div className="search-page-heading">
              <div className="eyebrow">PORTAL SEARCH</div>
              <h2>Search results</h2>
              <p>Find courses, assignments, results, and notifications.</p>
            </div>
            <SearchResults query={search} data={data} setPage={id => { setPage(id); setSearch('') }}/>
            <button className="link-button search-clear" onClick={() => setSearch('')}><X size={15}/> Clear search</button>
          </> : <>
            <div className="mobile-page-heading"><h1>{pageInfo[0]}</h1><p>{pageInfo[1]}</p></div>
            {page === 'dashboard' && <Dashboard data={data} setPage={setPage}/>}
            {page === 'courses' && <Courses data={data} setPage={setPage}/>}
            {page === 'materials' && <Materials data={data} search={search}/>}
            {page === 'timetable' && (data.live ? <ConnectedBatch batch={data.batch}/> : <Timetable data={data}/>)}
            {page === 'attendance' && <Attendance data={data}/>}
            {page === 'marks' && <Marks data={data}/>}
            {page === 'assignments' && <Assignments data={data} updateData={updateData}/>}
            {page === 'classtests' && (data.courses.length ? <ClassTests data={data} updateData={updateData}/> : <EmptyState title="No class tests yet" text="Tests appear after your modules are assigned."/>)}
            {page === 'exams' && <ExamSlots data={data}/>}
            {page === 'batch' && (data.live ? <ConnectedBatch batch={data.batch}/> : <MyBatch email={USER.email}/>)}
            {page === 'fees' && <Fees data={data}/>}
            {page === 'leave' && <Leave data={data} updateData={updateData}/>}
            {page === 'feedback' && <Feedback data={data} updateData={updateData}/>}
            {page === 'certrequest' && <CertificateRequest data={data} updateData={updateData}/>}
            {page === 'certificates' && <Certificates data={data}/>}
            {page === 'resume' && <Resume data={data}/>}
            {page === 'notifications' && <Notifications data={data} updateData={updateData}/>}
            {page === 'profile' && <Profile data={data} updateData={updateData} onReset={reset}/>}
            {page === 'about' && <AboutInstitute/>}
          </>}
        </div>
        <footer className="app-footer">
          <span>© 2026 Student Portal</span>
          <span><span className="footer-status-dot"/> All systems operational <span className="footer-separator">·</span> Student Portal</span>
        </footer>
      </main>
    </div>
    <BottomNav page={page} setPage={setPage} data={data} onMore={() => setMobileOpen(true)}/>
  </>
}
const rupee = n => '₹' + n.toLocaleString('en-IN')

function ClassTests({ data, updateData }) {
  const results = data.classTests || {}
  const started = data.courses.filter(c => c.completed > 0)
  const [mod, setMod] = useState(() => (started[started.length - 1] || data.courses[0]).id)
  const [active, setActive] = useState(null)
  const [answers, setAnswers] = useState({})
  const [viewing, setViewing] = useState(null)
  const course = data.courses.find(c => c.id === mod)
  const key = (m, l) => `${m}-${l}`
  const taken = Object.values(results)
  const avg = taken.length ? Math.round(taken.reduce((a, r) => a + r.score, 0) / taken.length * 10) : 0
  if (active) {
    const qs = lessonTest(active.module, active.lesson)
    const done = Object.keys(answers).length === qs.length
    const submit = () => {
      const score = scoreTest(qs, answers)
      updateData(d => ({ ...d, classTests: { ...(d.classTests || {}), [key(active.module, active.lesson)]: { score, total: qs.length, answers, date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) } } }))
      setViewing(active); setActive(null); setAnswers({})
    }
    return <div className="page-stack quiz-page"><SectionHeading eyebrow={`MODULE ${active.module} · LESSON ${active.lesson}`} title="Class Test" subtitle={`${active.topic} · One attempt only — answer all ${qs.length} questions before submitting.`} action={<button className="secondary-button" onClick={() => { setActive(null); setAnswers({}) }}><X size={16}/> Cancel</button>}/>
      <div className="quiz-progress"><div className="quiz-progress-track"><div className="quiz-progress-fill" style={{ width: `${Object.keys(answers).length / qs.length * 100}%` }}/></div><span className="quiz-progress-label"><strong>{Object.keys(answers).length}</strong> of {qs.length} answered</span></div>
      {qs.map((q, i) => <div key={q.id} className="quiz-card-in" style={{ animationDelay: `${Math.min(i, 6) * 90}ms` }}><Panel title={`${i + 1}. ${q.q}`} action={answers[i] != null ? <span className="quiz-answered"><Check size={13}/> Answered</span> : null}><div className="quiz-options">{q.options.map((o, oi) => <label key={oi} className={cx('quiz-option', answers[i] === oi && 'selected')}><input type="radio" name={q.id} checked={answers[i] === oi} onChange={() => setAnswers(a => ({ ...a, [i]: oi }))}/><span className="quiz-option-letter">{String.fromCharCode(65 + oi)}</span><span>{o}</span></label>)}</div></Panel></div>)}
      <div className="filter-row"><span className="muted-text">{Object.keys(answers).length} of {qs.length} answered</span><button className={cx('primary-button', done && 'quiz-submit-ready')} disabled={!done} onClick={submit}><Send size={16}/> Submit test</button></div></div>
  }
  if (viewing) {
    const r = results[key(viewing.module, viewing.lesson)]
    const qs = lessonTest(viewing.module, viewing.lesson)
    return <div className="page-stack"><SectionHeading eyebrow={`MODULE ${viewing.module} · LESSON ${viewing.lesson}`} title={`Score: ${r?.score ?? 0} / ${r?.total ?? QUESTIONS_PER_TEST}`} subtitle={`${viewing.topic} · Taken on ${r?.date}`} action={<button className="secondary-button" onClick={() => setViewing(null)}><ArrowRight size={16}/> Back to tests</button>}/>
      <div className="stats-grid three-stats"><StatCard icon={CheckCircle2} label="Correct" value={r?.score ?? 0} detail="answers" tone="green"/><StatCard icon={X} label="Wrong" value={(r?.total ?? 0) - (r?.score ?? 0)} detail="answers" tone="orange"/><StatCard icon={TrendingUp} label="Percentage" value={`${percent(r?.score, r?.total)}%`} detail={getGrade(percent(r?.score, r?.total))} tone="violet"/></div>
      {qs.map((q, i) => { const mine = r?.answers?.[i]; const ok = mine === q.answer; return <Panel key={q.id} title={`${i + 1}. ${q.q}`} action={<StatusPill>{ok ? 'Correct' : 'Wrong'}</StatusPill>}><p className="muted-text">Your answer: <strong>{q.options[mine] ?? '—'}</strong>{!ok && <> · Correct answer: <strong>{q.options[q.answer]}</strong></>}</p></Panel> })}</div>
  }
  return <div className="page-stack"><SectionHeading eyebrow="ACADEMICS" title="Class Tests" subtitle="A test unlocks after each completed lesson. Each test has 10 multiple-choice questions and one attempt."/>
    <div className="stats-grid three-stats"><StatCard icon={FileCheck2} label="Tests taken" value={taken.length} detail="All modules" tone="violet"/><StatCard icon={Clock3} label="Pending" value={course.sessions.filter(s => s.done && !results[key(course.id, s.num)]).length} detail="In this module" tone="orange"/><StatCard icon={TrendingUp} label="Average score" value={`${avg}%`} detail="Across tests taken" tone="green"/></div>
    <div className="filter-row"><div className="segmented">{started.map(c => <button key={c.id} className={mod === c.id ? 'selected' : ''} onClick={() => setMod(c.id)}>Module {c.id}</button>)}</div></div>
    <Panel title={course.title} subtitle={`${course.completed} of ${course.lessons} lessons completed`}><div className="table-scroll"><table><thead><tr><th>LESSON</th><th>TOPIC</th><th>STATUS</th><th>SCORE</th><th></th></tr></thead><tbody>{course.sessions.map(s => { const r = results[key(course.id, s.num)]; const info = { module: course.id, lesson: s.num, topic: s.topic.replace(/^Session \d+: /, '') }; return <tr key={s.num}><td>{s.num}</td><td>{info.topic}</td><td><StatusPill>{r ? 'Completed' : s.done ? 'Available' : 'Locked'}</StatusPill></td><td>{r ? <strong>{r.score} / {r.total}</strong> : '—'}</td><td>{r ? <button className="outline-button" onClick={() => setViewing(info)}>View score</button> : s.done ? <button className="primary-button" onClick={() => { setAnswers({}); setActive(info) }}>Start test</button> : <span className="muted-text">After lesson</span>}</td></tr> })}</tbody></table></div></Panel></div>
}

function ExamSlots({ data }) {
  const [f, setF] = useState('All')
  const open = new Set(data.courses.filter((c, i) => c.progress === 100 || i === 0 || data.courses[i - 1].progress === 100).map(c => c.code))
  const MY = EXAM_SLOTS.filter(e => open.has(e.code))
  const rows = MY.filter(e => f === 'All' || e.status === f)
  return <div className="page-stack"><SectionHeading eyebrow="EXAMINATIONS" title="Exam Slots" subtitle="Your allotted exam dates, times, venues, seats and marks."/><div className="stats-grid three-stats"><StatCard icon={NotebookPen} label="Total exams" value={MY.length} detail="This module" tone="violet"/><StatCard icon={Clock3} label="Upcoming" value={MY.filter(e => e.status === 'Upcoming').length} detail="Scheduled ahead" tone="orange"/><StatCard icon={CheckCircle2} label="Completed" value={MY.filter(e => e.status === 'Completed').length} detail="Already written" tone="green"/></div><div className="filter-row"><div className="segmented">{['All', 'Upcoming', 'Completed'].map(x => <button key={x} className={f === x ? 'selected' : ''} onClick={() => setF(x)}>{x}</button>)}</div></div><Panel title="Exam schedule" subtitle="Reach the venue 20 minutes early"><div className="table-scroll"><table><thead><tr><th>SUBJECT</th><th>TYPE</th><th>DATE</th><th>TIME SLOT</th><th>VENUE</th><th>SEAT</th><th>MARKS</th><th>STATUS</th></tr></thead><tbody>{rows.map(e => <tr key={e.id}><td><strong className="normal-weight">{e.subject}</strong><br/><span className="muted-text">{e.code}</span></td><td>{e.type}</td><td>{e.date}</td><td>{e.time}</td><td><MapPin size={13}/> {e.venue}</td><td><span className="course-tag">{e.seat}</span></td><td><strong>{e.maxMarks ? `${e.maxMarks} marks` : '—'}</strong></td><td><StatusPill>{e.status}</StatusPill></td></tr>)}</tbody></table></div></Panel><div className="notice-card"><ShieldCheck size={19}/><div><strong>Exam guidelines</strong><p>Carry your student ID and hall ticket. Module 2 Theory and Practical exams are each worth 100 marks. Phones are not allowed inside the exam hall.</p></div></div></div>
}

function Fees({ data }) {
  const fees = data.live ? data.fees : getFeesForCourses(data.courses, USER.email === DEMO_USER.email ? FEES : [])
  const [r, setR] = usePortalState('feeReceipt', null)
  const receiptDetails = r ? buildFeeReceiptData(r, fees, USER) : null
  const paid = fees.filter(x => x.status === 'Paid').reduce((a, b) => a + b.amount, 0)
  const totalCourseFees = fees.reduce((total, fee) => total + (fee.amount ?? 0), 0)
  const [filter, setFilter] = useState('All')
  const shown = fees.filter(fee => filter === 'All' || fee.status === filter)
  const summary = [
    { icon: Clock3, label: 'Pending', value: fees.filter(fee => fee.status === 'Pending').length },
    { icon: CheckCircle2, label: 'Paid', value: fees.filter(fee => fee.status === 'Paid').length },
    { icon: FileText, label: 'Total course fees', value: rupee(totalCourseFees) },
    { icon: Wallet, label: 'Amount paid', value: rupee(paid) },
  ]
  return <div className="page-stack fees-page">
    <SectionHeading eyebrow="FINANCE" title="Fees Payment" subtitle="Module-wise fees and payment records."/>
    <div className="fee-summary">{summary.map(({ icon: Icon, label, value }) => <div className="fee-summary-item" key={label}><span className="fee-summary-icon"><Icon size={21}/></span><div><strong>{value}</strong><span>{label}</span></div></div>)}</div>
    <section className="fee-challans" aria-label="Module fee challans">
      <div className="fee-list-heading"><h3><FileText size={19}/> Fee Challans</h3><select className="select-control" aria-label="Filter fee status" value={filter} onChange={e => setFilter(e.target.value)}><option value="All">All modules</option><option>Pending</option><option>Paid</option><option>Not issued</option></select></div>
      <div className="fee-card-list">{shown.map(fee => <article className="fee-challan" key={fee.id}>
        <header><span className="fee-challan-id">{fee.id}</span><h4>{fee.title}</h4><div className="fee-tags"><span><GraduationCap size={14}/> Module {fee.module}</span><span>{fee.code}</span></div></header>
        <dl className="fee-details"><div><dt>Amount</dt><dd className="fee-amount">{fee.amount === null ? 'Not set' : rupee(fee.amount)}</dd></div><div><dt>{fee.status === 'Paid' ? 'Paid on' : 'Due date'}</dt><dd className={fee.status === 'Paid' && fee.date ? 'fee-date-highlight' : ''}><CalendarDays size={15}/>{fee.date || 'Not scheduled'}</dd></div><div><dt>Status</dt><dd><StatusPill>{fee.status}</StatusPill></dd></div></dl>
        {fee.receipt && <div className="fee-transaction"><span><FileText size={14}/>{fee.receipt}</span><span><Wallet size={14}/>{fee.method}</span></div>}
        <div className="fee-card-actions">{fee.status === 'Paid' && fee.receipt ? <Button variant="outline" className="outline-button" onClick={() => setR(fee)}><FileText size={16}/> Receipt</Button> : <span className="fee-awaiting">{fee.amount === null ? 'Awaiting fee confirmation' : 'Payment not recorded'}</span>}</div>
      </article>)}</div>
      {shown.length === 0 && <EmptyState title="No matching challans" text="No payment records match this status."/>}
    </section>
    {r && receiptDetails && <Modal title={`Receipt ${r.receipt}`} onClose={() => setR(null)} wide className="fee-receipt-modal" portal>
      <div className="fee-receipt-preview">
        <div className="fee-receipt-preview-head"><img src={feeReceiptLogo} alt="Skill AI"/><span>FEE RECEIPT</span></div>
        <div className="fee-receipt-meta"><span><b>Receipt No.</b> {receiptDetails.receiptNumber}</span><span><b>Date</b> {receiptDetails.date}</span></div>
        <section className="fee-receipt-section">
          <h4>1. STUDENT DETAILS</h4>
          <div className="fee-receipt-rows">
            <div className="fee-receipt-row"><span>Student Name</span><strong>{receiptDetails.studentName}</strong></div>
            <div className="fee-receipt-row"><span>Admission No.</span><strong>{receiptDetails.admissionNumber}</strong></div>
            <div className="fee-receipt-row"><span>Course / Batch</span><strong>{receiptDetails.courseBatch}</strong></div>
          </div>
        </section>
        <section className="fee-receipt-section">
          <h4>2. PAYMENT TOWARDS &amp; MODE</h4>
          <div className="fee-receipt-rows">
            <div className="fee-receipt-row"><span>Payment towards</span><div className="fee-receipt-options">{['Registration', 'Instalments', 'Exam fee', 'Other'].map(option => <span key={option}><i aria-hidden="true">{receiptDetails.paymentType === option ? '✓' : ''}</i>{option === 'Other' && receiptDetails.paymentType === option ? 'Other: ______' : option}</span>)}</div></div>
            <div className="fee-receipt-row"><span>Payment mode</span><div className="fee-receipt-mode"><div className="fee-receipt-options">{['Cash', 'UPI', 'Cheque', 'Bank transfer'].map(option => <span key={option}><i aria-hidden="true">{receiptDetails.paymentMode.selected === option ? '✓' : ''}</i>{option}</span>)}</div>{receiptDetails.paymentMode.selected === 'Other' && <strong>Other: {receiptDetails.paymentMode.other}</strong>}</div></div>
          </div>
        </section>
        <section className="fee-receipt-section">
          <h4>3. PAYMENT DETAILS</h4>
          <div className="fee-receipt-rows">
            <div className="fee-receipt-row"><span>Amount received (Rs.)</span><strong>{rupee(receiptDetails.amount)}</strong></div>
            <div className="fee-receipt-row"><span>Amount in words</span><strong>{receiptDetails.amountInWords}</strong></div>
          </div>
        </section>
        <section className="fee-receipt-section">
          <h4>4. BALANCE &amp; DUE DATE</h4>
          <div className="fee-receipt-rows">
            <div className="fee-receipt-row"><span>Balance fee after this payment (Rs.)</span><strong>{rupee(receiptDetails.balance)}</strong></div>
            <div className="fee-receipt-row"><span>Next due date</span><strong>{receiptDetails.nextDueDate}</strong></div>
          </div>
        </section>
        <div className="fee-receipt-signatures"><strong>Accounts Officer</strong><div><span></span><strong>Sign / Date</strong></div></div>
      </div>
      <div className="modal-actions"><Button variant="outline" className="secondary-button" onClick={() => setR(null)}>Close</Button><button className="primary-button" onClick={() => downloadFeeReceipt(r, fees)}><Download size={15}/> Download receipt</button></div>
    </Modal>}
  </div>
}
