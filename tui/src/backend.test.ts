import { describe, expect, it } from "vitest";

import { backendCommand } from "@/backend.ts";

describe("backendCommand", () => {
  it("runs the Ruby backend script directly", () => {
    expect(backendCommand("/tmp/bin/autodidact")).toEqual([
      "ruby",
      "/tmp/bin/autodidact",
    ]);
  });
});
