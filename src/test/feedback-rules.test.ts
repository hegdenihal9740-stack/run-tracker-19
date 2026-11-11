import { describe, expect, it } from "vitest";
import { feedbackError } from "../campusly/feedbackRules";

describe("feedback validation", () => {
  it("accepts course-specific feedback", () => {
    expect(
      feedbackError({
        kind: "course_feedback",
        module: "3",
        rating: 4,
        message: "More practical examples please.",
      }),
    ).toBe("");
  });
  it("accepts a shift to another course", () => {
    expect(
      feedbackError({
        kind: "module_shift",
        module: "",
        course: "Power BI",
        targetCourse: "Tableau",
        message: "Requesting a change of course.",
      }),
    ).toBe("");
  });
  it("rejects a shift without a destination course", () => {
    expect(
      feedbackError({
        kind: "module_shift",
        module: "",
        course: "Power BI",
        targetCourse: "",
        message: "Request a change.",
      }),
    ).not.toBe("");
  });
  it("rejects shifting to the same course", () => {
    expect(
      feedbackError({
        kind: "module_shift",
        module: "",
        course: "Tableau",
        targetCourse: "Tableau",
        message: "Request a change.",
      }),
    ).not.toBe("");
  });
});
