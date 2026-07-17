import { describe, expect, it } from "vitest";
import { isSameDay, isSameMonth, sumByMonth } from "#utils/monthly.js";

describe("sumByMonth", () => {
  it("agrupa y suma valores por mes del año indicado", () => {
    const records = [
      { fecha: new Date(2026, 0, 5), total: 100 },
      { fecha: new Date(2026, 0, 20), total: 50 },
      { fecha: new Date(2026, 2, 1), total: 30 },
    ];

    const sums = sumByMonth(records, (r) => r.fecha, (r) => r.total, 2026);

    expect(sums[0]).toBe(150);
    expect(sums[2]).toBe(30);
    expect(sums[1]).toBe(0);
  });

  it("ignora registros de años distintos al solicitado", () => {
    const records = [
      { fecha: new Date(2025, 0, 5), total: 999 },
      { fecha: new Date(2026, 0, 5), total: 10 },
    ];

    const sums = sumByMonth(records, (r) => r.fecha, (r) => r.total, 2026);

    expect(sums[0]).toBe(10);
  });
});

describe("isSameMonth / isSameDay", () => {
  it("isSameMonth es verdadero para fechas del mismo mes y año", () => {
    expect(isSameMonth(new Date(2026, 5, 1), new Date(2026, 5, 28))).toBe(true);
  });

  it("isSameMonth es falso para meses distintos", () => {
    expect(isSameMonth(new Date(2026, 4, 1), new Date(2026, 5, 1))).toBe(false);
  });

  it("isSameDay es verdadero solo para el mismo día exacto", () => {
    expect(isSameDay(new Date(2026, 5, 10), new Date(2026, 5, 10))).toBe(true);
    expect(isSameDay(new Date(2026, 5, 10), new Date(2026, 5, 11))).toBe(false);
  });
});
