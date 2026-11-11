import { SESSIONS } from "./sessions";
import demoStudentAvatar from "../assets/demo-student-avatar.svg";

export const DEMO_USER = {
  name: "Nihal Hegde",
  email: "student@skillai.demo",
  password: "student123",
  studentId: "MBD-2026-0148",
  applicationNo: "APP-2026-0148",
  gender: "Male",
  birthDate: "2004-09-13",
  birthPlace: "Belthangady",
  motherTongue: "Kannada",
  bloodGroup: "A+",
  aadhaar: "123456789012",
  address: "Korody House, Belthangady",
  education: [
    {
      qualification: "Bachelor of Science",
      institute: "Mangalore University",
      yearOfPassing: "2026",
      percentage: "78%",
    },
  ],
  photo: demoStudentAvatar,
  program: "Master's in AI Big Data & Advance MLOps",
  batch: "October 2026 · 12 Months",
  phone: "+91 98765 43210",
  admissionYear: "2026",
  joined: "01 Sep 2026",
};

const C = ["violet", "blue", "orange", "green"];

// Subjects inside each module, taken from the institute syllabus document.
const SUBJECTS = {
  1: [
    ["1.1", "Program Orientation & Industry Landscape"],
    ["1.2", "Introduction to Programming & Databases"],
    ["1.3", "Introduction to Data Science & Visualization"],
    ["1.4", "Introduction to Big Data & Cloud"],
    ["1.5", "Introduction to MLOps, Deep Learning & AI"],
  ],
  2: [
    ["2.1", "Advanced Python Programming"],
    ["2.2", "Object-Oriented Programming (OOP)"],
    ["2.3", "File Handling & Exception Handling"],
    ["2.4", "Modules & Packages"],
    ["2.5", "Database Fundamentals"],
    ["2.6", "SQL (Advanced)"],
    ["2.7", "Database Connectivity using Python"],
  ],
  3: [
    ["3.1", "Data Science & Data Analysis"],
    ["3.2", "Data Cleaning & Wrangling"],
    ["3.3", "Statistics for Data Science"],
    ["3.4", "Exploratory Data Analysis (EDA)"],
    ["3.5", "Data Visualization"],
    ["3.6", "Machine Learning Foundations"],
  ],
  4: [
    ["4.1", "Big Data Foundations & Distributed Computing"],
    ["4.2", "Hadoop & HDFS"],
    ["4.3", "Hive"],
    ["4.4", "Apache Spark"],
    ["4.5", "Kafka & Data Lakes"],
    ["4.6", "ETL & Cloud Data Engineering"],
  ],
  5: [
    ["5.1", "Tableau (Advanced)"],
    ["5.2", "Power BI & DAX (Advanced)"],
    ["5.3", "Dashboard Development & Business Intelligence"],
    ["5.4", "Publishing & Enterprise Reports"],
  ],
  6: [
    ["6.1", "Advanced Machine Learning"],
    ["6.2", "ML Pipelines & Experiment Tracking"],
    ["6.3", "Docker & Containerization"],
    ["6.4", "Kubernetes & Orchestration"],
    ["6.5", "CI/CD & Model Deployment"],
    ["6.6", "Model Monitoring & Automation"],
  ],
  7: [
    ["7.1", "Neural Network & Deep Learning Foundations"],
    ["7.2", "Convolutional Neural Networks (CNN)"],
    ["7.3", "Transfer Learning & Image Classification"],
    ["7.4", "Recurrent Neural Networks (RNN) & LSTM"],
    ["7.5", "Object Detection"],
    ["7.6", "Image Segmentation & Advanced Computer Vision"],
  ],
  8: [
    ["8.1", "NLP Fundamentals"],
    ["8.2", "Transformers & LLMs"],
    ["8.3", "Advanced LLM Techniques"],
    ["8.4", "RAG & Vector Databases"],
    ["8.5", "Advanced NLP Applications"],
    ["8.6", "AI Bots & Framework Integration"],
    ["8.7", "Multi-modal Voice AI & Responsible Deployment"],
  ],
  9: [
    ["9.1", "Generative AI"],
    ["9.2", "Agentic AI & AI Agents"],
    ["9.3", "Multi-Agent Systems & AI Workflows"],
    ["9.4", "Enterprise AI Applications"],
  ],
  10: [
    ["10.1", "AI Research Methodology"],
    ["10.2", "Enterprise AI Architecture & Solution Design"],
    ["10.3", "Final Capstone Project"],
  ],
};

