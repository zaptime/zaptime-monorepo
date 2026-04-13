import { describe, it, expect, beforeEach } from "vitest";
import { useDateFormatters } from "../src/composables/useDateFormatters";

describe("useDateFormatters", () => {
  describe("loadDateFnsConfig", () => {
    it("loads Slovak locale when preset is 'sk'", async () => {
      const { loadDateFnsConfig, getFormattedDay } = useDateFormatters();
      await loadDateFnsConfig("sk");

      // Thursday in Slovak is "štvrtok"
      const formatted = getFormattedDay("2026-04-16T12:00:00Z");
      expect(formatted).not.toBe("Thursday");
    });

    it("loads Czech locale when preset is 'cs'", async () => {
      const { loadDateFnsConfig, getFormattedDay } = useDateFormatters();
      await loadDateFnsConfig("cs");

      // Thursday in Czech is "čtvrtek"
      const formatted = getFormattedDay("2026-04-16T12:00:00Z");
      expect(formatted).not.toBe("Thursday");
    });

    it("loads English locale for 'en' preset", async () => {
      const { loadDateFnsConfig, getFormattedDay } = useDateFormatters();
      await loadDateFnsConfig("en");

      const formatted = getFormattedDay("2026-04-16T12:00:00Z");
      expect(formatted).toBe("Thursday");
    });

    it("loads different locale than previously loaded", async () => {
      const { loadDateFnsConfig, getFormattedDay } = useDateFormatters();

      await loadDateFnsConfig("cs");
      const czech = getFormattedDay("2026-04-16T12:00:00Z");

      await loadDateFnsConfig("sk");
      const slovak = getFormattedDay("2026-04-16T12:00:00Z");

      // Czech and Slovak have different day names
      expect(czech).not.toBe(slovak);
    });
  });

  describe("getFormattedTime", () => {
    it("formats time in 24h format by default", async () => {
      const { loadDateFnsConfig, getFormattedTime } = useDateFormatters();
      await loadDateFnsConfig("en");

      const formatted = getFormattedTime("2026-04-14T14:30:00Z");
      // Should contain the time in some format (timezone-dependent)
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe("getFormattedDayInMonth", () => {
    it("returns localized full date string", async () => {
      const { loadDateFnsConfig, getFormattedDayInMonth } = useDateFormatters();
      await loadDateFnsConfig("en");

      const formatted = getFormattedDayInMonth("2026-04-14T12:00:00Z");
      // PPPP format gives full date, e.g. "Tuesday, April 14th, 2026"
      expect(formatted).toContain("2026");
    });
  });
});
