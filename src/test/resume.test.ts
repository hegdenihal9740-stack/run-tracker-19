import { describe, expect, it } from "vitest";

import { initialData } from "@/campusly/data";
import { buildResumeProfile } from "@/campusly/Resume";

describe("progress-based student resume", () => {
  it("adds curriculum skills only after a module is complete", () => {
    const courses = structuredClone(initialData.courses);
    const profile = buildResumeProfile(courses);

    expect(profile.skills).toContain("Python and Git setup");
    expect(profile.skills).toContain("Advanced Python");
    expect(profile.skills).not.toContain("NumPy and Pandas");

    courses[2].completed = courses[2].lessons;
    const updatedProfile = buildResumeProfile(courses);

    expect(updatedProfile.skills).toContain("NumPy and Pandas");
    expect(updatedProfile.skills).toContain("Scikit-learn and model evaluation");
  });
});
