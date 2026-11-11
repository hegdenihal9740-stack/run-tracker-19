import { LayoutDashboard, BookOpen, CalendarDays, ClipboardList, LayoutGrid } from 'lucide-react'
import './bottom-nav.css'

const TABS = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'courses', label: 'Course', icon: BookOpen },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays },
  { id: 'assignments', label: 'Tasks', icon: ClipboardList, badge: true },
]

export default function BottomNav({ page, setPage, data, onMore }) {
  const go = id => { if (id !== page) setPage(id); window.scrollTo(0, 0) }
  const pending = (data?.assignments || []).filter(a => a.status !== 'Submitted').length

  return <nav className="bottom-nav" aria-label="Important sections">
    {TABS.map(tab => {
      const Icon = tab.icon
      const active = page === tab.id
      return <button
        key={tab.id}
        type="button"
        className={`bn-item${active ? ' active' : ''}`}
        aria-current={active ? 'page' : undefined}
        onClick={() => go(tab.id)}
      >
        <span className="bn-ico"><Icon size={19}/>{tab.badge && pending > 0 && <i className="bn-badge">{pending > 9 ? '9+' : pending}</i>}</span>
        <span className="bn-label">{tab.label}</span>
      </button>
    })}
    <button type="button" className="bn-item" onClick={onMore} aria-label="Open the full menu">
      <span className="bn-ico"><LayoutGrid size={19}/></span>
      <span className="bn-label">More</span>
    </button>
  </nav>
}
