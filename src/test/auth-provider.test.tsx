import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("AuthProvider", () => {
  it("lets local development continue without Supabase configuration", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    const { AuthProvider, useCloudAuth } = await import("@/components/auth-provider");

    function AuthStatus() {
      const { ready, configured } = useCloudAuth();
      return createElement("p", null, ready && !configured ? "preview ready" : "loading");
    }

    render(createElement(AuthProvider, null, createElement(AuthStatus)));

    expect(await screen.findByText("preview ready")).toBeInTheDocument();
  });
});
