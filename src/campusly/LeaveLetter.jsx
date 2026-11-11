import logoUrl from '@/assets/skillai-fee-logo.png'

const fmt = d => (d ? new Date(`${d}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '')
export const countDays = (from, to) => (from && to && new Date(to) >= new Date(from) ? Math.round((new Date(to) - new Date(from)) / 86400000) + 1 : '')

function Blank({ value, onChange, type = 'text', w = 160, readOnly, ...rest }) {
  if (readOnly) return <span className="letter-blank" style={{ minWidth: w }}>{value || '\u00a0'}</span>
  return <input className="letter-input" style={{ width: w }} type={type} value={value} onChange={e => onChange(e.target.value)} required {...rest} />
}

/** The Skill AI Student Leave Letter, laid out like the Word file. Editable when `set` is given. */
export function LeaveLetter({ form, set, onFile }) {
  const ro = !set
  const b = (k, props = {}) => <Blank value={form[k]} onChange={v => set({ ...form, [k]: v })} readOnly={ro} {...props} />
  const dateB = (k, props = {}) => ro ? <Blank value={form[k + 'Label'] || fmt(form[k])} readOnly w={props.w || 110} /> : b(k, { type: 'date', w: 140, ...props })
  return (
    <div className="letter-paper">
      <div className="letter-head"><img src={logoUrl} alt="Skill AI" /><h2>STUDENT LEAVE LETTER</h2></div>
      <hr className="letter-rule" />
      <p className="letter-date"><span>Date:</span> <Blank value={form.dateLabel || fmt(new Date().toISOString().slice(0, 10))} readOnly w={110} /></p>
      <p><strong>To,</strong><br />The Campus Administrator,<br />Skill AI,</p>
      <p><span className="letter-accent">Subject:</span> <strong>Application for Post Leave Approval</strong></p>
      <p>Respected Sir / Madam,</p>
      <p className="letter-body">
        I,
        {'\u00a0'}<Blank value={form.name} readOnly w={200} />, a student of
        {'\u00a0'}<Blank value={form.course} readOnly w={240} /> course (Admission No.{'\u00a0'}<Blank value={form.admission} readOnly w={130} />),
        {'\u00a0'}was absent from the campus from {dateB('from')} to {dateB('to', { min: form.from || undefined })} ({ro ? <Blank value={form.days || countDays(form.from, form.to)} readOnly w={34} /> : <Blank value={form.daysEdited ? form.days : (countDays(form.from, form.to) || form.days || '')} onChange={v => set({ ...form, days: v.replace(/\D/g, '').slice(0, 3), daysEdited: true })} w={44} inputMode="numeric" />}{'\u00a0'}days) due to the following reason:
      </p>
      {ro ? <p className="letter-reason">{form.reason}</p> : <textarea className="letter-reason" rows={3} value={form.reason} onChange={e => set({ ...form, reason: e.target.value })} required minLength={5} maxLength={1000} placeholder="Write the reason for your absence" />}
      <p className="letter-body">
        I have rejoined classes on {dateB('rejoin', { min: form.to || undefined })}. I sincerely apologise for any inconvenience caused and request you to kindly regularise my absence. I assure you that I will complete all missed lessons, practical works, and I will inform the campus in advance in future.
      </p>
      <p className="letter-small">Supporting document attached (if any): {ro ? <span className="letter-blank">{form.doc || 'None'}</span> : <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => onFile?.(e.target.files?.[0]?.name || '')} />}</p>
      <p>Thanking you,<br />Yours faithfully,<br />{form.name || '\u00a0'}</p>
      <p className="letter-foot">SKILL AI &nbsp;|&nbsp; POST-LEAVE LETTER</p>
    </div>
  )
}

/** Builds a filled .docx matching the Skill AI leave letter and downloads it. */
export async function downloadLeaveDocx(l) {
  const D = await import('docx')
  const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ShadingType, TabStopType } = D
  const font = 'Arial', ORANGE = 'F07C2E'
  const t = (text, o = {}) => new TextRun({ text, font, size: 21, ...o })
  const u = text => t(` ${text || '            '} `, { underline: {} })
  const P = (children, o = {}) => new Paragraph({ children, spacing: { after: 160, line: 320 }, ...o })
  const logoBuf = await fetch(logoUrl).then(r => r.arrayBuffer())
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  const noB = { top: none, bottom: none, left: none, right: none }
  const line = { style: BorderStyle.SINGLE, size: 6, color: '999999' }
  const box = { style: BorderStyle.SINGLE, size: 6, color: '999999' }
  const cell = (children, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: noB, children, ...o })
  const signCell = label => cell([new Paragraph({ border: { top: line }, alignment: AlignmentType.CENTER, children: [t(label, { bold: true, size: 18 })] })], 3020)
  const doc = new Document({
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1000, right: 1134, bottom: 1000, left: 1134 } } },
      children: [
        new Table({ width: { size: 9638, type: WidthType.DXA }, columnWidths: [3000, 6638], rows: [new TableRow({ children: [
          cell([new Paragraph({ children: [new ImageRun({ type: 'png', data: logoBuf, transformation: { width: 150, height: 38 }, altText: { title: 'Skill AI', description: 'Skill AI logo', name: 'logo' } })] })], 3000),
          cell([new Paragraph({ children: [t('STUDENT LEAVE LETTER', { bold: true, size: 30 })], spacing: { before: 300 } })], 6638),
        ] })] }),
        new Paragraph({ border: { bottom: line }, children: [] }),
        P([t('Date: ', { bold: true, color: ORANGE }), u(l.applied)], { alignment: AlignmentType.RIGHT, spacing: { before: 200, after: 300 } }),
        P([t('To,', { bold: true })], { spacing: { after: 0 } }), P([t('The Campus Administrator,')], { spacing: { after: 0 } }), P([t('Skill AI,')]),
        P([t('Subject: ', { bold: true, color: ORANGE }), t('Application for Post Leave Approval', { bold: true })], { spacing: { after: 400 } }),
        P([t('Respected Sir / Madam,')]),
        P([t('I,'), u(l.name), t(', a student of'), u(l.course), t('course (Admission No.'), u(l.admission), t('), was absent from the campus from'), u(l.from), t('to'), u(l.to), t('('), u(String(l.days)), t('days) due to the following reason:')], { alignment: AlignmentType.JUSTIFIED }),
        P([t(l.reason || '', { underline: {} })]),
        P([t('I have rejoined classes on'), u(l.rejoin), t('. I sincerely apologise for any inconvenience caused and request you to kindly regularise my absence. I assure you that I will complete all missed lessons, practical works, and I will inform the campus in advance in future.')], { alignment: AlignmentType.JUSTIFIED }),
        P([t('Supporting document attached (if any): ', { size: 18 }), t(l.doc || 'None', { size: 18 })], { spacing: { before: 200, after: 300 } }),
        P([t('Thanking you,')], { spacing: { after: 0 } }), P([t('Yours faithfully,')], { spacing: { after: 0 } }), P([t(l.name || '')], { spacing: { after: 700 } }),
        new Paragraph({ border: { bottom: line }, spacing: { before: 400 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, tabStops: [{ type: TabStopType.CENTER, position: 4819 }], children: [t('SKILL AI   |   POST-LEAVE LETTER', { bold: true, color: ORANGE, size: 14 })] }),
      ],
    }],
  })
  const blob = await Packer.toBlob(doc)
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Skill_AI_Leave_Letter_${l.id}.docx`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
