import { describe, expect, it } from "vitest";
import { initialData } from "../campusly/data.js";
import {
  buildBatchModuleSchedule,
  getWeekDates,
  getWeekStart,
  toDateKey,
} from "../campusly/batchSchedule.js";

describe("batch timetable calendar", () => {
  it("aligns every module window to the assigned batch start date", () => {
    const modules = buildBatchModuleSchedule(initialData.courses, "2026-10-01");

    expect(modules).toHaveLength(10);
    expect(modules[0]).toMatchObject({ startDate: "2026-10-01", endDate: "2026-10-15" });
    expect(modules[1]).toMatchObject({ startDate: "2026-10-16", endDate: "2026-11-23" });
  });

  it("does not shift module dates when there is no batch start date", () => {
    const modules = buildBatchModuleSchedule(initialData.courses, undefined);

    expect(modules[0]).toMatchObject({ startDate: "2026-09-01", endDate: "2026-09-15" });
  });

  it("returns Monday through Saturday and omits Sunday", () => {
    const week = getWeekDates(getWeekStart(new Date(2026, 10, 5)));

    expect(week.map(toDateKey)).toEqual([
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
    ]);
  });

  it("keeps Sunday out of the calendar when navigating from a Sunday", () => {
    const week = getWeekDates(getWeekStart(new Date(2026, 10, 8)));

    expect(week).toHaveLength(6);
    expect(week.at(-1)?.getDay()).toBe(6);
    expect(week.map(toDateKey)).not.toContain("2026-11-08");
  });
});
