
import * as React from "react";

export function Logo() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <rect width="64" height="64" rx="12" fill="currentColor" fillOpacity="0.1" />
      <path
        d="M24 20H40C42.2091 20 44 21.7909 44 24V40C44 42.2091 42.2091 44 40 44H24C21.7909 44 20 42.2091 20 40V24C20 21.7909 21.7909 20 24 20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.3"
      />
      <path
        d="M26 29H38"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29 35H35"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
       <path
        d="M32 20V16"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinecap="round"
       />
       <path
        d="M36 18L38 16"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinecap="round"
       />
       <path
        d="M28 18L26 16"
        stroke="hsl(var(--accent))"
        strokeWidth="2"
        strokeLinecap="round"
       />
    </svg>
  );
}
