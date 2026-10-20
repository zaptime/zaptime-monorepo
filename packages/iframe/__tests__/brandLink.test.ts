import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  attachBrandLink,
  BRAND_LINK_ATTRIBUTE,
} from "../src/zaptime-init/utils/brandLink";
import { clearAccountStatus } from "../src/zaptime-init/utils/accountStatus";

/**
 * Mock API response for account status
 */
function mockApiResponse(isSubscribed: boolean, disabled = false): void {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        data: { isSubscribed, disabled },
      }),
  });
}

function brandLinks(): NodeListOf<HTMLElement> {
  return document.querySelectorAll(`[${BRAND_LINK_ATTRIBUTE}]`);
}

describe("attachBrandLink", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="zaptime-container"></div>';
    clearAccountStatus();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    clearAccountStatus();
  });

  it("shows a link to zaptime.app after the container for free accounts", async () => {
    mockApiResponse(false);

    const shown = await attachBrandLink("#zaptime-container", {
      token: "free-token",
    });

    expect(shown).toBe(true);
    const wrapper = document.getElementById("zaptime-container")
      ?.nextElementSibling as HTMLElement;
    expect(wrapper.hasAttribute(BRAND_LINK_ATTRIBUTE)).toBe(true);
    expect(wrapper.textContent).toBe("Powered by Zaptime");
    const link = wrapper.querySelector("a");
    expect(link?.getAttribute("href")).toBe("https://zaptime.app/");
    expect(link?.textContent).toBe("Zaptime");
    expect(link?.getAttribute("rel")).toBe("noopener");
  });

  it("links Czech calendars to zaptime.cz", async () => {
    mockApiResponse(false);

    await attachBrandLink("#zaptime-container", {
      token: "free-token",
      locale: { preset: "cs" },
    });

    const wrapper = brandLinks()[0];
    expect(wrapper.textContent).toBe("Vytvořeno službou Zaptime");
    expect(wrapper.querySelector("a")?.getAttribute("href")).toBe(
      "https://zaptime.cz/",
    );
  });

  it("accepts a container element", async () => {
    mockApiResponse(false);
    const container = document.getElementById("zaptime-container")!;

    await attachBrandLink(container, { token: "free-token" });

    expect(container.nextElementSibling?.hasAttribute(BRAND_LINK_ATTRIBUTE)).toBe(
      true,
    );
  });

  it("does not add a link for subscribed accounts", async () => {
    mockApiResponse(true);

    const shown = await attachBrandLink("#zaptime-container", {
      token: "paid-token",
    });

    expect(shown).toBe(false);
    expect(brandLinks()).toHaveLength(0);
  });

  it("does not add a link for disabled event types", async () => {
    mockApiResponse(false, true);

    const shown = await attachBrandLink("#zaptime-container", {
      token: "disabled-token",
    });

    expect(shown).toBe(false);
    expect(brandLinks()).toHaveLength(0);
  });

  it("does not add a link when the account status is unknown", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const shown = await attachBrandLink("#zaptime-container", {
      token: "unknown-token",
    });

    expect(shown).toBe(false);
    expect(brandLinks()).toHaveLength(0);
  });

  it("does not add a link without a token or container", async () => {
    mockApiResponse(false);

    expect(await attachBrandLink("#zaptime-container", {})).toBe(false);
    expect(await attachBrandLink("#missing", { token: "free-token" })).toBe(
      false,
    );
    expect(brandLinks()).toHaveLength(0);
  });

  it("adds the link only once when rendered again", async () => {
    mockApiResponse(false);

    await attachBrandLink("#zaptime-container", { token: "free-token" });
    const shown = await attachBrandLink("#zaptime-container", {
      token: "free-token",
    });

    expect(shown).toBe(true);
    expect(brandLinks()).toHaveLength(1);
  });
});
