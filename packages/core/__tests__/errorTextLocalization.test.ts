import { describe, it, expect } from "vitest";
import defaultConfig from "../src/defaultConfig";
import rescheduleNotAllowedText from "../src/utils/rescheduleNotAllowedText";
import slotNoLongerAvailableText from "../src/utils/slotNoLongerAvailableText";

describe("error text localization", () => {
  // defaultConfig is deep-merged into every runtime config. If it carried an
  // English value for these keys, the preset-based fallback below could never
  // fire and cs/sk/pl visitors would always see English.
  it("defaultConfig does not shadow the localized fallbacks", () => {
    expect(
      defaultConfig.locale?.confirmationForm?.rescheduleNotAllowed,
    ).toBeUndefined();
    expect(
      defaultConfig.locale?.confirmationForm?.slotNoLongerAvailable,
    ).toBeUndefined();
  });

  it("falls back to the preset language", () => {
    expect(rescheduleNotAllowedText({ preset: "cs" })).toContain("nelze");
    expect(rescheduleNotAllowedText({ preset: "sk" })).toContain("nie je");
    expect(rescheduleNotAllowedText({ preset: "pl" })).toContain("nie można");
    expect(slotNoLongerAvailableText({ preset: "cs" })).toContain("dostupný");
  });

  it("prefers an explicit text served by the API", () => {
    expect(
      rescheduleNotAllowedText({
        preset: "cs",
        confirmationForm: { rescheduleNotAllowed: "Custom text" },
      }),
    ).toBe("Custom text");
  });

  it("falls back to English for unknown presets", () => {
    expect(rescheduleNotAllowedText({ preset: "de" })).toContain(
      "no longer be rescheduled",
    );
    expect(rescheduleNotAllowedText(undefined)).toContain(
      "no longer be rescheduled",
    );
  });
});
