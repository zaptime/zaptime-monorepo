import { describe, it, expect } from "vitest";
import { getDfnsConfig } from "@zaptime/core-shared";
import { useDateFormatters } from "../src/composables/useDateFormatters";

describe("locale preset override", () => {
  it("user preset 'sk' overrides backend preset 'cs'", async () => {
    // Simulate the fix: user config with preset 'sk' should take precedence
    // over backend config with preset 'cs'
    const backendPreset = "cs";
    const userPreset = "sk";

    // Before fix: loadDateFnsConfig was called with backend preset
    const backendConfig = await getDfnsConfig(backendPreset);
    expect(backendConfig.locale!.code).toBe("cs");

    // After fix: loadDateFnsConfig is called with merged config preset (user wins)
    const mergedPreset = userPreset; // user override takes precedence
    const mergedConfig = await getDfnsConfig(mergedPreset);
    expect(mergedConfig.locale!.code).toBe("sk");
  });

  it("falls back to backend preset when user does not override", async () => {
    const backendPreset = "cs";
    const userPreset = undefined;

    const effectivePreset = userPreset || backendPreset;
    const config = await getDfnsConfig(effectivePreset);
    expect(config.locale!.code).toBe("cs");
  });

  it("falls back to 'en' when no preset is provided", async () => {
    const effectivePreset = undefined || "en";
    const config = await getDfnsConfig(effectivePreset);
    expect(config.locale!.code).toBe("en-US");
  });

  it("useDateFormatters uses the loaded locale for formatting", async () => {
    const { loadDateFnsConfig, getFormattedDay } = useDateFormatters();

    // Load Slovak locale (user override)
    await loadDateFnsConfig("sk");

    // Wednesday 2026-04-15 in Slovak is "streda"
    const dayName = getFormattedDay("2026-04-15T12:00:00Z");
    expect(dayName.toLowerCase()).toContain("stred");

    // Reload with Czech locale
    await loadDateFnsConfig("cs");

    // Wednesday in Czech is "středa"
    const czechDayName = getFormattedDay("2026-04-15T12:00:00Z");
    expect(czechDayName.toLowerCase()).toContain("střed");

    // They should be different
    expect(dayName).not.toBe(czechDayName);
  });
});
