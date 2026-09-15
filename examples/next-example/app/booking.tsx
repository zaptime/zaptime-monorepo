"use client";
import { ZaptimeCalendar } from "@zaptime/react";
export function Booking() {
  return <ZaptimeCalendar config={{ token: "fixture-token", apiBaseUrl: "https://booking.example.test/", locale: { preset: "en" } }} />;
}
