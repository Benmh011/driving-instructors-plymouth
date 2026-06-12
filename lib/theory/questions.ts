// Original theory question bank for Driving Instructors Plymouth.
// NOT copied from the DVSA official bank — written in-house, kept current to the
// Highway Code. Sign questions reference an in-house SVG via `sign`.

export const TOPICS = [
  "Alertness",
  "Attitude",
  "Safety and your vehicle",
  "Safety margins",
  "Hazard awareness",
  "Vulnerable road users",
  "Other types of vehicle",
  "Vehicle handling",
  "Motorway rules",
  "Rules of the road",
  "Road and traffic signs",
  "Documents",
  "Incidents and emergencies",
  "Vehicle loading",
] as const;

export type Topic = (typeof TOPICS)[number];

export type SignId =
  | "speed-20"
  | "speed-30"
  | "speed-40"
  | "speed-50"
  | "speed-60"
  | "speed-70"
  | "nsl"
  | "no-entry"
  | "stop"
  | "give-way"
  | "no-overtaking"
  | "turn-left"
  | "ahead-only"
  | "warning-general"
  | "warning-crossroads";

export type Question = {
  id: string;
  topic: Topic;
  prompt: string;
  options: string[];
  answer: number; // zero-based index of the correct option
  explanation: string;
  sign?: SignId; // when present, the question shows this sign graphic
};

export const MOCK_COUNT = 50;
export const MOCK_PASS_MARK = 43;
export const MOCK_TIME_SECONDS = 57 * 60;

