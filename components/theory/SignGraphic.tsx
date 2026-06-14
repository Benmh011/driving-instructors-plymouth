import type { SignId } from "@/lib/theory/questions";

// Standard sign colours — kept authentic (not themed) so signs are recognisable.
const RED = "#cc1326";
const BLUE = "#0b57a4";
const BLACK = "#1a1a1a";
const WHITE = "#ffffff";

function SpeedLimit({ n }: { n: string }) {
  return (
    <>
      <circle cx="50" cy="50" r="46" fill={WHITE} stroke={RED} strokeWidth="11" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="42"
        fontWeight="700"
        fill={BLACK}
        fontFamily="Arial, sans-serif"
      >
        {n}
      </text>
    </>
  );
}

function Triangle({ down = false, children }: { down?: boolean; children?: React.ReactNode }) {
  const points = down ? "50,88 12,20 88,20" : "50,12 12,84 88,84";
  return (
    <>
      <polygon
        points={points}
        fill={WHITE}
        stroke={RED}
        strokeWidth="9"
        strokeLinejoin="round"
      />
      {children}
    </>
  );
}

function BlueCircle({ children }: { children: React.ReactNode }) {
  return (
    <>
      <circle cx="50" cy="50" r="46" fill={BLUE} />
      {children}
    </>
  );
}

// Front-facing car silhouette (~30 wide) for the no-overtaking sign.
function Car({ color }: { color: string }) {
  return (
    <g>
      <path
        d="M2,27 L2,18 C2,15 4,14 6,13 C7,5 12,4 16,4 C20,4 25,5 26,13 C28,14 30,15 30,18 L30,27 Z"
        fill={color}
      />
      <path d="M9,13 C10,7.5 13,7 16,7 C19,7 22,7.5 23,13 Z" fill={WHITE} />
      <rect x="4" y="26.5" width="7" height="4" rx="1.6" fill={color} />
      <rect x="21" y="26.5" width="7" height="4" rx="1.6" fill={color} />
    </g>
  );
}

