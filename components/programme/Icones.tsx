// Icônes au trait (aucun émoji). Héritent la couleur du texte (currentColor).
type P = { className?: string };

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export const IcEclair = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
);

export const IcDiplome = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m2 9 10-5 10 5-10 5L2 9Z" />
    <path d="M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5" />
    <path d="M22 9v6" />
  </svg>
);

export const IcCouronne = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8Z" />
    <path d="M5 19h14" />
  </svg>
);

export const IcTrophee = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M8 4h8v6a4 4 0 0 1-8 0V4Z" />
    <path d="M8 6H5v1.5A3.5 3.5 0 0 0 8.5 11M16 6h3v1.5A3.5 3.5 0 0 1 15.5 11" />
    <path d="M12 14v4M8.5 21h7M10 18h4" />
  </svg>
);

export const IcBalle = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M5.5 6.5C8 8 8 16 5.5 17.5M18.5 6.5C16 8 16 16 18.5 17.5" />
  </svg>
);

export const IcMenu = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IcFermer = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const IcChevron = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IcFleche = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

export const IcCourriel = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const IcInstagram = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
  </svg>
);

export const IcFacebook = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5H14Z" />
  </svg>
);
