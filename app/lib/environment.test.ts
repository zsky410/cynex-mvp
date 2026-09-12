import { describe, expect, it } from "vitest";

import { isStagingUrl } from "./environment";

describe("isStagingUrl", () => {
  it.each([
    "https://staging.cynex.site/catalog",
    "https://cynex-mvp-staging.example.workers.dev/",
  ])("identifies staging URL %s", (url) => {
    expect(isStagingUrl(url)).toBe(true);
  });

  it.each([
    "https://cynex.site/",
    "https://cynex-mvp-production.example.workers.dev/",
    "http://localhost:5173/",
  ])("does not identify non-staging URL %s", (url) => {
    expect(isStagingUrl(url)).toBe(false);
  });
});
