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
  | "turn-right"
  | "ahead-only"
  | "two-way-traffic"
  | "no-stopping"
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
  {
    id: "q0025",
    topic: "Motorway rules",
    prompt: "What is the national speed limit for a car on a motorway?",
    options: ["60 mph", "70 mph", "80 mph", "There is no limit"],
    answer: 1,
    explanation: "For cars, the motorway speed limit is 70 mph unless signs show otherwise.",
  },
  {
    id: "q0026",
    topic: "Motorway rules",
    prompt: "On a motorway, what colour are the reflective studs that mark the slip-road exits and entrances?",
    options: ["Red", "Amber", "Green", "White"],
    answer: 2,
    explanation:
      "Green studs separate the main carriageway from slip roads. Red mark the left edge, amber the right, white the lanes.",
  },
  {
    id: "q0027",
    topic: "Motorway rules",
    prompt: "What is the right-hand lane of a motorway normally used for?",
    options: [
      "Overtaking",
      "Slow-moving vehicles",
      "Large goods vehicles",
      "Breakdowns",
    ],
    answer: 0,
    explanation:
      "The right-hand lane is for overtaking. Move back to the left once you've safely passed.",
  },
  {
    id: "q0028",
    topic: "Motorway rules",
    prompt:
      "Your car breaks down and you stop on the hard shoulder. What should you and your passengers do?",
    options: [
      "Stay in the car with seatbelts on",
      "Leave by the left-hand doors and wait behind the safety barrier",
      "Stand in front of the car to warn traffic",
      "Attempt repairs in the running lane",
    ],
    answer: 1,
    explanation:
      "Get out on the left, away from traffic, and wait behind the barrier while you call for help.",
  },
  {
    id: "q0029",
    topic: "Rules of the road",
    prompt: "At a mini-roundabout, who should you give way to?",
    options: [
      "Traffic coming from your right",
      "Traffic coming from your left",
      "Nobody — you have priority",
      "Only large vehicles",
    ],
    answer: 0,
    explanation:
      "As with any roundabout, give way to traffic coming from your right unless signs say otherwise.",
  },
  {
    id: "q0030",
    topic: "Rules of the road",
    prompt:
      "The broken white line down the centre of the road becomes much longer as you drive on. What does this mean?",
    options: [
      "There is a hazard ahead",
      "You may park here",
      "The road is about to become one-way",
      "You have right of way",
    ],
    answer: 0,
    explanation:
      "A hazard warning line — longer markings with shorter gaps — warns of a hazard such as a bend or junction ahead.",
  },
  {
    id: "q0031",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "no-stopping",
    options: [
      "No stopping (clearway)",
      "No through road",
      "No parking on weekdays",
      "No entry",
    ],
    answer: 0,
    explanation:
      "A blue circle with a red border and red cross means no stopping at any time — a clearway.",
  },
  {
    id: "q0032",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "turn-right",
    options: [
      "Turn right ahead",
      "No right turn",
      "Bend to the right",
      "One way to the right",
    ],
    answer: 0,
    explanation:
      "A blue circle with a white arrow pointing right gives the positive instruction to turn right ahead.",
  },
  {
    id: "q0033",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "two-way-traffic",
    options: [
      "Two-way traffic ahead",
      "Overtaking allowed",
      "Dual carriageway ends",
      "One-way street",
    ],
    answer: 0,
    explanation:
      "A red-bordered triangle with two vertical arrows warns of two-way traffic ahead.",
  },
  {
    id: "q0034",
    topic: "Road and traffic signs",
    prompt: "On a motorway, what background colour do the direction signs have?",
    options: ["Green", "Blue", "White", "Brown"],
    answer: 1,
    explanation:
      "Motorway signs are blue. Primary routes are green, and other local routes are white.",
  },
  {
    id: "q0035",
    topic: "Documents",
    prompt: "What is the minimum level of insurance you must have to drive on public roads?",
    options: [
      "Third party",
      "Third party, fire and theft",
      "Fully comprehensive",
      "No insurance is required",
    ],
    answer: 0,
    explanation:
      "Third-party insurance is the legal minimum — it covers injury to others and damage to their property.",
  },
  {
    id: "q0036",
    topic: "Documents",
    prompt:
      "Within two years of passing your test, how many penalty points will cause your licence to be revoked?",
    options: ["3 points", "6 points", "9 points", "12 points"],
    answer: 1,
    explanation:
      "Under the New Drivers Act, 6 or more points within two years of passing means your licence is revoked.",
  },
  {
    id: "q0037",
    topic: "Safety and your vehicle",
    prompt: "When may you use front fog lights?",
    options: [
      "Whenever it is dark",
      "Only when visibility is seriously reduced (under 100 m)",
      "On a clear motorway to be seen",
      "Whenever it rains lightly",
    ],
    answer: 1,
    explanation:
      "Use fog lights only when visibility is seriously reduced, and switch them off when it improves so you don't dazzle others.",
  },
  {
    id: "q0038",
    topic: "Safety and your vehicle",
    prompt: "What is the main benefit of anti-lock brakes (ABS)?",
    options: [
      "They let you brake later in all conditions",
      "They help you keep steering control under heavy braking",
      "They shorten stopping distances on ice",
      "They remove the need to look ahead",
    ],
    answer: 1,
    explanation:
      "ABS stops the wheels locking, so you can keep steering while braking hard. It won't always shorten stopping distances.",
  },
  {
    id: "q0039",
    topic: "Safety and your vehicle",
    prompt: "Which of these is most likely to increase your fuel consumption?",
    options: [
      "Keeping tyres correctly inflated",
      "Carrying an empty roof rack",
      "Gentle acceleration",
      "Removing unnecessary weight",
    ],
    answer: 1,
    explanation:
      "An empty roof rack adds drag and uses more fuel. Remove it when you're not using it.",
  },
  {
    id: "q0040",
    topic: "Vehicle handling",
    prompt: "Driving downhill, what happens to your stopping distance?",
    options: [
      "It increases",
      "It decreases",
      "It stays the same",
      "It only changes in the wet",
    ],
    answer: 0,
    explanation:
      "Gravity adds to your momentum downhill, so stopping distances increase. Use a lower gear to help control speed.",
  },
  {
    id: "q0041",
    topic: "Vehicle handling",
    prompt: "How should you drive in icy conditions?",
    options: [
      "Brake firmly and often to test grip",
      "Slowly, with gentle steering, braking and acceleration",
      "In a low gear at high revs",
      "Closely behind the car in front",
    ],
    answer: 1,
    explanation:
      "On ice, everything should be gentle and gradual, and leave up to ten times the normal gap.",
  },
  {
    id: "q0042",
    topic: "Attitude",
    prompt:
      "An ambulance is behind you showing flashing blue lights. What should you do?",
    options: [
      "Brake hard immediately",
      "Pull over and stop where it's safe to let it pass, without breaking the law",
      "Speed up to get out of the way",
      "Drive through a red light to clear the road",
    ],
    answer: 1,
    explanation:
      "Stay calm, look for a safe place to pull in and let it pass. Don't endanger others or break traffic laws to do so.",
  },
  {
    id: "q0043",
    topic: "Attitude",
    prompt: "What is the speed limit for a car towing a trailer on a dual carriageway?",
    options: ["50 mph", "60 mph", "70 mph", "40 mph"],
    answer: 1,
    explanation:
      "When towing, the limit is 60 mph on dual carriageways and motorways, and 50 mph on single carriageways.",
  },
  {
    id: "q0044",
    topic: "Vulnerable road users",
    prompt: "A toucan crossing is designed to be used by whom?",
    options: [
      "Pedestrians only",
      "Cyclists only",
      "Pedestrians and cyclists together",
      "Horse riders only",
    ],
    answer: 2,
    explanation:
      "At a toucan crossing, pedestrians and cyclists cross together — 'two-can' cross.",
  },
  {
    id: "q0045",
    topic: "Vulnerable road users",
    prompt: "At a pelican crossing, a flashing amber light means what?",
    options: [
      "Stop, the lights are faulty",
      "Give way to pedestrians still on the crossing",
      "Speed up before it turns red",
      "Pedestrians must wait",
    ],
    answer: 1,
    explanation:
      "Flashing amber means you may go if the crossing is clear, but you must give way to anyone still crossing.",
  },
  {
    id: "q0046",
    topic: "Hazard awareness",
    prompt: "You start to feel sleepy on a long drive. What should you do?",
    options: [
      "Open a window and carry on",
      "Stop somewhere safe and rest",
      "Turn the radio up loud",
      "Speed up to finish sooner",
    ],
    answer: 1,
    explanation:
      "Tiredness kills. Find a safe place to stop and rest — fresh air and loud music aren't real fixes.",
  },
  {
    id: "q0047",
    topic: "Other types of vehicle",
    prompt: "Motorcyclists are often hardest to see at which location?",
    options: ["On motorways", "At junctions", "In car parks", "On straight roads"],
    answer: 1,
    explanation:
      "Junctions are where motorcyclists are most often missed. Look carefully — 'think once, think twice, think bike'.",
  },
  {
    id: "q0048",
    topic: "Incidents and emergencies",
    prompt:
      "At a crash, a casualty is bleeding heavily from a wound. What should you do?",
    options: [
      "Give them food and drink",
      "Apply firm pressure to the wound",
      "Move them to a comfortable position",
      "Leave it for the paramedics only",
    ],
    answer: 1,
    explanation:
      "Apply firm pressure to the wound (ideally over a clean pad) to help stem the bleeding while you wait for help.",
  },
  {
    id: "q0049",
    topic: "Vehicle loading",
    prompt: "Who is responsible for making sure a vehicle is not overloaded?",
    options: [
      "The passengers",
      "The driver",
      "The vehicle manufacturer",
      "The insurance company",
    ],
    answer: 1,
    explanation:
      "The driver is responsible for the load. Overloading affects handling, braking and tyre safety, and is illegal.",
  },
  {
    id: "q0050",
    topic: "Alertness",
    prompt: "What should you do before reversing your car?",
    options: [
      "Sound your horn and reverse quickly",
      "Check all around, including blind spots, for pedestrians and children",
      "Rely only on your mirrors",
      "Reverse first, then look",
    ],
    answer: 1,
    explanation:
      "Look all around before and during reversing — children are easily missed. Don't rely on mirrors alone.",
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

export function questionById(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}