const M = [
  [
    "AI Foundation / Orientation",
    "M01-AIF",
    "Ananya Rao",
    "15 Days",
    15,
    15,
    "Completed",
    ["AI Landscape Overview.pdf", "Orientation Handbook.pdf"],
  ],
  [
    "Advanced Python & Database Foundation",
    "M02-PYD",
    "Rahul Shetty",
    "2 Months",
    40,
    40,
    "Joins, Indexing & Query Tuning",
    ["Python Advanced Notes.pdf", "SQL & NoSQL Cheat Sheet.pdf"],
  ],
  [
    "ML, Data Science & Data Visualization",
    "M03-MLDS",
    "Meera Nair",
    "55 Days",
    55,
    8,
    "Exploratory Data Analysis with Pandas",
    ["ML Algorithms Primer.pdf", "Matplotlib & Seaborn Lab.zip"],
  ],
  [
    "Big Data & Cloud Data Engineering",
    "M04-BDE",
    "Vikram Pai",
    "40 Days",
    40,
    0,
    "Hadoop & Spark Architecture",
    ["PySpark Starter Kit.zip"],
  ],
  [
    "Big Data Analytics — Tableau & Power BI",
    "M05-BDA",
    "Sneha Kulkarni",
    "25 Days",
    25,
    0,
    "Dashboard Design Basics",
    ["Power BI Workbook.pdf"],
  ],
  [
    "Advanced MLOps",
    "M06-MLO",
    "Arjun Menon",
    "1.5 Months",
    30,
    0,
    "MLflow & Model Registry",
    ["MLOps Pipeline Guide.pdf"],
  ],
  [
    "Advanced Deep Learning & Computer Vision",
    "M07-DLCV",
    "Kavya Iyer",
    "2 Months",
    40,
    0,
    "Neural Networks with PyTorch",
    ["CNN Architectures.pdf"],
  ],
  [
    "NLP & AI Bots",
    "M08-NLP",
    "Rohan Desai",
    "2 Months",
    40,
    0,
    "Transformers & Tokenization",
    ["NLP Toolkit Guide.pdf"],
  ],
  [
    "Generative AI & Agentic AI",
    "M09-GAI",
    "Priya Hegde",
    "15 Days",
    15,
    0,
    "LLMs & Prompt Engineering",
    ["GenAI Foundations.pdf"],
  ],
  [
    "AI Research & Architecture + Capstone",
    "S10-AIR",
    "Dr. Suresh Bhat",
    "15 Days",
    15,
    0,
    "Reading Research Papers",
    ["Research Methodology.pdf"],
  ],
];

