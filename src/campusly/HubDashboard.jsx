import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  GraduationCap,
  CalendarCheck,
  Grid3x3,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import hero from "../assets/dashboard-hero.jpg";
import { USER } from "./data.js";
import "./hub-dashboard.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Card({ icon: Icon, title, sub, right, children, className = "", onClick, onKeyDown }) {
  return (
    <section
      className={`hub-card ${className}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={onClick ? "link" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Open ${title.toLowerCase()} report` : undefined}
    >
      <header className="hub-card-head">
        <span className="hub-ico">
          <Icon size={14} />
        </span>
        <div>
          <h3>{title}</h3>
          <p>{sub}</p>
        </div>
        {right && <span className="hub-chip">{right}</span>}
      </header>
      {children}
    </section>
  );
}

function AttendanceChart({ records }) {
  const [selectedIndex, setSelectedIndex] = useState(records.length - 1);
  const [dragging, setDragging] = useState(false);
  const points = records.map((record, index) => {
    const attended = record.status === "Present";
    const attendedSoFar = records
      .slice(0, index + 1)
      .filter((entry) => entry.status === "Present").length;
    return {
      ...record,
      attended,
      rate: Math.round((attendedSoFar / (index + 1)) * 100),
      x: records.length === 1 ? 150 : 16 + (index / (records.length - 1)) * 268,
    };
  });
  const pointY = (rate) => 78 - (rate / 100) * 58;
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${pointY(point.rate)}`)
    .join(" ");
  const area = points.length
    ? `${line} L${points[points.length - 1].x},86 L${points[0].x},86 Z`
    : "";
  const selected = points[selectedIndex];

  function selectFromPointer(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !points.length) return;
    const x = ((event.clientX - bounds.left) / bounds.width) * 300;
    const index = points.reduce(
      (nearest, point, candidate) =>
        Math.abs(point.x - x) < Math.abs(points[nearest].x - x) ? candidate : nearest,
      0,
    );
    setSelectedIndex(index);
  }

  function handleKeyDown(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedIndex((index) =>
      Math.max(0, Math.min(points.length - 1, index + (event.key === "ArrowRight" ? 1 : -1))),
    );
  }

  if (!points.length) {
    return <p className="hub-attendance-empty">No attendance recorded for this module yet.</p>;
  }

  return (
    <div className="hub-attendance-chart" onClick={(event) => event.stopPropagation()}>
      <svg
        className="hub-attendance-plot"
        viewBox="0 0 300 96"
        preserveAspectRatio="none"
        role="slider"
        aria-label="Attendance by class. Drag or use the arrow keys to inspect each session."
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={selected.rate}
        aria-valuetext={`${selected.date}: ${selected.attended ? "Present" : "Absent"}, running attendance ${selected.rate}%`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          selectFromPointer(event);
          setDragging(true);
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (dragging) selectFromPointer(event);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <defs>
          <linearGradient id="attendanceArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--hub-accent)" stopOpacity=".25" />
            <stop offset="1" stopColor="var(--hub-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 49, 78].map((y) => (
          <line key={y} x1="12" x2="288" y1={y} y2={y} className="hub-attendance-gridline" />
        ))}
        <path d={area} fill="url(#attendanceArea)" />
        <path d={line} className="hub-attendance-line" />
        {points.map((point, index) => (
          <circle
            key={`${point.date}-${index}`}
            cx={point.x}
            cy={pointY(point.rate)}
            r={index === selectedIndex ? 5 : 3.5}
            className={`hub-attendance-point${point.attended ? "" : " absent"}${index === selectedIndex ? " selected" : ""}`}
          />
        ))}
        {selected && (
          <line x1={selected.x} x2={selected.x} y1="12" y2="86" className="hub-attendance-cursor" />
        )}
      </svg>
      <div className="hub-attendance-detail" aria-live="polite">
        <span className={`hub-attendance-status${selected.attended ? " present" : " absent"}`}>
          <i />
          {selected.attended ? "Present" : "Absent"}
        </span>
        <span>{selected.date}</span>
        <strong>{selected.rate}% running</strong>
      </div>
      <div className="hub-attendance-axis">
        <span>{points[0].date}</span>
        <span>{points.length} {points.length === 1 ? "session" : "sessions"}</span>
        <span>{points[points.length - 1].date}</span>
      </div>
    </div>
  );
}

function MobileAttendanceVisual({ records }) {
  const recent = records.slice(-8);
  const attended = recent.filter((record) => record.status === "Present").length;
  const missed = recent.length - attended;

  return (
    <div className="hub-attendance-mobile-visual" aria-label="Recent attendance sessions">
      <div className="hub-attendance-mobile-label">
        <span>CLASS RHYTHM</span>
        <span>{attended} attended{missed ? ` · ${missed} missed` : ""}</span>
      </div>
      {recent.length ? (
        <div className="hub-attendance-session-strip">
          {recent.map((record, index) => (
            <span
              key={`${record.date}-${index}`}
              className={`hub-attendance-session${record.status === "Present" ? " present" : " absent"}`}
              title={`${record.date}: ${record.status}`}
              aria-label={`${record.date}: ${record.status}`}
            />
          ))}
        </div>
      ) : (
        <p className="hub-attendance-empty">No recent sessions to show.</p>
      )}
      <div className="hub-attendance-session-legend">
        <span><i className="present" /> Attended</span>
        <span><i className="absent" /> Missed</span>
      </div>
    </div>
  );
}

export default function HubDashboard({ data, setPage }) {
  const heroRef = useRef(null);
  const sparkleTimerRef = useRef(null);
  const [sparkleBurst, setSparkleBurst] = useState(null);
  useEffect(() => () => window.clearTimeout(sparkleTimerRef.current), []);
  const go = (p) => {
    setPage(p);
    window.scrollTo(0, 0);
  };
  const popHero = (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const heroBounds = heroRef.current?.getBoundingClientRect();
    if (heroBounds) {
      const isKeyboardActivation = event.detail === 0;
      const x = isKeyboardActivation ? heroBounds.width / 2 : event.clientX - heroBounds.left;
      const y = isKeyboardActivation ? heroBounds.height / 2 : event.clientY - heroBounds.top;
      setSparkleBurst({ id: Date.now(), x, y });
      window.clearTimeout(sparkleTimerRef.current);
      sparkleTimerRef.current = window.setTimeout(() => setSparkleBurst(null), 800);
    }
    heroRef.current?.animate(
      [
        { transform: "translateY(0) scale(1)", boxShadow: "0 0 0 0 #ffb44300" },
        { transform: "translateY(-7px) scale(1.025)", boxShadow: "0 16px 34px -12px #ffb443aa" },
        { transform: "translateY(0) scale(1)", boxShadow: "0 0 0 0 #ffb44300" },
      ],
      { duration: 460, easing: "cubic-bezier(.2,1.5,.4,1)" },
    );
  };
  const hour = new Date().getHours();
  const greet = hour < 12 ? "GOOD MORNING" : hour < 17 ? "GOOD AFTERNOON" : "GOOD EVENING";
  const timetable = data.timetable || [];
  const now = new Date();
  const currentDay = DAYS[(now.getDay() + 6) % 7];
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const exactTodayIndex = timetable.findIndex((entry) => entry.dateKey === todayKey);
  const nextScheduledIndex = timetable.findIndex(
    (entry) => entry.dateKey && entry.dateKey > todayKey,
  );
  const todayIndex =
    exactTodayIndex >= 0
      ? exactTodayIndex
      : nextScheduledIndex >= 0
        ? nextScheduledIndex
        : Math.max(0, timetable.findIndex((entry) => entry.day === currentDay));
  const [scheduleIndex, setScheduleIndex] = useState(todayIndex);
  const selectedDay = timetable[scheduleIndex] || { day: currentDay, date: "", classes: [] };
  const att = Array.isArray(data.attendance) ? data.attendance : [];
  const currentModule =
    data.courses?.find((course) => course.completed < course.lessons) ??
    data.courses?.[data.courses.length - 1];
  const moduleAttendance = currentModule
    ? att
        .filter((record) => currentModule.title.endsWith(record.course))
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];
  const attendedCount = moduleAttendance.filter((record) => record.status === "Present").length;
  const attPct = moduleAttendance.length
    ? Math.round((attendedCount / moduleAttendance.length) * 100)
    : null;
  const pending = data.assignments.filter((a) => a.status !== "Submitted").length;
  const notifications = Array.isArray(data.notifications) ? data.notifications : [];
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="hub">
      <div className="hub-top">
        <div className="hub-hero" ref={heroRef}>
          <img src={hero} alt="" width={1536} height={768} />
          <button
            type="button"
            className="hub-hero-hit-area"
            aria-label="Pop the dashboard banner"
            onClick={popHero}
          />
          {sparkleBurst && (
            <span className="hub-hero-sparkles" key={sparkleBurst.id} aria-hidden="true">
              {[
                [-20, -23, 0],
                [18, -20, 0.04],
                [-29, 8, 0.08],
                [27, 9, 0.12],
                [-13, 27, 0.16],
                [14, 26, 0.2],
              ].map(([dx, dy, delay], index) => (
                <i
                  key={index}
                  className="hub-hero-sparkle"
                  style={{
                    left: sparkleBurst.x,
                    top: sparkleBurst.y,
                    "--sparkle-x": `${dx}px`,
                    "--sparkle-y": `${dy}px`,
                    "--sparkle-delay": `${delay}s`,
                  }}
                />
              ))}
            </span>
          )}
          <div className="hub-hero-copy">
            <span className="hub-eyebrow">
              {greet}, {USER.name?.split(" ")[0]?.toUpperCase()}
            </span>
            <h2>
              <span>Make Today</span>
              <span>Count</span>
            </h2>
            <p>Classes, marks, assignments and fees — all in one place.</p>
            <button className="hub-pill-btn" onClick={() => go("courses")}>
              Explore my course <ArrowRight size={14} />
            </button>
          </div>
          <div className="hub-quote">
            <GraduationCap size={18} />
            “Learn skill,
            <br />
            get job.”
          </div>
        </div>
        <div className="hub-schedule">
          <div className="hub-sched-head">
            <strong>
              <span
                key={selectedDay.dateKey || `${selectedDay.day}-${scheduleIndex}`}
                className="hub-sched-date"
              >
                {selectedDay.day}
                {selectedDay.date ? `, ${selectedDay.date}` : ""}
              </span>
            </strong>
            <div>
              <button
                type="button"
                className="hub-chip dark"
                onClick={() => setScheduleIndex(todayIndex)}
                disabled={scheduleIndex === todayIndex}
              >
                Today
              </button>
              <button
                type="button"
                aria-label="Previous day"
                onClick={() => setScheduleIndex((index) => Math.max(0, index - 1))}
                disabled={scheduleIndex === 0}
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                aria-label="Next day"
                onClick={() =>
                  setScheduleIndex((index) => Math.min(timetable.length - 1, index + 1))
                }
                disabled={scheduleIndex >= timetable.length - 1}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
          <div className="hub-sched-times">
            {["10AM", "12PM", "2PM", "4PM"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div
            key={selectedDay.dateKey || `${selectedDay.day}-${scheduleIndex}`}
            className="hub-sched-list"
          >
            {selectedDay.classes.map((c, i) => (
              <button
                key={i}
                className={`hub-event ${i === 0 ? "hot" : i === 1 ? "light" : "mint"}`}
                onClick={() => go("timetable")}
              >
                <strong>{c.title}</strong>
                <span>
                  {c.time} · {c.room}
                </span>
              </button>
            ))}
            {!selectedDay.classes.length && <p className="hub-muted">No classes scheduled.</p>}
          </div>
        </div>
      </div>

      <Card
        icon={Bell}
        title="Recent Notifications"
        sub="The latest updates from your learning portal"
        right={unreadNotifications ? `${unreadNotifications} unread` : "All caught up"}
      >
        <div className="hub-notifications">
          {notifications.slice(0, 3).map((notification) => (
            <button
              type="button"
              key={notification.id}
              className={`hub-notification${notification.read ? "" : " unread"}`}
              onClick={() => go("notifications")}
            >
              <span className="hub-notification-dot" aria-hidden="true" />
              <span className="hub-notification-copy">
                <strong>{notification.title}</strong>
                <span>{notification.message}</span>
              </span>
              <time>{notification.time}</time>
            </button>
          ))}
          {!notifications.length && <p className="hub-card-empty">No notifications yet.</p>}
          <button type="button" className="hub-notifications-link" onClick={() => go("notifications")}>
            View all notifications <ArrowRight size={13} />
          </button>
        </div>
      </Card>

      <div className="hub-row two hub-attendance-row">
        <Card
          icon={CalendarCheck}
          title="Attendance"
          sub={currentModule?.title.replace(/^Module \d+: /, "") ?? "Current module"}
          right="Current module"
          className="hub-attendance-card"
          onClick={() => go("attendance")}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) return;
            event.preventDefault();
            go("attendance");
          }}
        >
          <div className="hub-attendance-summary">
            <div className="hub-big">
              {attPct === null ? "—" : `${attPct}%`}
              {attPct !== null && <small>{attPct >= 75 ? "↑ on track" : "↓ below 75%"}</small>}
            </div>
            <span>{attendedCount}/{moduleAttendance.length} classes attended</span>
          </div>
          <MobileAttendanceVisual records={moduleAttendance} />
          <AttendanceChart records={moduleAttendance} />
          <span className="hub-attendance-link">View attendance report <ArrowRight size={13} /></span>
        </Card>
      </div>

      <Card
        icon={Grid3x3}
        title="Upcoming Deadlines"
        sub="Assignments still to submit"
        right={`${pending} pending`}
        className="wide"
      >
        <div className="hub-deadlines">
          {data.assignments
            .filter((a) => a.status !== "Submitted")
            .slice(0, 4)
            .map((a) => (
              <button key={a.id} className="hub-deadline" onClick={() => go("assignments")}>
                <div>
                  <strong>{a.title}</strong>
                  <span>{a.course}</span>
                </div>
                <em>{a.due}</em>
              </button>
            ))}
          {!pending && <p className="hub-card-empty">All caught up — nothing due.</p>}
        </div>
      </Card>

    </div>
  );
}
