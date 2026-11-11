import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import HubDashboard from "@/campusly/HubDashboard";

afterEach(() => {
  vi.useRealTimers();
});

describe("dashboard schedule navigation", () => {
  it("continues into the following week instead of stopping on Friday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 30));

    const timetable = [
      { day: "Mon", date: "26 Oct", dateKey: "2026-10-26", classes: [] },
      { day: "Tue", date: "27 Oct", dateKey: "2026-10-27", classes: [] },
      { day: "Wed", date: "28 Oct", dateKey: "2026-10-28", classes: [] },
      { day: "Thu", date: "29 Oct", dateKey: "2026-10-29", classes: [] },
      {
        day: "Fri",
        date: "30 Oct",
        dateKey: "2026-10-30",
        classes: [{ title: "Friday class", time: "10:00 AM", room: "Lab 1" }],
      },
      {
        day: "Mon",
        date: "2 Nov",
        dateKey: "2026-11-02",
        classes: [{ title: "Next week class", time: "10:00 AM", room: "Lab 2" }],
      },
      { day: "Tue", date: "3 Nov", dateKey: "2026-11-03", classes: [] },
      { day: "Wed", date: "4 Nov", dateKey: "2026-11-04", classes: [] },
      { day: "Thu", date: "5 Nov", dateKey: "2026-11-05", classes: [] },
      { day: "Fri", date: "6 Nov", dateKey: "2026-11-06", classes: [] },
    ];

    render(
      <HubDashboard
        data={{ timetable, attendance: [], marks: [], assignments: [] }}
        setPage={vi.fn()}
      />,
    );

    expect(screen.getByText("Fri, 30 Oct")).toBeInTheDocument();
    const nextDayButton = screen.getByRole("button", { name: "Next day" });
    expect(nextDayButton).toBeEnabled();
    fireEvent.click(nextDayButton);
    expect(screen.getByText("Mon, 2 Nov")).toBeInTheDocument();
    expect(screen.getByText("Next week class")).toBeInTheDocument();
  });

  it("offers next-week dates from the current demo week", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 6));

    render(
      <HubDashboard
        data={{
          timetable: [
            {
              day: "Fri",
              date: "6 Nov",
              dateKey: "2026-11-06",
              classes: [{ title: "Current week class", time: "10:00 AM", room: "Lab 1" }],
            },
            {
              day: "Mon",
              date: "9 Nov",
              dateKey: "2026-11-09",
              classes: [{ title: "Following week class", time: "10:00 AM", room: "Lab 2" }],
            },
          ],
          attendance: [],
          marks: [],
          assignments: [],
        }}
        setPage={vi.fn()}
      />,
    );

    expect(screen.getByText("Fri, 6 Nov")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next day" }));
    expect(screen.getByText("Mon, 9 Nov")).toBeInTheDocument();
    expect(screen.getByText("Following week class")).toBeInTheDocument();
  });

  it("moves between scheduled days and returns to today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 5));

    render(
      <HubDashboard
        data={{
          timetable: [
            {
              day: "Mon",
              date: "2",
              classes: [{ title: "Monday class", time: "10:00 AM", room: "Lab 1" }],
            },
            { day: "Tue", date: "3", classes: [] },
            {
              day: "Wed",
              date: "4",
              classes: [{ title: "Wednesday class", time: "10:00 AM", room: "Lab 2" }],
            },
            {
              day: "Thu",
              date: "5",
              classes: [{ title: "Thursday class", time: "10:00 AM", room: "Lab 3" }],
            },
            {
              day: "Fri",
              date: "6",
              classes: [{ title: "Friday class", time: "10:00 AM", room: "Lab 4" }],
            },
          ],
          attendance: [],
          marks: [],
          assignments: [],
        }}
        setPage={vi.fn()}
      />,
    );

    expect(screen.getByText("Thu, 5")).toBeInTheDocument();
    expect(screen.getByText("Thursday class")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
    expect(screen.getByText("Wed, 4")).toBeInTheDocument();
    expect(screen.getByText("Wednesday class")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
    expect(screen.getByText("Tue, 3")).toBeInTheDocument();
    expect(screen.getByText("No classes scheduled.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next day" }));
    fireEvent.click(screen.getByRole("button", { name: "Today" }));
    expect(screen.getByText("Thu, 5")).toBeInTheDocument();
  });
});

