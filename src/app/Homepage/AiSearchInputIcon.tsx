import * as React from 'react';

/**
 * Line-art “AI search” glyph: magnifying glass with a gap and a small sparkle in the opening.
 * Uses {@code currentColor} so parents can set {@code --pf-t--global--icon--color--default} or {@code color}.
 */
export const AiSearchInputIcon: React.FunctionComponent<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    focusable="false"
    {...props}
  >
    {/* Handle */}
    <path
      d="M10.35 10.35L13.25 13.25"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Lens ring with gap (stroke-dash + rotation places opening toward upper-left) */}
    <circle
      cx={7}
      cy={7}
      r={4.5}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      pathLength={100}
      strokeDasharray="68 32"
      transform="rotate(-138 7 7)"
    />
    {/* Four-point sparkle in the gap */}
    <path
      fill="currentColor"
      d="M4.15 3.35l.34 1.02 1.02.34-1.02.34-.34 1.02-.34-1.02-1.02-.34 1.02-.34.34-1.02z"
    />
  </svg>
);
