import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDateFormatters } from "../src/hooks/useDateFormatters";

describe("useDateFormatters (react-core)", () => {
  it("formats day names using the loaded locale", async () => {
    const { result } = renderHook(() => useDateFormatters());

    await act(async () => {
      await result.current.loadDateFnsConfig("en");
    });
    expect(result.current.getFormattedDay("2026-04-16T12:00:00Z")).toBe(
      "Thursday",
    );

    await act(async () => {
      await result.current.loadDateFnsConfig("sk");
    });
    // Thursday in Slovak is not "Thursday".
    expect(result.current.getFormattedDay("2026-04-16T12:00:00Z")).not.toBe(
      "Thursday",
    );
  });

  it("formats time in a 24h-ish pattern", async () => {
    const { result } = renderHook(() => useDateFormatters());
    await act(async () => {
      await result.current.loadDateFnsConfig("en");
    });
    expect(result.current.getFormattedTime("2026-04-14T14:30:00Z")).toMatch(
      /\d{1,2}:\d{2}/,
    );
  });

  it("returns a localized full date containing the year", async () => {
    const { result } = renderHook(() => useDateFormatters());
    await act(async () => {
      await result.current.loadDateFnsConfig("en");
    });
    expect(
      result.current.getFormattedDayInMonth("2026-04-14T12:00:00Z"),
    ).toContain("2026");
  });
});
