import type ZaptimeLocale from "../types/ZaptimeLocale";

const fallbacks: Record<string, string> = {
  en: "This time slot is no longer available. Please go back and pick another time.",
  cs: "Tento termín již bohužel není dostupný. Vraťte se prosím zpět a vyberte jiný čas.",
  sk: "Tento termín už bohužiaľ nie je dostupný. Vráťte sa prosím späť a vyberte iný čas.",
  pl: "Ten termin nie jest już dostępny. Wróć i wybierz inny czas.",
};

/**
 * Message shown when booking fails with 409 (slot no longer available).
 * Prefers the text served by the API (already translated per event type);
 * falls back to a built-in translation matching the locale preset for
 * configurations created before the key existed.
 */
export default function slotNoLongerAvailableText(
  locale?: ZaptimeLocale,
): string {
  return (
    locale?.confirmationForm?.slotNoLongerAvailable ??
    fallbacks[locale?.preset ?? "en"] ??
    fallbacks.en
  );
}
