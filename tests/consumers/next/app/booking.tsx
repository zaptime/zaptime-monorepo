"use client";
import { ZaptimeCalendar } from "@zaptime/react";
import { createCalendar } from "@zaptime/core";
import "@zaptime/react/style.css";
export function Booking() {
  return <ZaptimeCalendar config={{ token: "fixture-token" }} />;
}
export const inertServerInstance = () => createCalendar({ config: { token: "fixture-token" } });
