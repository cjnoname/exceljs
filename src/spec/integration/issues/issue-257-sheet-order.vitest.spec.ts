import { describe, it, expect } from "vitest";
import { Workbook } from "../../../index.js";

describe("github issues", () => {
  it("issue 257 - worksheet order is not respected", () => {
    const wb = new Workbook();
    return wb.xlsx.readFile("./spec/integration/data/test-issue-257.xlsx").then(() => {
      expect(wb.worksheets.map(ws => ws.name)).toEqual(["First", "Second"]);
    });
  });
});
