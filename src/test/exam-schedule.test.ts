import { describe, expect, it } from "vitest";

import { EXAM_SLOTS, MODULE_WINDOWS, loadDemoData } from "../campusly/data.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const parseLabel = (label: string) => {
  const [d, m, y] = label.split(" ");
  return new Date(Number(y), MONTHS.indexOf(m ?? ""), Number(d));
};
const parseISO = (iso: string) => {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Rule from the institute: a module's exam happens right after that module's
// classes end, and always before the next module's classes begin.
describe("Exam schedule follows module completion", () => {
  it("schedules every exam after its module ends and before the next module starts", () => {
    for (const exam of EXAM_SLOTS) {
      const moduleNum = Number(exam.code.match(/\d+/)?.[0]);
      const window = MODULE_WINDOWS[moduleNum - 1];
      expect(window, `no module window for ${exam.code}`).toBeTruthy();

      const examDate = parseLabel(exam.date);
      const moduleEnd = parseISO(window[1]);
      expect(
        examDate >= moduleEnd,
        `${exam.code} exam ${exam.date} is before its module ends`,
      ).toBe(true);

      const nextWindow = MODULE_WINDOWS[moduleNum];
      if (nextWindow) {
        expect(
          examDate <= parseISO(nextWindow[0]),
          `${exam.code} exam ${exam.date} is after the next module starts`,
        ).toBe(true);
      }
    }
  });

  it("covers all 10 modules", () => {
    const covered = new Set(EXAM_SLOTS.map((e: { code: string }) => e.code));
    expect(covered.size).toBe(10);
  });

  it("includes a maximum mark value for every exam slot", () => {
    for (const exam of EXAM_SLOTS) {
      expect(exam.maxMarks, `${exam.id} is missing maxMarks`).toBeGreaterThan(0);
    }
  });

  it("uses separate 100-mark Theory and Practical exams for Module 2", () => {
    const module2Exams = EXAM_SLOTS.filter((exam: { code: string }) => exam.code === "M02-PYD");
    expect(module2Exams.map((exam: { type: string }) => exam.type)).toEqual([
      "Theory Exam",
      "Practical Lab",
    ]);
    expect(module2Exams.every((exam: { maxMarks?: number }) => exam.maxMarks === 100)).toBe(true);

    const module2Marks = loadDemoData().marks.filter((mark: { module: number }) => mark.module === 2);
    expect(module2Marks.map((mark: { examType?: string }) => mark.examType)).toEqual([
      "Theory",
      "Practical",
    ]);
    expect(module2Marks.every((mark: { total: number }) => mark.total === 100)).toBe(true);
  });
});
