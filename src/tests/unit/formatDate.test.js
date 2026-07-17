import { describe, expect, it } from "vitest";
import { formatDate } from "@/utils/formatDate";

describe("formatDate", () => {
  it("formatea una fecha ISO incluyendo el año completo", () => {
    const result = formatDate("2026-07-17");

    expect(result).toContain("2026");
  });

  it("produce una salida legible distinta para fechas distintas", () => {
    const first = formatDate("2026-01-05");
    const second = formatDate("2026-12-25");

    expect(first).not.toBe(second);
  });
});