// Each module runs one after another, so every session has a class date.
// These windows follow the durations in the syllabus; Module 1 began 01 Sep 2026.
export const MODULE_WINDOWS = [
  ["2026-09-01", "2026-09-15"],
  ["2026-09-16", "2026-10-24"],
  ["2026-10-25", "2026-12-18"],
  ["2026-12-19", "2027-01-27"],
  ["2027-01-28", "2027-02-21"],
  ["2027-02-22", "2027-03-23"],
  ["2027-03-24", "2027-05-02"],
  ["2027-05-03", "2027-07-01"],
  ["2027-07-02", "2027-07-16"],
  ["2027-07-17", "2027-07-31"],
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fromISO = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const dayLabel = (d) =>
  `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const fromLabel = (l) => {
  const [d, m, y] = l.split(" ");
  return new Date(Number(y), MONTHS.indexOf(m), Number(d));
};

// Class date of every session in a module, spread evenly across its window.
function sessionDates(module, count) {
  const window = MODULE_WINDOWS[module - 1];
  if (!window || count < 1) return [];
  const start = fromISO(window[0]);
  const span = (fromISO(window[1]) - start) / 86400000;
  const step = count > 1 ? span / (count - 1) : 0;
  return Array.from({ length: count }, (_, i) =>
    dayLabel(new Date(start.getTime() + Math.round(i * step) * 86400000)),
  );
}

// Attendance is taken session by session: one record for each class held so far.
const ATTENDANCE = [];
M.forEach(([title, , , , lessons, completed], i) => {
  sessionDates(i + 1, lessons)
    .slice(0, completed)
    .forEach((date, s) => {
      ATTENDANCE.push({ date, course: title, session: s + 1, status: "Present" });
    });
});
// The personal leave approved for 22 Oct (LV-1024) was a missed Module 2 class.
const missedClass = ATTENDANCE.find(
  (a) => a.course === "Advanced Python & Database Foundation" && a.date === "22 Oct 2026",
);
if (missedClass) missedClass.status = "Absent";
// A missed Module 3 session keeps the current-module dashboard chart realistic.
const missedCurrentModuleClass = ATTENDANCE.find((a) => a.course === M[2][0] && a.session === 4);
if (missedCurrentModuleClass) missedCurrentModuleClass.status = "Absent";
ATTENDANCE.sort((a, b) => fromLabel(b.date) - fromLabel(a.date));

// Courses a student can request to shift between (institute-level courses, not modules).
export const SHIFT_COURSES = [
  "Master's in AI Big Data & Advance MLOps",
  "Power BI",
  "Tableau",
  "Multimedia",
  "Advanced Python",
  "Data Science & Machine Learning",
  "Digital Marketing",
];

export const initialData = {
  certificateUnlocked: false,
  courses: M.map(([title, code, instructor, duration, lessons, completed, next, mats], i) => ({
    id: i + 1,
    title: `Module ${i + 1}: ${title}`,
    code,
    instructor,
    duration,
    color: C[i % 4],
    lessons,
    completed,
    progress: Math.round((completed / lessons) * 100),
    next: completed >= lessons ? "Module completed" : next,
    subjects: (SUBJECTS[i + 1] || []).map(([num, name]) => ({ num, name })),
    sessions: (SESSIONS[i + 1] || []).map((topic, s) => ({
      num: s + 1,
      topic,
      done: s < completed,
    })),
    materials: mats.map((name) => ({
      name,
      type: name.split(".").pop().toUpperCase(),
      size: "1.2 MB",
    })),
  })),
  attendance: ATTENDANCE,
  marks: [
    {
      id: "MK-01",
      module: 1,
      subject: "AI Foundation / Orientation",
      code: "M01-AIF",
      date: "16 Sep 2026",
      score: 46,
      total: 50,
      status: "Published",
      feedback: "Excellent grasp of AI fundamentals.",
    },
    {
      id: "MK-02-T",
      module: 2,
      subject: "Advanced Python & Database Foundation",
      code: "M02-PYD",
      examType: "Theory",
      date: "25 Oct 2026",
      score: 61,
      total: 100,
      status: "Published",
      feedback: "Strong code structure. Practise window functions and decorators.",
    },
    {
      id: "MK-02-P",
      module: 2,
      subject: "Advanced Python & Database Foundation",
      code: "M02-PYD",
      examType: "Practical",
      date: "24 Oct 2026",
      score: 70,
      total: 100,
      status: "Published",
      feedback: "Good database application skills. Improve exception handling and code documentation.",
    },
    {
      id: "MK-03",
      module: 3,
      subject: "ML, Data Science & Data Visualization",
      code: "M03-MLDS",
      date: "—",
      score: null,
      total: 100,
      status: "Pending",
      feedback: "Your module mark will appear here once Module 3 ends.",
    },
    {
      id: "MK-04",
      module: 4,
      subject: "Big Data & Cloud Data Engineering",
      code: "M04-BDE",
      date: "—",
      score: null,
      total: 100,
      status: "Not started",
      feedback: "Marks are published when the module ends.",
    },
    {
      id: "MK-05",
      module: 5,
      subject: "Big Data Analytics — Tableau & Power BI",
      code: "M05-BDA",
      date: "—",
      score: null,
      total: 100,
      status: "Not started",
      feedback: "Marks are published when the module ends.",
    },
    {
      id: "MK-06",
      module: 6,
      subject: "Advanced MLOps",
      code: "M06-MLO",
      date: "—",
      score: null,
      total: 100,
      status: "Not started",
      feedback: "Marks are published when the module ends.",
    },
    {
      id: "MK-07",
      module: 7,
      subject: "Advanced Deep Learning & Computer Vision",
      code: "M07-DLCV",
      date: "—",
      score: null,
      total: 100,
      status: "Not started",
      feedback: "Marks are published when the module ends.",
    },
    {
      id: "MK-08",
      module: 8,
      subject: "NLP & AI Bots",
      code: "M08-NLP",
      date: "—",
      score: null,
      total: 100,
      status: "Not started",
      feedback: "Marks are published when the module ends.",
    },
    {
      id: "MK-09",
      module: 9,
      subject: "Generative AI & Agentic AI",
      code: "M09-GAI",
      date: "—",
      score: null,
      total: 100,
      status: "Not started",
      feedback: "Marks are published when the module ends.",
    },
    {
      id: "MK-10",
      module: 10,
      subject: "AI Research & Architecture + Capstone",
      code: "S10-AIR",
      date: "—",
      score: null,
      total: 100,
      status: "Not started",
      feedback: "Marks are published when the module ends.",
    },
  ],
  assignments: [
    {
      id: 1,
      title: "Build a library database with SQL & MongoDB",
      course: "Advanced Python & Database Foundation",
      due: "30 Oct 2026",
      points: 25,
      status: "In progress",
      description:
        "Design a normalized SQL schema and a MongoDB collection, then write 10 queries comparing both.",
    },
    {
      id: 2,
      title: "Python data cleaning pipeline",
      course: "Advanced Python & Database Foundation",
      due: "02 Nov 2026",
      points: 20,
      status: "Not started",
      description:
        "Write reusable Python functions to clean, transform and summarise a sales dataset.",
    },
    {
      id: 3,
      title: "EDA report on a public dataset",
      course: "ML, Data Science & Data Visualization",
      due: "08 Nov 2026",
      points: 30,
      status: "Not started",
      description:
        "Explore a Kaggle dataset with Pandas and present 5 insights using Matplotlib/Seaborn charts.",
    },
    {
      id: 4,
      title: "AI career roadmap essay",
      course: "AI Foundation / Orientation",
      due: "15 Sep 2026",
      points: 10,
      status: "Submitted",
      description: "Write a one-page plan for your journey into Big Data & MLOps.",
    },
  ],
  leaves: [
    {
      id: "LV-1024",
      type: "Personal",
      from: "22 Oct 2026",
      to: "22 Oct 2026",
      days: 1,
      reason: "Personal appointment",
      status: "Approved",
      remarks: "Approved. Please catch up on the SQL session.",
      applied: "20 Oct 2026",
    },
    {
      id: "LV-1031",
      type: "Medical",
      from: "29 Oct 2026",
      to: "30 Oct 2026",
      days: 2,
      reason: "Medical check-up",
      status: "Pending",
      remarks: "Awaiting mentor review.",
      applied: "26 Oct 2026",
    },
  ],
  certificates: [
    {
      id: "CERT-2026-021",
      title: "Module 1 — AI Foundation / Orientation",
      date: "16 Sep 2026",
      issuer: "Master's in AI Big Data & Advance MLOps",
      status: "Issued",
    },
    {
      id: "CERT-2026-035",
      title: "Module 2 — Advanced Python & Database Foundation",
      date: "—",
      issuer: "Master's in AI Big Data & Advance MLOps",
      status: "In progress",
    },
  ],
  notifications: [
    {
      id: 1,
      title: "New marks published",
      message: "Your Module 2 mark is available.",
      time: "2 hours ago",
      read: false,
      kind: "result",
    },
    {
      id: 2,
      title: "Assignment deadline coming up",
      message: "Library database project is due on 30 Oct.",
      time: "Yesterday",
      read: false,
      kind: "assignment",
    },
    {
      id: 3,
      title: "Module 3 started",
      message: "ML, Data Science & Data Visualization sessions have begun.",
      time: "20 Oct",
      read: true,
      kind: "course",
    },
    {
      id: 4,
      title: "Study material added",
      message: "New ML Algorithms Primer added to Module 3.",
      time: "19 Oct",
      read: true,
      kind: "course",
    },
  ],
  timetable: [
    {
      day: "Mon",
      date: "26 Oct",
      dateKey: "2026-10-26",
      classes: [
        { time: "10:00 AM", title: "Advanced Python & Databases", room: "Lab 01", color: "blue" },
        { time: "02:00 PM", title: "ML & Data Science", room: "Room 104", color: "orange" },
      ],
    },
    {
      day: "Tue",
      date: "27 Oct",
      dateKey: "2026-10-27",
      classes: [
        { time: "10:00 AM", title: "ML & Data Science", room: "Room 104", color: "orange" },
        { time: "02:00 PM", title: "Data Visualization Lab", room: "Lab 02", color: "violet" },
      ],
    },
    {
      day: "Wed",
      date: "28 Oct",
      dateKey: "2026-10-28",
      classes: [
        { time: "10:00 AM", title: "Advanced Python & Databases", room: "Lab 01", color: "blue" },
      ],
    },
    {
      day: "Thu",
      date: "29 Oct",
      dateKey: "2026-10-29",
      classes: [
        { time: "10:00 AM", title: "ML & Data Science", room: "Room 104", color: "orange" },
        { time: "02:00 PM", title: "SQL Practice Lab", room: "Lab 01", color: "blue" },
      ],
    },
    {
      day: "Fri",
      date: "30 Oct",
      dateKey: "2026-10-30",
      classes: [
        { time: "10:00 AM", title: "Data Visualization Lab", room: "Lab 02", color: "violet" },
        { time: "02:00 PM", title: "Mentor Doubt Session", room: "Innovation Hub", color: "green" },
      ],
    },
    {
      day: "Mon",
      date: "2 Nov",
      dateKey: "2026-11-02",
      classes: [
        { time: "10:00 AM", title: "Advanced Python & Databases", room: "Lab 01", color: "blue" },
        { time: "02:00 PM", title: "Data Visualization Lab", room: "Lab 02", color: "violet" },
      ],
    },
    {
      day: "Tue",
      date: "3 Nov",
      dateKey: "2026-11-03",
      classes: [
        { time: "10:00 AM", title: "ML & Data Science", room: "Room 104", color: "orange" },
        { time: "02:00 PM", title: "SQL Practice Lab", room: "Lab 01", color: "blue" },
      ],
    },
    {
      day: "Wed",
      date: "4 Nov",
      dateKey: "2026-11-04",
      classes: [
        { time: "10:00 AM", title: "Data Visualization Lab", room: "Lab 02", color: "violet" },
        { time: "02:00 PM", title: "Mentor Doubt Session", room: "Innovation Hub", color: "green" },
      ],
    },
    {
      day: "Thu",
      date: "5 Nov",
      dateKey: "2026-11-05",
      classes: [
        { time: "10:00 AM", title: "ML & Data Science", room: "Room 104", color: "orange" },
        { time: "02:00 PM", title: "SQL Practice Lab", room: "Lab 01", color: "blue" },
      ],
    },
    {
      day: "Fri",
      date: "6 Nov",
      dateKey: "2026-11-06",
      classes: [
        { time: "10:00 AM", title: "Advanced Python & Databases", room: "Lab 01", color: "blue" },
        { time: "02:00 PM", title: "Mentor Doubt Session", room: "Innovation Hub", color: "green" },
      ],
    },
    {
      day: "Mon",
      date: "9 Nov",
      dateKey: "2026-11-09",
      classes: [
        { time: "10:00 AM", title: "ML & Data Science", room: "Room 104", color: "orange" },
        { time: "02:00 PM", title: "Data Visualization Lab", room: "Lab 02", color: "violet" },
      ],
    },
    {
      day: "Tue",
      date: "10 Nov",
      dateKey: "2026-11-10",
      classes: [
        { time: "10:00 AM", title: "Advanced Python & Databases", room: "Lab 01", color: "blue" },
      ],
    },
    {
      day: "Wed",
      date: "11 Nov",
      dateKey: "2026-11-11",
      classes: [
        { time: "10:00 AM", title: "SQL Practice Lab", room: "Lab 01", color: "blue" },
        { time: "02:00 PM", title: "Mentor Doubt Session", room: "Innovation Hub", color: "green" },
      ],
    },
    {
      day: "Thu",
      date: "12 Nov",
      dateKey: "2026-11-12",
      classes: [
        { time: "10:00 AM", title: "Data Visualization Lab", room: "Lab 02", color: "violet" },
      ],
    },
    {
      day: "Fri",
      date: "13 Nov",
      dateKey: "2026-11-13",
      classes: [
        { time: "10:00 AM", title: "ML & Data Science", room: "Room 104", color: "orange" },
        { time: "02:00 PM", title: "Mentor Doubt Session", room: "Innovation Hub", color: "green" },
      ],
    },
  ],
};

// Every module's exam is held right after that module's classes end,
// before the next module begins — never weeks later.
export const EXAM_SLOTS = [
  {
    id: "EX-01",
    subject: "AI Foundation / Orientation",
    code: "M01-AIF",
    type: "Module Final",
    date: "16 Sep 2026",
    time: "10:00 AM – 11:00 AM",
    venue: "Exam Hall A",
    seat: "A-12",
    maxMarks: 50,
    status: "Completed",
  },
  {
    id: "EX-02",
    subject: "Advanced Python & Database Foundation",
    code: "M02-PYD",
    type: "Theory Exam",
    date: "25 Oct 2026",
    time: "10:00 AM – 12:30 PM",
    venue: "Exam Hall A",
    seat: "A-24",
    maxMarks: 100,
    status: "Completed",
  },
  {
    id: "EX-03",
    subject: "Advanced Python & Database Foundation",
    code: "M02-PYD",
    type: "Practical Lab",
    date: "24 Oct 2026",
    time: "02:00 PM – 04:00 PM",
    venue: "Lab 01",
    seat: "L1-11",
    maxMarks: 100,
    status: "Completed",
  },
  {
    id: "EX-04",
    subject: "ML, Data Science & Data Visualization",
    code: "M03-MLDS",
    type: "Module Final",
    date: "19 Dec 2026",
    time: "10:00 AM – 12:00 PM",
    venue: "Exam Hall B",
    seat: "B-08",
    maxMarks: 100,
    status: "Upcoming",
  },
  {
    id: "EX-05",
    subject: "Big Data & Cloud Data Engineering",
    code: "M04-BDE",
    type: "Module Final",
    date: "28 Jan 2027",
    time: "10:00 AM – 12:00 PM",
    venue: "Exam Hall A",
    seat: "A-15",
    maxMarks: 100,
    status: "Upcoming",
  },
  {
    id: "EX-06",
    subject: "Big Data Analytics — Tableau & Power BI",
    code: "M05-BDA",
    type: "Module Final",
    date: "22 Feb 2027",
    time: "10:00 AM – 12:00 PM",
    venue: "Exam Hall B",
    seat: "B-11",
    maxMarks: 100,
    status: "Upcoming",
  },
  {
    id: "EX-07",
    subject: "Advanced MLOps",
    code: "M06-MLO",
    type: "Module Final",
    date: "24 Mar 2027",
    time: "10:00 AM – 12:00 PM",
    venue: "Exam Hall A",
    seat: "A-09",
    maxMarks: 100,
    status: "Upcoming",
  },
  {
    id: "EX-08",
    subject: "Advanced Deep Learning & Computer Vision",
    code: "M07-DLCV",
    type: "Module Final",
    date: "03 May 2027",
    time: "10:00 AM – 12:00 PM",
    venue: "Exam Hall B",
    seat: "B-04",
    maxMarks: 100,
    status: "Upcoming",
  },
  {
    id: "EX-09",
    subject: "NLP & AI Bots",
    code: "M08-NLP",
    type: "Module Final",
    date: "02 Jul 2027",
    time: "10:00 AM – 12:00 PM",
    venue: "Exam Hall A",
    seat: "A-18",
    maxMarks: 100,
    status: "Upcoming",
  },
  {
    id: "EX-10",
    subject: "Generative AI & Agentic AI",
    code: "M09-GAI",
    type: "Module Final",
    date: "17 Jul 2027",
    time: "10:00 AM – 11:30 AM",
    venue: "Exam Hall B",
    seat: "B-02",
    maxMarks: 100,
    status: "Upcoming",
  },
  {
    id: "EX-11",
    subject: "AI Research & Architecture + Capstone",
    code: "S10-AIR",
    type: "Module Final",
    date: "01 Aug 2027",
    time: "10:00 AM – 12:00 PM",
    venue: "Exam Hall A",
    seat: "A-06",
    maxMarks: 100,
    status: "Upcoming",
  },
];

// Demo payment records. Each entry belongs to its own module and is never reused
// as payment for another module. Modules with no entry here have no fee issued yet.
const FEE_RECORDS = {
  1: {
    amount: 12500,
    date: "18 Sep 2026",
    status: "Paid",
    receipt: "SKL-FEE-2026-0001",
    method: "UPI",
  },
  2: {
    amount: 12500,
    date: "27 Oct 2026",
    status: "Paid",
    receipt: "SKL-FEE-2026-0002",
    method: "Credit Card",
  },
  3: {
    amount: 12500,
    date: "05 Nov 2026",
    status: "Paid",
    receipt: "SKL-FEE-2026-0003",
    method: "UPI",
  },
};

export const FEES = initialData.courses.map((course) => ({
  id: `FE-M${String(course.id).padStart(2, "0")}`,
  module: course.id,
  title: course.title.replace(/^Module \d+: /, ""),
  code: course.code,
  amount: 12500,
  date: null,
  status: "Not issued",
  receipt: null,
  method: null,
  ...(FEE_RECORDS[course.id] || {}),
}));

export function getFeesForCourses(courses, existingFees = FEES) {
  const currentModule =
    courses.find((course) => Number(course.completed || 0) < Number(course.lessons))?.id ??
    Math.max(0, ...courses.map((course) => Number(course.id) || 0));
  const payableModule = FEES.find((fee) => {
    const existing = existingFees.find((item) => item.module === fee.module);
    return fee.module <= currentModule && existing?.status !== "Paid";
  })?.module;

  return FEES.map((fee) => {
    const existing = existingFees.find((item) => item.module === fee.module);
    const currentFee = existing || {
      ...fee,
      date: null,
      status: "Not issued",
      receipt: null,
      method: null,
    };
    if (currentFee.status === "Paid") return currentFee;
    if (fee.module === payableModule) return { ...currentFee, status: "Pending" };
    return { ...currentFee, status: "Not issued", date: null, receipt: null, method: null };
  });
}

export const USER = { ...DEMO_USER };
const ACCOUNTS_KEY = "portal-accounts";
const isDemo = () => USER.email === DEMO_USER.email;
const dataKey = () => (isDemo() ? "campusly-demo-data" : `portal-data-${USER.email}`);
export const profileKey = () =>
  isDemo() ? "campusly-demo-profile" : `portal-profile-${USER.email}`;

export function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
}
export function findAccount(email) {
  const e = String(email).trim().toLowerCase();
  if (!e) return null;
  if (e === DEMO_USER.email) return { ...DEMO_USER };
  return getAccounts().find((a) => a.email === e) || null;
}
export function registerAccount({ name, email, password, program }) {
  const e = email.trim().toLowerCase();
  if (findAccount(e))
    return { error: "An account with this email already exists. Please sign in." };
  const now = new Date();
  const account = {
    name,
    email: e,
    password,
    program,
    studentId: `STU-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
    batch: new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(now),
    phone: "",
    joined: new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(now),
  };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...getAccounts(), account]));
  return { account };
}
export function setCurrentUser(acc) {
  Object.keys(USER).forEach((k) => delete USER[k]);
  Object.assign(USER, acc);
}

