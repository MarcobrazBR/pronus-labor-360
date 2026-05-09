import type { SVGProps } from "react";

export type ModuleIconName = "dashboard" | "companies" | "settings" | "risk";

export function ModuleIcon({
  name,
  className = "h-4 w-4",
}: Readonly<{ name: ModuleIconName; className?: string }>) {
  const props: SVGProps<SVGSVGElement> = {
    "aria-hidden": true,
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  };

  if (name === "companies") {
    return (
      <svg {...props}>
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9h1" />
        <path d="M9 13h1" />
        <path d="M9 17h1" />
        <path d="M16 13h1" />
        <path d="M16 17h1" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg {...props}>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.94a1.7 1.7 0 0 0-.34-1.88l-.06-.06A2 2 0 1 1 7.03 4.2l.06.06A1.7 1.7 0 0 0 8.97 4.6 1.7 1.7 0 0 0 10 3.04V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06A2 2 0 1 1 19.8 7.08l-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.96 10H21a2 2 0 0 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
      </svg>
    );
  }

  if (name === "risk") {
    return (
      <svg {...props}>
        <path d="M12 3 2.8 19a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L12 3Z" />
        <path d="M12 9v5" />
        <path d="M12 18h.01" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M4 13h6V4H4v9Z" />
      <path d="M14 20h6V4h-6v16Z" />
      <path d="M4 20h6v-3H4v3Z" />
    </svg>
  );
}
