import { describe, it, expect } from "vitest";
import { Workbook } from "../../../index.js";

describe("github issues", () => {
  it("issue 176 - Unexpected xml node in parseOpen", () => {
    const wb = new Workbook();
    return wb.xlsx.readFile("./spec/integration/data/test-issue-176.xlsx").then(() => {
      // arriving here is success
      expect(true).toBe(true);
    });
  });
});
