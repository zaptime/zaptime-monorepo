import type ZaptimeLocale from "../types/ZaptimeLocale";

const fallbacks: Record<string, string> = {
  en: "This booking can no longer be rescheduled. Please contact the organizer directly.",
  cs: "Termín této rezervace již bohužel nelze změnit. Kontaktujte prosím přímo organizátora.",
  pl: "Terminu tej rezerwacji nie można już zmienić. Skontaktuj się bezpośrednio z organizatorem.",
};

/**
 * Message shown when rescheduling fails with 403 (notice period violated,
 * reservation already started, or rescheduling disabled). Prefers the text
 * served by the API (already translated per event type); falls back to a
 * built-in translation matching the locale preset for configurations
 * created before the key existed.
 */
export default function rescheduleNotAllowedText(locale?: ZaptimeLocale): string {
  return locale?.confirmationForm?.rescheduleNotAllowed ?? fallbacks[locale?.preset ?? "en"] ?? fallbacks.en;
}
