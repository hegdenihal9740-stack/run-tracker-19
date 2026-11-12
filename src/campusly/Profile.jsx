import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Camera, Check, GraduationCap, Mail, MapPin, Phone, Trash2, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { USER, profileKey } from './data.js'
import './profile.css'
import { useCloudAuth } from '@/components/auth-provider'
import { supabase } from '@/integrations/supabase/client'

const personalFields = [
  ['studentId', 'Register No'], ['applicationNo', 'Application No'], ['name', 'Name'],
  ['gender', 'Gender'], ['birthDate', 'Birth Date', 'date'], ['birthPlace', 'Place of Birth'],
  ['motherTongue', 'Mother Tongue'], ['bloodGroup', 'Blood Group'], ['aadhaar', 'Aadhaar Number'],
  ['email', 'Email', 'email'], ['phone', 'Phone Number', 'tel'], ['address', 'Address'],
]
const academicFields = [['program', 'Program'], ['batch', 'Batch'], ['admissionYear', 'Admission Year']]
const educationFields = [['education', 'Education']]
function baseProfile() {
  return Object.fromEntries([...personalFields, ...academicFields, ...educationFields].map(([key]) => [key, USER[key] || (key === 'education' ? [] : '')]))
}
function displayValue(key, value) {
  if (!value) return '—'
  if (key === 'birthDate' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split('-').reverse().join('-')
  if (key === 'education' && Array.isArray(value)) {
    return value.map((item, index) =>
      `${index + 1}. ${item.qualification || '—'} — ${item.institute || '—'}\nYear of passing: ${item.yearOfPassing || '—'} · Percentage/Grade: ${item.percentage || '—'}`
    ).join('\n\n')
  }
  return value
}

export default function StudentProfile() {
  const { user } = useCloudAuth()
  const [profile, setProfile] = useState(baseProfile)
  const [tab, setTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const photoInput = useRef(null)
  useEffect(() => {
    if (user) { setProfile({ ...baseProfile(), photo: USER.photo || '' }); return }
    try {
      const stored = JSON.parse(localStorage.getItem(profileKey()) || 'null')
      if (stored) {
        const merged = { ...baseProfile(), ...stored, studentId: USER.studentId }
        for (const [key] of [...personalFields, ...academicFields, ...educationFields]) {
          if (!merged[key]) merged[key] = USER[key] || ''
        }
        setProfile(merged)
      }
    } catch {}
  }, [])
  async function storePhoto(photo) {
    const next = { ...profile, photo }
    try {
      if (user) {
        const { error } = await supabase.from('profiles').update({ photo, updated_at: new Date().toISOString() }).eq('id', user.id)
        if (error) throw error
      } else localStorage.setItem(profileKey(), JSON.stringify(next))
      setProfile(next)
      setSaved(true)
      setPhotoError('')
    } catch {
      setPhotoError('Your photo could not be saved. Free some browser storage and try again.')
    }
  }
  async function uploadPhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPhotoError('')
    setPhotoBusy(true)
    try {
      const source = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const image = await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = source
      })
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, 640 / Math.max(image.width, image.height))
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Photo processing unavailable')
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      await storePhoto(canvas.toDataURL('image/jpeg', 0.85))
    } catch {
      setPhotoError('This photo could not be opened. Please choose a JPG, PNG or WebP image.')
    } finally {
      setPhotoBusy(false)
    }
  }
  const fields = tab === 'profile'
    ? personalFields
    : tab === 'education'
      ? educationFields
      : academicFields
  const initials = (profile.name || '').split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()
  return <div className="student-profile-page">
    <section className="student-profile-summary" aria-label="Student profile">
      <div className="student-profile-cover" aria-hidden="true"></div>
      <div className="student-profile-avatar" aria-label={profile.name}>{profile.photo ? <img src={profile.photo} alt={`${profile.name || 'Student'} profile photo`}/> : initials || <UserRound size={36}/>}</div>
      <div className="student-profile-photo-actions">
        <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Student photo" hidden onChange={uploadPhoto}/>
        <Button variant="outline" size="sm" disabled={photoBusy} onClick={() => photoInput.current?.click()}><Camera size={16}/>{photoBusy ? 'Saving photo…' : profile.photo ? 'Change photo' : 'Add photo'}</Button>
        {profile.photo && <Button variant="ghost" size="icon" disabled={photoBusy} aria-label="Remove photo" title="Remove photo" onClick={() => storePhoto('')}><Trash2 size={16}/></Button>}
      </div>
      {photoError && <p className="student-profile-photo-error" role="alert">{photoError}</p>}
      <h1>{profile.name || 'Student'}</h1>
      <p className="student-profile-program">{profile.program || '—'}</p>
      <p className="student-profile-batch">{profile.batch || '—'}</p>
      <div className="student-profile-contact">
        <div><UserRound size={17}/><span>Reg No: {profile.studentId || '—'}</span></div>
        <div><CalendarDays size={17}/><span>Admission Year: {profile.admissionYear || '—'}</span></div>
        <div><Mail size={17}/><span>{profile.email || '—'}</span></div>
        <div><Phone size={17}/><span>{profile.phone || '—'}</span></div>
        <div className="student-profile-address"><MapPin size={18}/><span>{profile.address || '—'}</span></div>
      </div>
      <div className="student-profile-tabs" role="tablist" aria-label="Student information">
        <Button variant="ghost" role="tab" id="personal-tab" aria-controls="student-details" aria-selected={tab === 'profile'} onClick={() => setTab('profile')}><UserRound/>Profile</Button>
        <Button variant="ghost" role="tab" id="education-tab" aria-controls="student-details" aria-selected={tab === 'education'} onClick={() => setTab('education')}><GraduationCap/>Education</Button>
        <Button variant="ghost" role="tab" id="academic-tab" aria-controls="student-details" aria-selected={tab === 'academics'} onClick={() => setTab('academics')}><GraduationCap/>Academics</Button>
      </div>
    </section>
    <section className="student-profile-details" id="student-details" role="tabpanel" aria-labelledby={tab === 'profile' ? 'personal-tab' : `${tab}-tab`}>
      <header><h2>{tab === 'profile' ? 'My Profile' : tab === 'education' ? 'Education Information' : 'Academics'}</h2><span className="student-profile-readonly">View only · contact your office to update details</span></header>
      {saved && <p className="student-profile-saved" role="status"><Check size={16}/>Changes saved</p>}
      <dl>{fields.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{displayValue(key, profile[key])}</dd></div>)}</dl>
    </section>
  </div>
}