const SIGNS: Record<SignId, React.ReactNode> = {
  "speed-20": <SpeedLimit n="20" />,
  "speed-30": <SpeedLimit n="30" />,
  "speed-40": <SpeedLimit n="40" />,
  "speed-50": <SpeedLimit n="50" />,
  "speed-60": <SpeedLimit n="60" />,
  "speed-70": <SpeedLimit n="70" />,
  nsl: (
    <>
      <circle cx="50" cy="50" r="44" fill={WHITE} stroke={BLACK} strokeWidth="4" />
      <line x1="24" y1="76" x2="76" y2="24" stroke={BLACK} strokeWidth="8" />
    </>
  ),
  "no-entry": (
    <>
      <circle cx="50" cy="50" r="46" fill={RED} />
      <rect x="22" y="42" width="56" height="16" rx="2" fill={WHITE} />
    </>
  ),
  stop: (
    <>
      <polygon
        points="32,6 68,6 94,32 94,68 68,94 32,94 6,68 6,32"
        fill={RED}
        stroke={WHITE}
        strokeWidth="3"
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="24"
        fontWeight="700"
        fill={WHITE}
        fontFamily="Arial, sans-serif"
      >
        STOP
      </text>
    </>
  ),
  "give-way": <Triangle down />,
  "no-overtaking": (
    <>
      <circle cx="50" cy="50" r="46" fill={WHITE} stroke={RED} strokeWidth="10" />
      <g transform="translate(19,31)">
        <Car color={BLACK} />
      </g>
      <g transform="translate(51,31)">
        <Car color={RED} />
      </g>
    </>
  ),
  "turn-left": (
    <BlueCircle>
      <polygon points="26,50 46,34 46,44 72,44 72,56 46,56 46,66" fill={WHITE} />
    </BlueCircle>
  ),
  "turn-right": (
    <BlueCircle>
      <polygon points="74,50 54,34 54,44 28,44 28,56 54,56 54,66" fill={WHITE} />
    </BlueCircle>
  ),
  "no-left-turn": (
    <>
      <circle cx="50" cy="50" r="46" fill={WHITE} stroke={RED} strokeWidth="10" />
      <path d="M58,70 L58,46 L42,46" fill="none" stroke={BLACK} strokeWidth="7.5" />
      <polygon points="28,46 43,37 43,55" fill={BLACK} />
      <line x1="22" y1="22" x2="78" y2="78" stroke={RED} strokeWidth="8" strokeLinecap="round" />
    </>
  ),
  "no-right-turn": (
    <>
      <circle cx="50" cy="50" r="46" fill={WHITE} stroke={RED} strokeWidth="10" />
      <path d="M42,70 L42,46 L58,46" fill="none" stroke={BLACK} strokeWidth="7.5" />
      <polygon points="72,46 57,37 57,55" fill={BLACK} />
      <line x1="22" y1="22" x2="78" y2="78" stroke={RED} strokeWidth="8" strokeLinecap="round" />
    </>
  ),
  "no-u-turn": (
    <>
      <circle cx="50" cy="50" r="46" fill={WHITE} stroke={RED} strokeWidth="10" />
      <path
        d="M64,70 L64,48 A14,14 0 0,0 36,48 L36,58"
        fill="none"
        stroke={BLACK}
        strokeWidth="6"
      />
      <polygon points="36,72 29,56 43,56" fill={BLACK} />
      <line x1="22" y1="22" x2="78" y2="78" stroke={RED} strokeWidth="8" strokeLinecap="round" />
    </>
  ),
  "ahead-only": (
    <BlueCircle>
      <polygon points="50,26 36,46 45,46 45,74 55,74 55,46 64,46" fill={WHITE} />
    </BlueCircle>
  ),
  parking: (
    <>
      <rect x="14" y="14" width="72" height="72" rx="12" fill={BLUE} />
      <text
        x="50"
        y="52"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="56"
        fontWeight="700"
        fill={WHITE}
        fontFamily="Arial, sans-serif"
      >
        P
      </text>
    </>
  ),
  "warning-tjunction": (
    <Triangle>
      <g stroke={BLACK} strokeWidth="7">
        <line x1="35" y1="52" x2="65" y2="52" />
        <line x1="50" y1="52" x2="50" y2="76" />
      </g>
    </Triangle>
  ),
  "two-way-traffic": (
    <Triangle>
      <g fill={BLACK}>
        <polygon points="42,36 35,50 39,50 39,72 45,72 45,50 49,50" />
        <polygon points="59,74 52,60 56,60 56,38 62,38 62,60 66,60" />
      </g>
    </Triangle>
  ),
  "no-stopping": (
    <>
      <circle cx="50" cy="50" r="46" fill={BLUE} />
      <circle cx="50" cy="50" r="46" fill="none" stroke={RED} strokeWidth="9" />
      <g stroke={RED} strokeWidth="9" strokeLinecap="round">
        <line x1="26" y1="26" x2="74" y2="74" />
        <line x1="74" y1="26" x2="26" y2="74" />
      </g>
    </>
  ),
  roundabout: (
    <>
      <circle cx="50" cy="50" r="46" fill={BLUE} />
      {[0, 120, 240].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 50 50)`}>
          <path d="M56.2,31 A20,20 0 0,1 69,56.2" fill="none" stroke={WHITE} strokeWidth="7" />
          <polygon points="65.9,65.7 62.4,54 75.7,58.3" fill={WHITE} />
        </g>
      ))}
    </>
  ),
  "warning-general": (
    <Triangle>
      <text
        x="50"
        y="58"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="40"
        fontWeight="800"
        fill={BLACK}
        fontFamily="Arial, sans-serif"
      >
        !
      </text>
    </Triangle>
  ),
  "warning-crossroads": (
    <Triangle>
      <g stroke={BLACK} strokeWidth="7" strokeLinecap="butt">
        <line x1="50" y1="44" x2="50" y2="72" />
        <line x1="36" y1="58" x2="64" y2="58" />
      </g>
    </Triangle>
  ),
};

export default function SignGraphic({
  id,
  size = 116,
  className = "",
}: {
  id: SignId;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Road sign"
    >
      {SIGNS[id]}
    </svg>
  );
}
