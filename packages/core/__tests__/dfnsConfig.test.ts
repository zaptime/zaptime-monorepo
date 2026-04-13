import { describe, it, expect } from "vitest";
import { getDfnsConfig } from "../src/utils/dfnsConfig";

describe("getDfnsConfig", () => {
  it("returns Slovak locale for 'sk' preset", async () => {
    const config = await getDfnsConfig("sk");
    expect(config.locale).toBeDefined();
    expect(config.locale!.code).toBe("sk");
  });

  it("returns Czech locale for 'cs' preset", async () => {
    const config = await getDfnsConfig("cs");
    expect(config.locale).toBeDefined();
    expect(config.locale!.code).toBe("cs");
  });

  it("returns English locale for unknown preset", async () => {
    const config = await getDfnsConfig("unknown-locale");
    expect(config.locale).toBeDefined();
    expect(config.locale!.code).toBe("en-US");
  });

  it("returns English locale when locale is undefined", async () => {
    const config = await getDfnsConfig(undefined as unknown as string);
    expect(config.locale).toBeDefined();
    expect(config.locale!.code).toBe("en-US");
  });

  it("returns correct locale for each supported preset", async () => {
    const presets = [
      { preset: "pl", code: "pl" },
      { preset: "de", code: "de" },
      { preset: "pt", code: "pt" },
      { preset: "es", code: "es" },
      { preset: "ja", code: "ja" },
      { preset: "tr", code: "tr" },
      { preset: "sv", code: "sv" },
      { preset: "nl", code: "nl" },
      { preset: "it", code: "it" },
      { preset: "fi", code: "fi" },
      { preset: "ro", code: "ro" },
      { preset: "ko", code: "ko" },
      { preset: "vi", code: "vi" },
    ];

    for (const { preset, code } of presets) {
      const config = await getDfnsConfig(preset);
      expect(config.locale!.code, `preset '${preset}' should load locale '${code}'`).toBe(code);
    }
  });

  it("returns zh-CN locale for 'zh' preset", async () => {
    const config = await getDfnsConfig("zh");
    expect(config.locale).toBeDefined();
    expect(config.locale!.code).toBe("zh-CN");
  });
});
