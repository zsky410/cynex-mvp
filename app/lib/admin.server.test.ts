import { RouterContextProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { adminHeaders, validateRequestOrigin } from "./admin.server";
import { runtimeEnvContext } from "./runtime-context";

function context() {
  const provider = new RouterContextProvider();
  provider.set(runtimeEnvContext, {
    APP_ENV: "local",
    APP_ORIGIN: "http://127.0.0.1:5173",
    SUPABASE_URL: "http://127.0.0.1:55321",
    SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
  } as Env & {
    APP_ENV: string;
    APP_ORIGIN: string;
    SUPABASE_URL: string;
    SUPABASE_PUBLISHABLE_KEY: string;
  });
  return provider;
}

describe("Admin response security", () => {
  it("sets private cache and crawler-denial headers", () => {
    const headers = adminHeaders({ "Set-Cookie": "session=updated" });
    expect(headers.get("Cache-Control")).toBe("private, no-store");
    expect(headers.get("X-Robots-Tag")).toBe("noindex, nofollow, noarchive");
    expect(headers.get("Set-Cookie")).toBe("session=updated");
  });

  it("accepts only the configured request origin", () => {
    expect(() =>
      validateRequestOrigin(
        new Request("http://127.0.0.1:5173/admin/logout", {
          method: "POST",
          headers: { Origin: "http://127.0.0.1:5173" },
        }),
        context(),
      ),
    ).not.toThrow();
  });

  it.each([undefined, "https://attacker.example", "not-a-url"])(
    "rejects a missing or invalid Origin: %s",
    (origin) => {
      const headers = origin ? { Origin: origin } : undefined;
      expect(() =>
        validateRequestOrigin(
          new Request("http://127.0.0.1:5173/admin/logout", {
            method: "POST",
            headers,
          }),
          context(),
        ),
      ).toThrow();
    },
  );
});
