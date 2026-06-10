import { describe, it, expect } from "vitest";
import { mergeObjects } from "../src/index";

describe("mergeObjects", () => {
  it("overrides primitive values from the source object", () => {
    const target = { a: 1, b: 2 };
    const result = mergeObjects(target, { b: 3 });
    expect(result.b).toBe(3);
    expect(result.a).toBe(1);
  });

  it("adds keys that only exist on the source object", () => {
    const result = mergeObjects({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("recursively merges nested objects", () => {
    const target = { theme: { preset: "basic", borderRadius: "0.375rem" } };
    const result = mergeObjects(target, { theme: { borderRadius: "full" } });
    expect(result.theme.preset).toBe("basic");
    expect(result.theme.borderRadius).toBe("full");
  });

  it("deeply merges multiple levels", () => {
    const target = { locale: { texts: { pickTime: "Pick a time" } } };
    const result = mergeObjects(target, {
      locale: { texts: { pickTime: "Choose", showNextMonth: "Next" } },
    });
    expect(result.locale.texts.pickTime).toBe("Choose");
    expect(result.locale.texts.showNextMonth).toBe("Next");
  });
});
