import { describe, expect, it } from "vitest";
import { FEES, getFeesForCourses, initialData } from "../campusly/data";

describe("module fee progression", () => {
  it("issues only the first module for a fresh student", () => {
    const fees = getFeesForCourses([{ id: 1, completed: 0, lessons: 15 }], []);

    expect(fees[0].status).toBe("Pending");
    expect(fees.slice(1).every((fee) => fee.status === "Not issued")).toBe(true);
  });

  it("preserves the demo student's payments through the active module", () => {
    const fees = getFeesForCourses(initialData.courses, FEES);

    expect(fees.slice(0, 3).map((fee) => fee.status)).toEqual(["Paid", "Paid", "Paid"]);
    expect(fees[2].receipt).toBe("SKL-FEE-2026-0003");
    expect(fees.slice(3).every((fee) => fee.status === "Not issued")).toBe(true);
  });

  it("advances issuance when the student reaches the next module", () => {
    const existingFees = FEES.map((fee) =>
      fee.module === 3 ? { ...fee, status: "Paid", receipt: "SKL-FEE-2026-0003" } : fee,
    );
    const courses = [1, 2, 3, 4].map((id) => ({
      id,
      completed: id < 4 ? 15 : 0,
      lessons: 15,
    }));
    const fees = getFeesForCourses(courses, existingFees);

    expect(fees[2]).toMatchObject({ status: "Paid", receipt: "SKL-FEE-2026-0003" });
    expect(fees[3].status).toBe("Pending");
    expect(fees.slice(4).every((fee) => fee.status === "Not issued")).toBe(true);
  });

  it("does not issue the following module while the current one is unpaid", () => {
    const courses = [1, 2, 3, 4].map((id) => ({
      id,
      completed: id < 4 ? 15 : 0,
      lessons: 15,
    }));
    const feesWithUnpaidCurrent = FEES.map((fee) =>
      fee.module === 3 ? { ...fee, status: "Pending", receipt: null, method: null } : fee,
    );
    const fees = getFeesForCourses(courses, feesWithUnpaidCurrent);

    expect(fees[2].status).toBe("Pending");
    expect(fees[3].status).toBe("Not issued");
  });
});
