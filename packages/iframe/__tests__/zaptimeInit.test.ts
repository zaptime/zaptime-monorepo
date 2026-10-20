import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import { BRAND_LINK_ATTRIBUTE } from "../src/zaptime-init/utils/brandLink";
import { clearAccountStatus } from "../src/zaptime-init/utils/accountStatus";

function createZoidInstance() {
  return {
    render: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
    updateProps: vi.fn().mockResolvedValue(undefined),
  };
}

let zoidInstance = createZoidInstance();
const zoidComponent = vi.fn(() => zoidInstance);

function mockApiResponse(isSubscribed: boolean): void {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: { isSubscribed, disabled: false } }),
  });
}

async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("Zaptime inline render", () => {
  beforeAll(async () => {
    vi.stubGlobal("zoid", { create: vi.fn(() => zoidComponent) });
    await import("../src/zaptime-init/index");
  });

  beforeEach(() => {
    document.body.innerHTML = '<div id="zaptime-container"></div>';
    clearAccountStatus();
    zoidComponent.mockClear();
    zoidInstance = createZoidInstance();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    clearAccountStatus();
  });

  it("returns the original render promise", async () => {
    mockApiResponse(false);
    const rendered = Promise.resolve();
    const originalRender = zoidInstance.render.mockReturnValue(rendered);

    const result = window
      .Zaptime({ config: { token: "free-token" } })
      .render("#zaptime-container");

    expect(result).toBe(rendered);
    expect(originalRender).toHaveBeenCalledWith("#zaptime-container");
  });

  it("shows the host attribution and hides the iframe copy for free accounts", async () => {
    mockApiResponse(false);

    await window
      .Zaptime({ config: { token: "free-token" } })
      .render("#zaptime-container");
    await flushPromises();

    expect(document.querySelectorAll(`[${BRAND_LINK_ATTRIBUTE}]`)).toHaveLength(1);
    expect(zoidInstance.updateProps).toHaveBeenCalledWith({ hostBranding: true });
  });

  it("leaves subscribed accounts untouched", async () => {
    mockApiResponse(true);

    await window
      .Zaptime({ config: { token: "paid-token" } })
      .render("#zaptime-container");
    await flushPromises();

    expect(document.querySelectorAll(`[${BRAND_LINK_ATTRIBUTE}]`)).toHaveLength(0);
    expect(zoidInstance.updateProps).not.toHaveBeenCalled();
  });

  it("keeps the static helpers on the global component", () => {
    expect(typeof window.Zaptime.floatingButton).toBe("function");
    expect(typeof window.Zaptime.inlineButton).toBe("function");
    expect(typeof window.Zaptime.popup).toBe("function");
  });
});
