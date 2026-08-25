import type { ReactNode } from "react";

// The real layout (html/body, metadata, intl provider) lives in
// app/[locale]/layout.tsx. This passthrough shell only exists so the
// framework-level not-found route has a root layout.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
