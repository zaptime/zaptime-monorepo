import type { ReactNode } from "react";
import "@zaptime/react/style.css";
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
