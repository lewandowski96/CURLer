export default function AppIcon({ size = 24 }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      width={size} 
      height={size}
    >
      <defs>
        <filter id="subtle-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.4"/>
        </filter>
        <linearGradient id="squircle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#26233a" />
          <stop offset="100%" stop-color="#191724" />
        </linearGradient>
        <linearGradient id="accent-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#9ccfd8" />
          <stop offset="100%" stop-color="#31748f" />
        </linearGradient>
      </defs>

      <rect x="32" y="32" width="448" height="448" rx="112" fill="url(#squircle-grad)" stroke="#403d52" stroke-width="6" />

      <g filter="url(#subtle-shadow)">
        <path d="M 340 180 C 240 100, 140 180, 140 256 C 140 332, 240 412, 340 332" fill="none" stroke="#ebbcba" stroke-width="32" stroke-linecap="round" />
        <circle cx="340" cy="332" r="20" fill="#c4a7e7" />
        <path d="M 290 130 L 210 260 L 270 260 L 190 390" fill="none" stroke="url(#accent-grad)" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </svg>
  );
}
