import { afterEach, describe, expect, it } from "vitest";

import { initialData, loadDemoData } from "@/campusly/data";
import { MODULE_ROADMAP } from "@/campusly/sessions";

afterEach(() => {
  localStorage.removeItem("campusly-demo-data");
});

describe("course learning roadmap", () => {
  it("keeps the certificate application locked until course completion", () => {
    expect(initialData.certificateUnlocked).toBe(false);

    const saved = structuredClone(initialData);
    delete saved.certificateUnlocked;
    localStorage.setItem("campusly-demo-data", JSON.stringify(saved));

    expect(loadDemoData().certificateUnlocked).toBe(false);
  });

  it("provides an overview, skills, and career pathways for all ten modules", () => {
    expect(initialData.courses).toHaveLength(10);

    for (const course of initialData.courses) {
      const roadmap = MODULE_ROADMAP[course.id];

      expect(roadmap.overview).toBeTruthy();
      expect(roadmap.skills.length).toBeGreaterThan(0);
      expect(roadmap.roles.length).toBeGreaterThan(0);
      expect(course.sessions).toHaveLength(course.lessons);
    }
  });

  it("includes one absent session in the current module's demo attendance", () => {
    const currentModule = initialData.courses.find((course) => course.completed < course.lessons);
    const records = initialData.attendance.filter((record) =>
      currentModule.title.endsWith(record.course),
    );

    expect(records.filter((record) => record.status === "Absent")).toHaveLength(1);
    expect(records.find((record) => record.status === "Absent").session).toBe(4);
  });

  it("applies the Module 3 absence to previously saved demo attendance", () => {
    const saved = structuredClone(initialData);
    const missedSession = saved.attendance.find(
      (record) => record.course === "ML, Data Science & Data Visualization" && record.session === 4,
    );
    missedSession.status = "Present";
    localStorage.setItem("campusly-demo-data", JSON.stringify(saved));

    const loaded = loadDemoData();
    const moduleThreeAbsences = loaded.attendance.filter(
      (record) =>
        record.course === "ML, Data Science & Data Visualization" && record.status === "Absent",
    );

    expect(moduleThreeAbsences).toHaveLength(1);
    expect(moduleThreeAbsences[0].session).toBe(4);
  });

  it("updates saved module titles without discarding student progress", () => {
    const saved = structuredClone(initialData);
    saved.courses[8].title = "Module 9: Introduction to Generative AI & Agentic AI";
    saved.courses[8].completed = 4;
    saved.courses[8].progress = 27;
    localStorage.setItem("campusly-demo-data", JSON.stringify(saved));

    const loaded = loadDemoData();

    expect(loaded.courses[8].title).toBe(initialData.courses[8].title);
    expect(loaded.courses[8].completed).toBe(4);
    expect(loaded.courses[8].progress).toBe(27);
  });
});
