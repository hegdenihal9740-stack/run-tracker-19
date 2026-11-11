import { describe, expect, it } from "vitest";

import { createId } from "@/campusly/createId";

describe("createId", () => {
  it("creates a UUID-shaped identifier", () => {
    expect(createId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("creates unique identifiers for separate calls", () => {
    expect(createId()).not.toBe(createId());
  });
});