export const QUESTIONS: Question[] = [
  {
    id: "q0001",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "speed-30",
    options: [
      "Maximum speed 30 mph",
      "Minimum speed 30 mph",
      "Recommended speed 30 mph",
      "End of 30 mph zone",
    ],
    answer: 0,
    explanation:
      "A red ring around a number sets the maximum speed limit — here, 30 mph.",
  },
  {
    id: "q0002",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "nsl",
    options: [
      "National speed limit applies",
      "End of all restrictions on overtaking",
      "No vehicles at all",
      "Road closed ahead",
    ],
    answer: 0,
    explanation:
      "A white circle with a single black diagonal stripe means the national speed limit applies.",
  },
  {
    id: "q0003",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "no-entry",
    options: [
      "No entry for vehicles",
      "One-way street",
      "No stopping",
      "Give way to oncoming traffic",
    ],
    answer: 0,
    explanation:
      "A red circle with a white horizontal bar means no entry for vehicular traffic.",
  },
  {
    id: "q0004",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "stop",
    options: [
      "Stop and give way",
      "Slow down only if traffic is coming",
      "Give way to traffic from the right",
      "No through road",
    ],
    answer: 0,
    explanation:
      "The octagonal STOP sign means you must stop completely and give way, even if the road looks clear.",
  },
  {
    id: "q0005",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "give-way",
    options: [
      "Give way to traffic on the major road",
      "Stop at all times",
      "No entry",
      "Roundabout ahead",
    ],
    answer: 0,
    explanation:
      "The inverted triangle means give way to traffic on the major road — you don't always have to stop, but you must yield.",
  },
  {
    id: "q0006",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "turn-left",
    options: [
      "Turn left ahead",
      "No left turn",
      "Bend to the left",
      "One way to the left",
    ],
    answer: 0,
    explanation:
      "Blue circular signs give a positive instruction. A white arrow pointing left means turn left ahead.",
  },
  {
    id: "q0007",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "warning-crossroads",
    options: [
      "Crossroads ahead",
      "Give way ahead",
      "Hospital ahead",
      "Level crossing ahead",
    ],
    answer: 0,
    explanation:
      "A red-bordered triangle warns of a hazard. The cross symbol means a crossroads is ahead.",
  },
  {
    id: "q0008",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "no-overtaking",
    options: [
      "No overtaking",
      "Two-way traffic",
      "Overtaking lane ahead",
      "End of dual carriageway",
    ],
    answer: 0,
    explanation:
      "A red ring with two cars means overtaking is prohibited until you pass the sign cancelling it.",
  },
  {
    id: "q0009",
    topic: "Safety margins",
    prompt: "In good, dry conditions, what is the overall stopping distance at 30 mph?",
    options: ["12 metres", "23 metres", "36 metres", "53 metres"],
    answer: 1,
    explanation:
      "At 30 mph, thinking distance is about 9 m and braking about 14 m — roughly 23 m overall.",
  },
  {
    id: "q0010",
    topic: "Safety margins",
    prompt: "In good, dry conditions, what is the overall stopping distance at 70 mph?",
    options: ["53 metres", "73 metres", "96 metres", "120 metres"],
    answer: 2,
    explanation:
      "At 70 mph, thinking distance is about 21 m and braking about 75 m — roughly 96 m overall.",
  },
  {
    id: "q0011",
    topic: "Safety margins",
    prompt: "It is raining. What is the minimum following gap you should leave?",
    options: [
      "A one-second gap",
      "A two-second gap",
      "A four-second gap",
      "A six-second gap",
    ],
    answer: 2,
    explanation:
      "The two-second rule for dry roads should at least double to four seconds in the wet.",
  },
  {
    id: "q0012",
    topic: "Vulnerable road users",
    prompt:
      "You are approaching a zebra crossing and a pedestrian is waiting to cross. What should you do?",
    options: [
      "Sound your horn and continue",
      "Be ready to slow down and stop to let them cross",
      "Speed up to clear the crossing first",
      "Wave the pedestrian across",
    ],
    answer: 1,
    explanation:
      "Be prepared to stop and give way. Don't wave people across — another driver may not stop.",
  },
  {
    id: "q0013",
    topic: "Vulnerable road users",
    prompt:
      "When overtaking a cyclist at speeds up to 30 mph, how much room should you leave?",
    options: [
      "At least 0.5 metres",
      "At least 1 metre",
      "At least 1.5 metres",
      "As little as possible to hold your lane",
    ],
    answer: 2,
    explanation:
      "Leave at least 1.5 metres when overtaking cyclists at up to 30 mph, and more at higher speeds.",
  },
  {
    id: "q0014",
    topic: "Rules of the road",
    prompt: "What is the national speed limit for a car on a single carriageway road?",
    options: ["50 mph", "60 mph", "70 mph", "40 mph"],
    answer: 1,
    explanation:
      "For cars, the national speed limit on a single carriageway is 60 mph unless signs say otherwise.",
  },
  {
    id: "q0015",
    topic: "Rules of the road",
    prompt: "What is the national speed limit for a car on a dual carriageway?",
    options: ["60 mph", "70 mph", "80 mph", "50 mph"],
    answer: 1,
    explanation:
      "For cars, the national speed limit on a dual carriageway is 70 mph — the same as a motorway.",
  },
  {
    id: "q0016",
    topic: "Documents",
    prompt: "How long is an MOT certificate for a car normally valid?",
    options: ["Six months", "One year", "Two years", "Three years"],
    answer: 1,
    explanation:
      "An MOT lasts one year. A new car needs its first MOT three years after registration.",
  },
  {
    id: "q0017",
    topic: "Safety and your vehicle",
    prompt: "What is the minimum legal tyre tread depth for a car in the UK?",
    options: ["1.0 mm", "1.6 mm", "2.0 mm", "3.0 mm"],
    answer: 1,
    explanation:
      "The minimum legal tread is 1.6 mm across the central three-quarters and around the whole tyre.",
  },
  {
    id: "q0018",
    topic: "Other types of vehicle",
    prompt:
      "You are following a long lorry approaching a junction to turn left. What might it do?",
    options: [
      "Move out to the right before turning left",
      "Stop suddenly with no reason",
      "Reverse towards you",
      "Always turn tightly from the kerb",
    ],
    answer: 0,
    explanation:
      "Long vehicles often swing the opposite way to make a tight turn. Keep well back and don't try to pass.",
  },
  {
    id: "q0019",
    topic: "Alertness",
    prompt: "What is the correct routine before moving off from a parked position?",
    options: [
      "Signal, then pull straight out",
      "Check mirrors, signal if needed, then check blind spots",
      "Sound the horn and move off",
      "Move off, then check your mirrors",
    ],
    answer: 1,
    explanation:
      "Use Mirrors–Signal–Manoeuvre and always check blind spots — mirrors don't show everything.",
  },
  {
    id: "q0020",
    topic: "Hazard awareness",
    prompt:
      "A ball bounces into the road from between parked cars ahead. What should you do?",
    options: [
      "Keep your speed — the road looks clear",
      "Sound your horn and continue",
      "Slow down and be ready to stop, as a child may follow",
      "Swerve into the opposite lane",
    ],
    answer: 2,
    explanation:
      "A ball in the road is a classic clue that a child may run out after it. Ease off and be ready to stop.",
  },
  {
    id: "q0021",
    topic: "Attitude",
    prompt:
      "A driver behind is following too closely (tailgating). What is the safest response?",
    options: [
      "Brake sharply to warn them",
      "Speed up to get away from them",
      "Gradually increase the gap to the vehicle in front",
      "Ignore it and maintain your exact speed",
    ],
    answer: 2,
    explanation:
      "Easing back from the vehicle ahead gives you more room to brake gently, protecting you from the tailgater.",
  },
  {
    id: "q0022",
    topic: "Vehicle handling",
    prompt: "When driving in thick fog, you should:",
    options: [
      "Use full-beam headlights",
      "Use dipped headlights or fog lights and slow down",
      "Follow the tail-lights of the car ahead closely",
      "Turn your lights off to reduce glare",
    ],
    answer: 1,
    explanation:
      "Full beam reflects back off fog. Use dipped headlights or fog lights, slow down and leave a bigger gap.",
  },
  {
    id: "q0023",
    topic: "Motorway rules",
    prompt: "What is the purpose of the hard shoulder on a traditional motorway?",
    options: [
      "An extra lane in heavy traffic",
      "Emergencies and breakdowns only",
      "Overtaking on the left",
      "A place to stop for a rest",
    ],
    answer: 1,
    explanation:
      "On a conventional motorway the hard shoulder is for emergencies and breakdowns only.",
  },
  {
    id: "q0024",
    topic: "Incidents and emergencies",
    prompt:
      "You arrive at the scene of a crash where someone is unconscious but breathing. What should you do first?",
    options: [
      "Give them a drink",
      "Move them off the road immediately",
      "Call the emergency services and keep them safe",
      "Remove their motorcycle helmet",
    ],
    answer: 2,
    explanation:
      "Call 999 and keep the casualty safe. Don't move them or remove a helmet unless absolutely necessary.",
  },
];

export function topicCount(topic: Topic): number {
  return QUESTIONS.filter((q) => q.topic === topic).length;
}

export function questionsForTopic(topic: string): Question[] {
  return QUESTIONS.filter((q) => q.topic === topic);
}

export function topicSlug(t: string): string {
  return t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function topicFromSlug(slug: string): Topic | null {
  return TOPICS.find((t) => topicSlug(t) === slug) ?? null;
}