describe("dashboard attendance", () => {
  it("shows current-module attendance and opens the attendance report", () => {
    const setPage = vi.fn();
    render(
      <HubDashboard
        data={{
          timetable: [],
          courses: [
            { title: "Module 1: Completed", completed: 2, lessons: 2 },
            { title: "Module 2: Current", completed: 1, lessons: 3 },
          ],
          attendance: [
            { date: "02 Jan 2027", course: "Completed", status: "Present" },
            { date: "01 Jan 2027", course: "Current", status: "Present" },
            { date: "02 Jan 2027", course: "Current", status: "Absent" },
          ],
          marks: [],
          assignments: [],
        }}
        setPage={setPage}
      />,
    );

    expect(screen.queryByText(/study streak/i)).not.toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText("1/2 classes attended")).toBeInTheDocument();
    expect(
      screen.queryByText("No attendance recorded for this module yet."),
    ).not.toBeInTheDocument();
    const chart = screen.getByRole("slider", { name: /Attendance by class/ });
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveAttribute("aria-valuetext", expect.stringContaining("02 Jan 2027: Absent"));
    fireEvent.keyDown(chart, { key: "ArrowLeft" });
    expect(chart).toHaveAttribute(
      "aria-valuetext",
      expect.stringContaining("01 Jan 2027: Present"),
    );
    vi.spyOn(chart, "getBoundingClientRect").mockReturnValue({
      left: 10,
      width: 300,
    } as DOMRect);
    const pointer = (type: string, clientX: number) => {
      const event = new Event(type, { bubbles: true });
      Object.defineProperties(event, {
        clientX: { value: clientX },
        pointerId: { value: 1 },
      });
      fireEvent(chart, event);
    };
    pointer("pointerdown", 290);
    expect(chart).toHaveAttribute("aria-valuetext", expect.stringContaining("02 Jan 2027: Absent"));
    pointer("pointermove", 25);
    expect(chart).toHaveAttribute(
      "aria-valuetext",
      expect.stringContaining("01 Jan 2027: Present"),
    );

    fireEvent.click(screen.getByRole("link", { name: "Open attendance report" }));
    expect(setPage).toHaveBeenCalledWith("attendance");
  });

  it("shows an explicit empty state when the current module has no attendance", () => {
    render(
      <HubDashboard
        data={{
          timetable: [],
          courses: [{ title: "Module 1: Current", completed: 0, lessons: 10 }],
          attendance: [],
          marks: [],
          assignments: [],
        }}
        setPage={vi.fn()}
      />,
    );

    expect(screen.getByText("No attendance recorded for this module yet.")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("dashboard notifications", () => {
  it("shows recent notifications and opens the full notifications page", () => {
    const setPage = vi.fn();
    render(
      <HubDashboard
        data={{
          timetable: [],
          courses: [],
          attendance: [],
          marks: [],
          assignments: [],
          notifications: [
            {
              id: 1,
              title: "New marks published",
              message: "Your Module 2 mark is available.",
              time: "2 hours ago",
              read: false,
            },
            {
              id: 2,
              title: "Module 3 started",
              message: "Your next module has begun.",
              time: "Yesterday",
              read: true,
            },
          ],
        }}
        setPage={setPage}
      />,
    );

    expect(screen.getByText("1 unread")).toBeInTheDocument();
    expect(screen.getByText("New marks published")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /New marks published/ }));
    expect(setPage).toHaveBeenCalledWith("notifications");
  });

  it("shows an empty state when there are no notifications", () => {
    render(
      <HubDashboard
        data={{
          timetable: [],
          courses: [],
          attendance: [],
          marks: [],
          assignments: [],
          notifications: [],
        }}
        setPage={vi.fn()}
      />,
    );

    expect(screen.getByText("No notifications yet.")).toBeInTheDocument();
  });
});
