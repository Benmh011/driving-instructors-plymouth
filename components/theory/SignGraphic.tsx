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

// Side-profile car silhouette (~32 wide, faces left). Used on the no-overtaking sign.
function Car({ color }: { color: string }) {
  return (
    <g>
      <path
        d="M1,19 L1,15 C1,14 2,13 4,13 C5,10 8,7 13,7 L20,7 C24,7 26,9 28,13 C30,13 31,14 31,15 L31,19 Z"
        fill={color}
      />
      <path d="M8,12.5 C9,9.5 11,9 13,9 L19,9 C22,9 23,10.5 25,12.5 Z" fill={WHITE} />
      <circle cx="9" cy="19" r="3.6" fill={BLACK} />
      <circle cx="9" cy="19" r="1.4" fill={WHITE} />
      <circle cx="24" cy="19" r="3.6" fill={BLACK} />
      <circle cx="24" cy="19" r="1.4" fill={WHITE} />
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
      <g transform="translate(15,40)">
        <Car color={RED} />
      </g>
      <g transform="translate(52,40)">
        <Car color={BLACK} />
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
  "ahead-only": (
    <BlueCircle>
      <polygon points="50,26 36,46 45,46 45,74 55,74 55,46 64,46" fill={WHITE} />
    </BlueCircle>
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
      <g fill="none" stroke={WHITE} strokeWidth="6" strokeLinecap="round">
        <path d="M49,29 A21,21 0 0,1 67,40" />
        <g transform="rotate(120 50 50)">
          <path d="M49,29 A21,21 0 0,1 67,40" />
        </g>
        <g transform="rotate(240 50 50)">
          <path d="M49,29 A21,21 0 0,1 67,40" />
        </g>
      </g>
      <g fill={WHITE}>
        <polygon points="67,46 60,38 75,38" />
        <g transform="rotate(120 50 50)">
          <polygon points="67,46 60,38 75,38" />
        </g>
        <g transform="rotate(240 50 50)">
          <polygon points="67,46 60,38 75,38" />
        </g>
      </g>
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
      <g stroke={BLACK} strokeWidth="8" strokeLinecap="butt">
        <line x1="50" y1="36" x2="50" y2="74" />
        <line x1="31" y1="51" x2="69" y2="51" />
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
