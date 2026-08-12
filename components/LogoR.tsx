const CHAMPAGNE = "#E8B93F";

export function LogoR({ h = 96 }: { h?: number }) {
  return (
    <svg width={h} height={h * 1.18} viewBox="0 0 100 118" aria-label="Royal On Field">
      <path
        d="M24 34 L31 13 L42 27 L50 7 L58 27 L69 13 L76 34"
        fill="none"
        stroke={CHAMPAGNE}
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="36" cy="33" r="2.6" fill={CHAMPAGNE} />
      <circle cx="50" cy="30" r="2.6" fill={CHAMPAGNE} />
      <circle cx="64" cy="33" r="2.6" fill={CHAMPAGNE} />
      <text
        x="50"
        y="103"
        textAnchor="middle"
        fontSize="80"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight="800"
        fill="#7FC4EC"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        paintOrder="stroke"
      >
        R
      </text>
    </svg>
  );
}
