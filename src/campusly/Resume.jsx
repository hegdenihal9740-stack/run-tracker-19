import { Printer } from 'lucide-react'
import { USER } from './data.js'
import { MODULE_ROADMAP } from './sessions.js'

export function buildResumeProfile(courses, user = USER) {
  const skills = courses
    .filter(course => course.lessons > 0 && course.completed >= course.lessons)
    .flatMap(course => MODULE_ROADMAP[course.id]?.skills || [])
  return { user, skills: [...new Set(skills)] }
}

export default function Resume({ data }) {
  const { user, skills } = buildResumeProfile(data.courses)

  return <div className="page-stack">
    <header className="resume-page-heading">
      <div>
        <span className="eyebrow">CAREER PROFILE</span>
        <h2>My Resume</h2>
        <p>Your resume grows automatically as you complete course modules.</p>
      </div>
      <button className="primary-button resume-print-button" type="button" onClick={() => window.print()}>
        <Printer size={16}/> Print / Save as PDF
      </button>
    </header>
    <article className="resume-page panel" aria-label="Resume">
      <header className="resume-header">
        <div className="resume-identity">
          <h1>{user.name || 'Student Name'}</h1>
          <p className="resume-target">{user.program || 'Student'}</p>
          <div className="resume-contact">
            {user.email && <span>{user.email}</span>}
            {user.phone && <span>{user.phone}</span>}
          </div>
        </div>
      </header>

      <section className="resume-section">
        <h3>Professional Summary</h3>
        <p>
          Student pursuing {user.program || 'a professional training programme'} at Skill AI, developing practical foundations in artificial intelligence, data science, programming, and machine learning.
        </p>
      </section>

      <section className="resume-section">
        <h3>Technical Skills</h3>
        {skills.length
          ? <ul className="resume-skill-list">{skills.map(skill => <li key={skill}>{skill}</li>)}</ul>
          : <p>Course skills will appear here as you complete the relevant modules.</p>}
      </section>

      <section className="resume-section">
        <h3>Education &amp; Training</h3>
        <div className="resume-education">
          <div className="resume-education-heading">
            <strong>{user.program || 'Professional Training Programme'}</strong>
            {user.batch && <span>{user.batch}</span>}
          </div>
          <p>Skill AI · Mangalore</p>
        </div>
      </section>

      <footer className="resume-note">Skills listed are based on modules completed in the student portal.</footer>
    </article>
  </div>
}
