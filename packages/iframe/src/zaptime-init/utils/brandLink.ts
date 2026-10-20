/**
 * Visible "Powered by Zaptime" attribution on the host page for inline
 * calendars of free accounts. The attribution rendered inside the iframe
 * belongs to the iframe document, so the embedding site never shows it as
 * its own link.
 */

import { fetchAccountStatus } from "./accountStatus";

export const BRAND_LINK_ATTRIBUTE = "data-zaptime-brand-link";

interface BrandLinkConfig {
  token?: unknown;
  locale?: { preset?: string };
}

function resolveContainer(container: HTMLElement | string): HTMLElement | null {
  return typeof container === "string"
    ? document.querySelector<HTMLElement>(container)
    : container;
}

function createBrandLink(config: BrandLinkConfig): HTMLElement {
  const isCzech = config.locale?.preset === "cs";

  const wrapper = document.createElement("p");
  wrapper.setAttribute(BRAND_LINK_ATTRIBUTE, "");
  wrapper.style.cssText =
    "margin:8px 0 0;font:500 12px/1.5 system-ui,-apple-system,sans-serif;text-align:center;opacity:0.75;";
  wrapper.append(isCzech ? "Vytvořeno službou " : "Powered by ");

  const link = document.createElement("a");
  link.href = isCzech ? "https://zaptime.cz/" : "https://zaptime.app/";
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "Zaptime";
  link.style.color = "inherit";
  wrapper.append(link);

  return wrapper;
}

/**
 * Insert the attribution right after the calendar container when the account
 * is on the free plan. Resolves to true when the attribution is on the page.
 */
export async function attachBrandLink(
  container: HTMLElement | string,
  config: BrandLinkConfig,
): Promise<boolean> {
  const element = resolveContainer(container);
  if (!element || typeof config.token !== "string") {
    return false;
  }

  const status = await fetchAccountStatus(config.token);
  if (!status || status.isSubscribed || status.disabled) {
    return false;
  }

  if (!element.nextElementSibling?.hasAttribute(BRAND_LINK_ATTRIBUTE)) {
    element.insertAdjacentElement("afterend", createBrandLink(config));
  }

  return true;
}
