import { ReactNode } from "react";

/**
 * Version 1.0.26 did not work without mocking
 */
export default function AutoSizer({
  children,
}: {
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  return children({ width: 800, height: 600 });
}