function freshData() {
  const d = structuredClone(initialData);
  return d;
}

export function loadDemoData() {
  try {
    const stored = localStorage.getItem(dataKey());
    const parsed = stored ? JSON.parse(stored) : null;
    if (!parsed || !parsed.courses?.length || !parsed.marks?.length) return freshData();
    // Older saved data was labelled semester-wise; the portal now speaks in modules.
    const stale =
      parsed.marks.some((m) => "semester" in m) ||
      parsed.courses.some((c) => /^Semester \d+: /.test(c.title) || !c.subjects || !c.sessions) ||
      !parsed.attendance?.every((a) => "session" in a);
    if (stale) return freshData();
    const currentTitles = new Map(initialData.courses.map((course) => [course.id, course.title]));
    const module2Marks = parsed.marks.filter((mark) => mark.module === 2);
    const hasTheoryMark = module2Marks.some((mark) =>
      mark.examType === "Theory" && mark.total === 100
    );
    const hasPracticalMark = module2Marks.some((mark) =>
      mark.examType === "Practical" && mark.total === 100
    );
    const marksNeedModule2Migration = !hasTheoryMark || !hasPracticalMark;
    const migratedMarks = marksNeedModule2Migration
      ? parsed.marks.flatMap((mark) =>
          mark.module === 2
            ? initialData.marks.filter((currentMark) => currentMark.module === 2)
            : [mark]
        ).filter((mark, index, marks) =>
          marks.findIndex((candidate) => candidate.id === mark.id) === index
        )
      : parsed.marks;
    return {
      ...parsed,
      certificateUnlocked: false,
      timetable: initialData.timetable,
      marks: migratedMarks,
      courses: parsed.courses.map((course) => ({
        ...course,
        title: currentTitles.get(course.id) || course.title,
      })),
      attendance: parsed.attendance.map((record) =>
        record.course === missedCurrentModuleClass?.course &&
        record.session === missedCurrentModuleClass?.session
          ? { ...record, status: "Absent" }
          : record,
      ),
    };
  } catch {
    return freshData();
  }
}

export function saveDemoData(data) {
  localStorage.setItem(dataKey(), JSON.stringify(data));
}

export function resetDemoData() {
  localStorage.removeItem(dataKey());
  return freshData();
}
