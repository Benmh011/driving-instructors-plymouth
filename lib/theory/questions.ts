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
  | "roundabout"
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
    prompt:
      "In good, dry conditions, what is the smallest time gap you should keep behind the vehicle in front?",
    options: [
      "One second",
      "Two seconds",
      "Half a second",
      "It doesn't matter at low speed",
    ],
    answer: 1,
    explanation:
      "Use the two-second rule: as the vehicle in front passes a fixed point, you shouldn't reach it for at least two seconds.",
  },
  {
    id: "q0010",
    topic: "Safety margins",
    prompt: "Which of these increases your overall stopping distance the most?",
    options: [
      "A dry, grippy road",
      "Wet or icy road conditions",
      "Being fully alert",
      "Having good tyres",
    ],
    answer: 1,
    explanation:
      "Wet roads roughly double your stopping distance, and ice can multiply it many times over. Leave a much bigger gap in poor conditions.",
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
    prompt: "When overtaking a cyclist, what is the minimum room you should give them?",
    options: [
      "At least 0.5 metres",
      "At least 1 metre",
      "At least 1.5 metres",
      "Just enough to squeeze past",
    ],
    answer: 2,
    explanation:
      "Give cyclists at least 1.5 metres as a minimum, and more at higher speeds. If you can't, wait behind until it's safe.",
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
    options: ["1.4 mm", "1.6 mm", "1.8 mm", "2.0 mm"],
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
    prompt: "What's the safe routine before moving off from the side of the road?",
    options: [
      "Pull out as soon as the road sounds clear",
      "Check mirrors and blind spots, and signal if it would help others",
      "Signal and pull out without looking round",
      "Move off first, then check your mirrors",
    ],
    answer: 1,
    explanation:
      "Check your mirrors and blind spots every time. The Highway Code says signal 'if necessary', so you won't always need to — but you must always check the blind spots.",
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
      "Another driver is following you too closely (tailgating). What is the safest thing to do?",
    options: [
      "Brake sharply to warn them off",
      "Ease off the accelerator and leave more room to the car in front",
      "Speed up to get away from them",
      "Brake-test them until they back off",
    ],
    answer: 1,
    explanation:
      "Leaving more space ahead means you can slow down gently instead of braking hard — so if you do need to stop, the tailgater has time to react and is less likely to hit you.",
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
    prompt: "Which driving style uses the most fuel?",
    options: [
      "Reading the road and holding a steady speed",
      "Harsh acceleration and heavy braking",
      "Changing up to a higher gear in good time",
      "Easing off early when approaching a hazard",
    ],
    answer: 1,
    explanation:
      "Harsh acceleration and late, heavy braking waste fuel. Smooth, anticipatory driving in the right gear is far more economical.",
  },
  {
    id: "q0040",
    topic: "Vehicle handling",
    prompt: "Why should you select a lower gear before driving down a steep hill?",
    options: [
      "To save fuel",
      "To use engine braking and help control your speed",
      "To make the engine quieter",
      "To turn off the brake lights",
    ],
    answer: 1,
    explanation:
      "A lower gear lets the engine help hold your speed (engine braking), so you're not riding the brakes the whole way down and overheating them.",
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
  {
    id: "q0051",
    topic: "Alertness",
    prompt: "Using a hand-held mobile phone while driving is:",
    options: [
      "Allowed at low speeds",
      "Allowed when stopped in traffic",
      "Illegal at all times while driving",
      "Allowed for short calls",
    ],
    answer: 2,
    explanation:
      "It's illegal to hold a phone while driving, including when stopped at lights or in queuing traffic.",
  },
  {
    id: "q0052",
    topic: "Attitude",
    prompt: "Another driver flashes their headlights at you. What's the safest way to treat it?",
    options: [
      "As a clear signal that it's safe to go",
      "As them simply letting you know they're there",
      "As a sign they are giving up their priority",
      "As an instruction to speed up",
    ],
    answer: 1,
    explanation:
      "Officially, flashing headlights only mean 'I'm here'. Never assume it means 'go' — check for yourself that it's safe before you move.",
  },
  {
    id: "q0053",
    topic: "Safety and your vehicle",
    prompt: "What can under-inflated tyres cause?",
    options: [
      "Better grip and shorter stopping",
      "Poorer handling and uneven, faster wear",
      "Lower fuel consumption",
      "A smoother, quieter ride",
    ],
    answer: 1,
    explanation:
      "Under-inflated tyres reduce grip, affect steering and braking, wear unevenly and use more fuel.",
  },
  {
    id: "q0054",
    topic: "Safety margins",
    prompt:
      "In heavy rain your tyres can ride up on a film of water and lose contact with the road. What is this called?",
    options: ["Skidding", "Aquaplaning", "Cadence braking", "Coasting"],
    answer: 1,
    explanation:
      "This is aquaplaning. The steering goes light because the tyres have lost grip on the road surface.",
  },
  {
    id: "q0055",
    topic: "Vehicle handling",
    prompt:
      "Driving in heavy rain, your steering suddenly feels light. What should you do?",
    options: [
      "Brake hard immediately",
      "Ease off the accelerator and let your speed drop",
      "Steer sharply to regain grip",
      "Accelerate to push through the water",
    ],
    answer: 1,
    explanation:
      "Light steering means you're aquaplaning. Ease off gently and don't brake or steer harshly until grip returns.",
  },
  {
    id: "q0056",
    topic: "Hazard awareness",
    prompt: "You've been prescribed medicine that could cause drowsiness. What should you do?",
    options: [
      "Drive only on short trips",
      "Ask your doctor or pharmacist, and don't drive if you're unsure",
      "Drive with the window open to stay awake",
      "Take a smaller dose so you can drive",
    ],
    answer: 1,
    explanation:
      "Check with your doctor or pharmacist whether it's safe to drive while taking it. If you're in any doubt, don't drive.",
  },
  {
    id: "q0057",
    topic: "Vulnerable road users",
    prompt:
      "You're about to turn left and a cyclist is moving up on your left. What should you do?",
    options: [
      "Turn quickly before they reach you",
      "Hold back and let the cyclist go first",
      "Sound your horn and turn",
      "Move left to block them",
    ],
    answer: 1,
    explanation:
      "Never turn across a cyclist on your left. Wait behind and let them clear the junction first.",
  },
  {
    id: "q0058",
    topic: "Vulnerable road users",
    prompt: "How should you pass horses being ridden on the road?",
    options: [
      "Quickly, to get past sooner",
      "Slowly and giving them plenty of room",
      "Sounding your horn to alert them",
      "Revving your engine to pass",
    ],
    answer: 1,
    explanation:
      "Pass horses slowly and wide (at least 2 metres), and be ready to stop. Sudden noise can frighten them.",
  },
  {
    id: "q0059",
    topic: "Rules of the road",
    prompt: "When may you wait within a yellow box junction?",
    options: [
      "Whenever you like",
      "When turning right and only oncoming traffic stops you",
      "When going straight ahead in traffic",
      "Never, under any circumstances",
    ],
    answer: 1,
    explanation:
      "You may only wait in a box junction when turning right and the only thing stopping you is oncoming traffic.",
  },
  {
    id: "q0060",
    topic: "Vehicle handling",
    prompt: "In strong crosswinds, you should take extra care when overtaking:",
    options: [
      "Parked cars",
      "Cyclists and motorcyclists",
      "Bus stops",
      "Road signs",
    ],
    answer: 1,
    explanation:
      "Wind can blow cyclists and motorcyclists off course, so give them extra room when you pass.",
  },
  {
    id: "q0061",
    topic: "Motorway rules",
    prompt: "Which of these are you NOT allowed to do on a motorway?",
    options: [
      "Stop on the hard shoulder in an emergency",
      "Reverse along the carriageway",
      "Use the left lane for normal driving",
      "Leave at a junction",
    ],
    answer: 1,
    explanation:
      "You must never reverse, do a U-turn, or walk on a motorway. If you miss your exit, carry on to the next one.",
  },
  {
    id: "q0062",
    topic: "Road and traffic signs",
    prompt: "A red cross (X) is shown on a gantry above your motorway lane. What does it mean?",
    options: [
      "The lane is closed — move out of it",
      "Speed up to clear the lane",
      "The lane is for buses only",
      "Hard shoulder ahead",
    ],
    answer: 0,
    explanation:
      "A red X means the lane is closed. Move safely into an open lane and don't drive under it.",
  },
  {
    id: "q0063",
    topic: "Rules of the road",
    prompt: "Where must you not park?",
    options: [
      "In a marked parking bay",
      "On the zig-zag lines at a pedestrian crossing",
      "On a quiet residential street",
      "In a car park",
    ],
    answer: 1,
    explanation:
      "Never park on the zig-zag lines of a crossing — it blocks the view between drivers and people crossing.",
  },
  {
    id: "q0064",
    topic: "Rules of the road",
    prompt: "There are double white lines along the centre of the road with a solid line on your side. What does this mean?",
    options: [
      "You may overtake if it's clear",
      "You must not cross or straddle the line",
      "You may park along it",
      "The road is one-way",
    ],
    answer: 1,
    explanation:
      "A solid white line on your side means you must not cross or straddle it, except in limited situations such as passing a stationary obstruction.",
  },
  {
    id: "q0065",
    topic: "Documents",
    prompt:
      "Police stop you but you don't have your licence and insurance with you. What can you usually do?",
    options: [
      "Nothing — you'll be charged on the spot",
      "Produce them at a police station within 7 days",
      "Email them within 24 hours",
      "Ignore the request",
    ],
    answer: 1,
    explanation:
      "You normally have 7 days to produce your documents at a nominated police station.",
  },
  {
    id: "q0066",
    topic: "Documents",
    prompt: "When does a new car first need an MOT test?",
    options: [
      "After 1 year",
      "After 2 years",
      "After 3 years",
      "Only when it's sold",
    ],
    answer: 2,
    explanation:
      "A new car needs its first MOT three years after registration, then every year after that.",
  },
  {
    id: "q0067",
    topic: "Incidents and emergencies",
    prompt: "You're first to arrive at a crash. What should you do first?",
    options: [
      "Move all casualties immediately",
      "Make the scene safe and warn other traffic",
      "Take photos for insurance",
      "Offer casualties a hot drink",
    ],
    answer: 1,
    explanation:
      "Make the area safe first — switch on hazard lights, warn other traffic and stop any smoking — before helping casualties.",
  },
  {
    id: "q0068",
    topic: "Incidents and emergencies",
    prompt: "A casualty is not breathing. What should you do?",
    options: [
      "Give them water",
      "Start chest compressions (CPR)",
      "Sit them upright",
      "Wait and watch",
    ],
    answer: 1,
    explanation:
      "If someone isn't breathing, call 999 and start CPR — push firmly on the centre of the chest at a steady rhythm.",
  },
  {
    id: "q0069",
    topic: "Vehicle loading",
    prompt: "How does a heavy load on a roof rack affect your car?",
    options: [
      "It lowers the centre of gravity",
      "It raises the centre of gravity and affects handling",
      "It improves grip in corners",
      "It has no effect",
    ],
    answer: 1,
    explanation:
      "A roof load raises the centre of gravity, making the car less stable in corners and crosswinds. Secure it and slow down.",
  },
  {
    id: "q0070",
    topic: "Vehicle loading",
    prompt: "A child is travelling in your car. What must they use?",
    options: [
      "An adult seatbelt only",
      "The correct child restraint for their height or weight",
      "Nothing, if it's a short trip",
      "A cushion to sit higher",
    ],
    answer: 1,
    explanation:
      "Children must use the correct car seat or booster for their height or weight until 12 years old or 135 cm tall.",
  },
  {
    id: "q0071",
    topic: "Alertness",
    prompt: "Which of these would reduce how well you can see when driving at night?",
    options: [
      "Wearing tinted or dark glasses",
      "Wearing clear prescription glasses",
      "Keeping your windscreen clean",
      "Using dipped headlights",
    ],
    answer: 0,
    explanation:
      "Tinted or dark glasses cut the light reaching your eyes, so don't wear them in the dark. The other three all help you see.",
  },
  {
    id: "q0072",
    topic: "Hazard awareness",
    prompt:
      "Parked cars narrow the road on your side. An oncoming vehicle is approaching. What should you do?",
    options: [
      "Keep going — you have priority",
      "Give way to the oncoming vehicle",
      "Flash and drive through",
      "Speed up to get through first",
    ],
    answer: 1,
    explanation:
      "Where the obstruction is on your side, you should give way to oncoming traffic.",
  },
  {
    id: "q0073",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "speed-50",
    options: [
      "Maximum speed 50 mph",
      "Minimum speed 50 mph",
      "Recommended speed 50 mph",
      "End of 50 mph zone",
    ],
    answer: 0,
    explanation: "A red ring around a number sets the maximum speed limit — here, 50 mph.",
  },
  {
    id: "q0074",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "ahead-only",
    options: ["Ahead only", "No entry", "One-way street", "Give way ahead"],
    answer: 0,
    explanation:
      "A blue circle with a white upward arrow means you must go straight ahead only.",
  },
  {
    id: "q0075",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "warning-general",
    options: [
      "Other danger ahead — look for a plate",
      "No entry",
      "End of all restrictions",
      "Stop and give way",
    ],
    answer: 0,
    explanation:
      "A red triangle with an exclamation mark warns of another danger ahead, usually with a plate explaining what it is.",
  },
  {
    id: "q0076",
    topic: "Alertness",
    prompt:
      "Your view at a junction is blocked by parked cars. What should you do before pulling out?",
    options: [
      "Pull out quickly and hope it's clear",
      "Edge forward slowly until you can see",
      "Sound your horn and go",
      "Rely on the car's mirrors",
    ],
    answer: 1,
    explanation:
      "Creep forward slowly until you have a clear view in both directions, then emerge when it's safe.",
  },
  {
    id: "q0077",
    topic: "Alertness",
    prompt: "When should you set up or change your satnav?",
    options: [
      "While driving at low speed",
      "Before you set off, or after stopping somewhere safe",
      "At traffic lights",
      "Whenever you need to",
    ],
    answer: 1,
    explanation:
      "Programme your satnav before driving. If you need to change it, find a safe place to stop first.",
  },
  {
    id: "q0078",
    topic: "Attitude",
    prompt: "You're driving slowly and a queue of traffic builds up behind you. What should you do?",
    options: [
      "Speed up beyond your comfort",
      "Pull in where it's safe to let them pass",
      "Ignore them",
      "Brake to make them back off",
    ],
    answer: 1,
    explanation:
      "If you're holding up a queue, pull in safely when you can and let the traffic behind go by.",
  },
  {
    id: "q0079",
    topic: "Attitude",
    prompt: "As you approach a pedestrian crossing, what must you never do?",
    options: [
      "Slow down",
      "Overtake the vehicle nearest the crossing",
      "Stop for waiting pedestrians",
      "Give way to people crossing",
    ],
    answer: 1,
    explanation:
      "Never overtake the leading vehicle as you approach a crossing — a pedestrian could be hidden in front of it.",
  },
  {
    id: "q0080",
    topic: "Safety and your vehicle",
    prompt:
      "A red warning light stays lit on your dashboard after you start the engine. What should you do?",
    options: [
      "Carry on — it'll go off",
      "Don't drive until you've checked what it means",
      "Cover it with tape",
      "Only worry if the car stops",
    ],
    answer: 1,
    explanation:
      "A red warning light signals a potentially serious fault. Check it before driving — get help if unsure.",
  },
  {
    id: "q0081",
    topic: "Safety and your vehicle",
    prompt: "How should you dispose of used engine oil?",
    options: [
      "Pour it down the drain",
      "Take it to an oil-disposal or recycling site",
      "Bury it in the garden",
      "Put it in the normal bin",
    ],
    answer: 1,
    explanation:
      "Old engine oil is harmful to the environment. Take it to a proper disposal or recycling point.",
  },
  {
    id: "q0082",
    topic: "Safety and your vehicle",
    prompt: "When is the best time to check your engine oil and coolant levels?",
    options: [
      "Only at the annual service",
      "Regularly, and before a long journey",
      "Only if a warning light shows",
      "Never — the garage does it",
    ],
    answer: 1,
    explanation:
      "Check levels regularly and before long trips, so problems are caught before they leave you stranded.",
  },
  {
    id: "q0083",
    topic: "Safety margins",
    prompt: "Why is 'coasting' (rolling with the clutch down or in neutral) a bad habit?",
    options: [
      "It saves too much fuel",
      "It reduces your control over the car",
      "It charges the battery too fast",
      "It wears out the tyres",
    ],
    answer: 1,
    explanation:
      "Coasting removes engine braking and reduces your control of steering and braking, especially downhill.",
  },
  {
    id: "q0084",
    topic: "Safety margins",
    prompt: "In fog, you should always be able to stop within:",
    options: [
      "Twice the normal distance",
      "The distance you can see to be clear",
      "Three car lengths",
      "100 metres exactly",
    ],
    answer: 1,
    explanation:
      "Whatever the conditions, drive so you can stop well within the distance you can see to be clear.",
  },
  {
    id: "q0085",
    topic: "Hazard awareness",
    prompt: "How does alcohol affect your driving?",
    options: [
      "It improves concentration",
      "It slows reactions and impairs judgement",
      "It has no effect in small amounts",
      "It sharpens your reflexes",
    ],
    answer: 1,
    explanation:
      "Alcohol slows reactions, impairs judgement and gives false confidence. The safest amount before driving is none.",
  },
  {
    id: "q0086",
    topic: "Hazard awareness",
    prompt: "A bus is stopped at a bus stop on your left. What should you watch for?",
    options: [
      "Nothing — buses are predictable",
      "Pedestrians stepping out and the bus pulling away",
      "The bus reversing",
      "Passengers throwing litter",
    ],
    answer: 1,
    explanation:
      "People may step out in front of or behind the bus, and the bus may signal to pull away. Slow down and be ready.",
  },
  {
    id: "q0087",
    topic: "Vulnerable road users",
    prompt:
      "A pedestrian is carrying a white cane with a red band. What does this tell you?",
    options: [
      "They are a traffic warden",
      "They are deaf as well as blind",
      "They are a cyclist",
      "They are lost",
    ],
    answer: 1,
    explanation:
      "A white cane with a red band shows the person is deaf as well as blind. Give them extra time and care.",
  },
  {
    id: "q0088",
    topic: "Vulnerable road users",
    prompt: "When driving past a line of parked cars, what should you look out for?",
    options: [
      "Nothing in particular",
      "Doors opening and people stepping out",
      "Cars flashing their lights",
      "Faster traffic behind",
    ],
    answer: 1,
    explanation:
      "Watch for doors opening, pedestrians (especially children) stepping out, and cars pulling away.",
  },
  {
    id: "q0089",
    topic: "Vulnerable road users",
    prompt: "An older pedestrian is crossing slowly as your lights go green. What should you do?",
    options: [
      "Edge forward to hurry them",
      "Wait patiently until they've finished crossing",
      "Sound your horn",
      "Drive around them",
    ],
    answer: 1,
    explanation:
      "Give older and less mobile pedestrians the time they need. Never rush or intimidate someone who is crossing.",
  },
  {
    id: "q0090",
    topic: "Other types of vehicle",
    prompt: "Before overtaking a long, large vehicle, what should you do?",
    options: [
      "Move up close behind it",
      "Drop back so you can see further ahead",
      "Flash your lights",
      "Overtake on the left",
    ],
    answer: 1,
    explanation:
      "Hanging back improves your view past the vehicle, so you can see oncoming traffic before committing to overtake.",
  },
  {
    id: "q0091",
    topic: "Other types of vehicle",
    prompt: "A bus ahead is signalling to move off from a bus stop. What should you do?",
    options: [
      "Speed up to pass first",
      "Give way to it if it's safe to do so",
      "Sound your horn",
      "Overtake on the left",
    ],
    answer: 1,
    explanation:
      "Where safe, give way to a bus signalling to pull out — but don't put yourself or others at risk to do so.",
  },
  {
    id: "q0092",
    topic: "Vehicle handling",
    prompt: "When driving at night, you should dip your headlights when:",
    options: [
      "Driving on a motorway only",
      "Meeting oncoming traffic or following another vehicle",
      "Going round any bend",
      "It starts to rain",
    ],
    answer: 1,
    explanation:
      "Dip your lights for oncoming traffic and when following another vehicle, so you don't dazzle other drivers.",
  },
  {
    id: "q0093",
    topic: "Vehicle handling",
    prompt: "When may you use full-beam headlights?",
    options: [
      "In queuing traffic",
      "On an unlit road with no oncoming or vehicle ahead",
      "In fog",
      "In a well-lit town centre",
    ],
    answer: 1,
    explanation:
      "Use full beam on dark, unlit roads when there's no one to dazzle, and dip them as soon as anyone appears.",
  },
  {
    id: "q0094",
    topic: "Vehicle handling",
    prompt: "After driving slowly through deep water or a ford, what should you do?",
    options: [
      "Accelerate hard to dry the engine",
      "Test your brakes gently — they may be wet and less effective",
      "Nothing, brakes are unaffected",
      "Turn the engine off and on",
    ],
    answer: 1,
    explanation:
      "Wet brakes work poorly. Dry them by braking gently while moving slowly until they feel normal again.",
  },
  {
    id: "q0095",
    topic: "Motorway rules",
    prompt: "How should you join a motorway from a slip road?",
    options: [
      "Stop at the end and wait for a big gap",
      "Adjust your speed on the slip road and merge into a safe gap",
      "Force your way into the first lane",
      "Cross straight into the middle lane",
    ],
    answer: 1,
    explanation:
      "Build up to match the speed of traffic, then merge smoothly into a gap. Give way to traffic already on the motorway.",
  },
  {
    id: "q0096",
    topic: "Motorway rules",
    prompt: "Which lane should you normally drive in on a motorway?",
    options: [
      "The middle lane",
      "The left-hand lane",
      "The right-hand lane",
      "Any lane you like",
    ],
    answer: 1,
    explanation:
      "Keep to the left lane for normal driving. The other lanes are for overtaking — return left once you've passed.",
  },
  {
    id: "q0097",
    topic: "Motorway rules",
    prompt: "You start to feel tired while driving on a motorway. What should you do?",
    options: [
      "Open the window and carry on",
      "Leave at the next exit or services and rest",
      "Speed up to finish sooner",
      "Move to the left lane and slow down",
    ],
    answer: 1,
    explanation:
      "You can't stop on a motorway to rest, so leave at the next services or exit and take a proper break.",
  },
  {
    id: "q0098",
    topic: "Rules of the road",
    prompt:
      "There are street lights but no speed-limit signs. What is the speed limit likely to be?",
    options: ["20 mph", "30 mph", "40 mph", "60 mph"],
    answer: 1,
    explanation:
      "Street lighting usually means a 30 mph limit unless signs show otherwise.",
  },
  {
    id: "q0099",
    topic: "Rules of the road",
    prompt: "Where should you position your car to turn right at a junction?",
    options: [
      "Close to the left kerb",
      "Just left of the centre of the road",
      "In the middle of your lane",
      "It doesn't matter",
    ],
    answer: 1,
    explanation:
      "Position just left of the centre line so following traffic can pass on your left where there's room.",
  },
  {
    id: "q0100",
    topic: "Rules of the road",
    prompt:
      "On a narrow single-track road, a car comes the other way and the passing place is on your side. What should you do?",
    options: [
      "Carry on and make them reverse",
      "Pull into the passing place and let them through",
      "Flash your lights and drive on",
      "Stop in the middle of the road",
    ],
    answer: 1,
    explanation:
      "If the passing place is on your side, pull into it. If it's on their side, wait opposite it.",
  },
  {
    id: "q0101",
    topic: "Road and traffic signs",
    prompt: "Most signs that warn you of a hazard are which shape?",
    options: ["Circular", "Triangular", "Rectangular", "Octagonal"],
    answer: 1,
    explanation:
      "Warning signs are triangular with a red border. Circular signs give orders; rectangular ones give information.",
  },
  {
    id: "q0102",
    topic: "Road and traffic signs",
    prompt: "Signs that give orders — telling you what you must or must not do — are usually which shape?",
    options: ["Triangular", "Circular", "Rectangular", "Diamond"],
    answer: 1,
    explanation:
      "Order signs are circular. Red rings prohibit; blue circles give a positive instruction.",
  },
  {
    id: "q0103",
    topic: "Road and traffic signs",
    prompt: "A red circle around a sign generally means what?",
    options: [
      "Something you must not do",
      "A recommended action",
      "Tourist information",
      "A parking area",
    ],
    answer: 0,
    explanation:
      "Red circles tell you something is prohibited — for example a speed limit or 'no entry'.",
  },
  {
    id: "q0104",
    topic: "Road and traffic signs",
    prompt: "What does this sign mean?",
    sign: "roundabout",
    options: ["Roundabout ahead", "Right turn only", "No through road", "Ring road"],
    answer: 0,
    explanation:
      "A blue circle with three curved arrows means a roundabout ahead — give way to traffic from your right.",
  },
  {
    id: "q0105",
    topic: "Documents",
    prompt: "You move house. What must you do about your driving licence?",
    options: [
      "Nothing",
      "Tell DVLA and update your address",
      "Wait until it expires",
      "Only tell your insurer",
    ],
    answer: 1,
    explanation:
      "You must tell DVLA when you change address and update your licence — it's an offence not to.",
  },
  {
    id: "q0106",
    topic: "Vulnerable road users",
    prompt:
      "You're turning into a side road and pedestrians are waiting to cross it. What should you do?",
    options: [
      "Turn before they step out",
      "Give way and let them cross",
      "Sound your horn",
      "Only stop if they've already started",
    ],
    answer: 1,
    explanation:
      "Since 2022, you should give way to pedestrians waiting to cross — as well as those already crossing — the road you're turning into or out of.",
  },
  {
    id: "q0107",
    topic: "Motorway rules",
    prompt: "When is a learner driver allowed to drive on a motorway?",
    options: [
      "Never, until they pass their test",
      "With any full licence holder over 21",
      "Only with an approved driving instructor in a car with dual controls",
      "Whenever they feel ready",
    ],
    answer: 2,
    explanation:
      "Since 2018, learners may take motorway lessons, but only with an approved driving instructor in a dual-control car.",
  },
  {
    id: "q0108",
    topic: "Vulnerable road users",
    prompt:
      "A cyclist ahead is riding well out towards the middle of the lane. What should you do?",
    options: [
      "Beep so they move over",
      "Be patient — they may be making themselves visible or avoiding hazards",
      "Squeeze past closely",
      "Drive close behind to hurry them",
    ],
    answer: 1,
    explanation:
      "Cyclists are taught to ride away from the kerb to be seen and stay safe. Hang back and overtake only when there's room.",
  },
  {
    id: "q0109",
    topic: "Vehicle handling",
    prompt: "You're parking facing downhill. What should you do with your front wheels?",
    options: [
      "Turn them away from the kerb",
      "Turn them towards the kerb",
      "Leave them straight",
      "It makes no difference",
    ],
    answer: 1,
    explanation:
      "Facing downhill, turn the wheels towards the kerb and use the handbrake, so the car can't roll into the road.",
  },
  {
    id: "q0110",
    topic: "Safety margins",
    prompt: "What most often causes a vehicle to skid?",
    options: [
      "The weather alone",
      "The driver braking, steering or accelerating too harshly",
      "Worn-out brake lights",
      "Driving too slowly",
    ],
    answer: 1,
    explanation:
      "Skids are usually caused by the driver going too fast for the conditions and braking, steering or accelerating too sharply.",
  },
  {
    id: "q0111",
    topic: "Safety and your vehicle",
    prompt: "When should you check your tyre pressures?",
    options: [
      "When the tyres are cold",
      "Straight after a long, fast drive",
      "Only when a tyre looks flat",
      "Only at an MOT",
    ],
    answer: 0,
    explanation:
      "Check pressures when the tyres are cold — hot tyres read higher and give a false figure.",
  },
  {
    id: "q0112",
    topic: "Safety and your vehicle",
    prompt: "Who is responsible for making sure a child under 14 is wearing a seat belt or using a restraint?",
    options: ["The child", "A passenger", "The driver", "Nobody"],
    answer: 2,
    explanation:
      "The driver is legally responsible for ensuring passengers under 14 are properly restrained.",
  },
  {
    id: "q0113",
    topic: "Safety and your vehicle",
    prompt: "How should a head restraint be adjusted?",
    options: [
      "As low as possible",
      "So the top is at least level with the top of your ears",
      "Tilted fully forward",
      "Removed for comfort",
    ],
    answer: 1,
    explanation:
      "A correctly set head restraint (top level with the top of your ears, close to your head) helps prevent neck injury in a crash.",
  },
  {
    id: "q0114",
    topic: "Rules of the road",
    prompt: "You park at night on a road with a speed limit above 30 mph. What must you do?",
    options: [
      "Leave your parking (side) lights on",
      "Leave your hazard lights flashing",
      "Leave full-beam headlights on",
      "Nothing extra is needed",
    ],
    answer: 0,
    explanation:
      "On roads with a limit over 30 mph you must leave parking lights on when parked at night, so others can see your car.",
  },
  {
    id: "q0115",
    topic: "Rules of the road",
    prompt:
      "You're crossing a railway level crossing when the amber light comes on and the alarm sounds. What should you do?",
    options: [
      "Stop immediately on the crossing",
      "Reverse off the crossing",
      "Keep going and clear the crossing",
      "Get out of the car",
    ],
    answer: 2,
    explanation:
      "If you're already on the crossing when the warning starts, keep going and clear it — don't stop or reverse.",
  },
  {
    id: "q0116",
    topic: "Rules of the road",
    prompt: "Where must you NOT park or stop?",
    options: [
      "In a marked bay",
      "On the brow of a hill",
      "On a wide, quiet street",
      "In a lay-by",
    ],
    answer: 1,
    explanation:
      "Never park where you'd reduce visibility, such as on the brow of a hill or near a bend — others can't see past you.",
  },
  {
    id: "q0117",
    topic: "Rules of the road",
    prompt: "On a one-way street, where should you position to turn right?",
    options: [
      "In the left-hand lane",
      "In the right-hand lane",
      "In the centre only",
      "Anywhere you like",
    ],
    answer: 1,
    explanation:
      "On a one-way street you can use either side, so move into the right-hand lane in good time to turn right.",
  },
  {
    id: "q0118",
    topic: "Road and traffic signs",
    prompt: "What do brown road signs point you towards?",
    options: [
      "Motorways",
      "Tourist attractions",
      "Roadworks",
      "Emergency services",
    ],
    answer: 1,
    explanation:
      "Brown signs direct you to tourist and leisure attractions.",
  },
  {
    id: "q0119",
    topic: "Road and traffic signs",
    prompt: "A road sign is octagonal (eight-sided). What does it mean?",
    options: ["Give way", "Stop", "No entry", "Roundabout"],
    answer: 1,
    explanation:
      "Only the STOP sign is octagonal — its unique shape means you can recognise it even if it's covered in snow.",
  },
  {
    id: "q0120",
    topic: "Road and traffic signs",
    prompt: "What do double yellow lines along the edge of the road mean?",
    options: [
      "No waiting at any time",
      "Waiting allowed for one hour",
      "Loading only",
      "Free parking",
    ],
    answer: 0,
    explanation:
      "Double yellow lines mean no waiting at any time. You may still be allowed to drop off or pick up briefly.",
  },
  {
    id: "q0121",
    topic: "Road and traffic signs",
    prompt: "What does a single yellow line along the kerb mean?",
    options: [
      "No stopping ever",
      "Waiting restrictions apply at certain times — check the sign",
      "Free parking at all times",
      "Bus lane",
    ],
    answer: 1,
    explanation:
      "A single yellow line means waiting is restricted at the times shown on the nearby sign.",
  },
  {
    id: "q0122",
    topic: "Motorway rules",
    prompt: "You've finished overtaking on a three-lane motorway and the left lane is clear. What should you do?",
    options: [
      "Stay in the middle lane",
      "Move back to the left lane",
      "Stay in the right lane",
      "Slow right down",
    ],
    answer: 1,
    explanation:
      "Always return to the left once you've overtaken. Sitting in the middle lane (lane hogging) holds up traffic and is an offence.",
  },
  {
    id: "q0123",
    topic: "Motorway rules",
    prompt: "A speed limit is shown in a red ring on a motorway gantry sign. What does it mean?",
    options: [
      "It's only advisory",
      "It's a mandatory limit you must not exceed",
      "It applies to lorries only",
      "It's the minimum speed",
    ],
    answer: 1,
    explanation:
      "A speed shown in a red ring on a gantry is a mandatory limit — usually to manage congestion — and you must not exceed it.",
  },
  {
    id: "q0124",
    topic: "Motorway rules",
    prompt:
      "Your car develops a problem on a smart motorway with no hard shoulder. What's the best thing to do?",
    options: [
      "Stop in the left lane straight away",
      "Reach an emergency refuge area or the next exit if you can",
      "Stop in the middle lane",
      "Reverse to the last junction",
    ],
    answer: 1,
    explanation:
      "Try to reach an emergency refuge area or leave at the next exit. If you can't, get as far left as possible, put hazards on and call for help.",
  },
  {
    id: "q0125",
    topic: "Other types of vehicle",
    prompt: "Why should you take care around trams?",
    options: [
      "They can speed up suddenly",
      "They can't steer to avoid you and take longer to stop",
      "They have no driver",
      "They always have priority over pedestrians",
    ],
    answer: 1,
    explanation:
      "Trams run on fixed rails, so they can't swerve and need a long distance to stop. Don't drive or park on the rails.",
  },
  {
    id: "q0126",
    topic: "Other types of vehicle",
    prompt: "A vehicle ahead has a flashing amber beacon. What does this tell you?",
    options: [
      "It's an ambulance",
      "It's a slow-moving or large vehicle",
      "It's broken down",
      "It's a police car",
    ],
    answer: 1,
    explanation:
      "A flashing amber beacon warns that a vehicle is slow-moving or large, such as a gritter or road-maintenance vehicle.",
  },
  {
    id: "q0127",
    topic: "Hazard awareness",
    prompt: "When should you check your mirrors?",
    options: [
      "Only when reversing",
      "Before signalling, changing speed or changing direction",
      "Only on motorways",
      "Once at the start of a journey",
    ],
    answer: 1,
    explanation:
      "Use Mirrors–Signal–Manoeuvre: always check your mirrors in good time before you signal, change speed or change direction.",
  },
  {
    id: "q0128",
    topic: "Hazard awareness",
    prompt:
      "A large vehicle is parked near a junction and blocks your view as you wait to emerge. What should you do?",
    options: [
      "Pull out and hope it's clear",
      "Wait, edging out only when you can see it's safe",
      "Sound your horn and go",
      "Follow the car in front blindly",
    ],
    answer: 1,
    explanation:
      "Don't commit until you can actually see the road is clear. Edge out slowly only as far as your view allows.",
  },
  {
    id: "q0129",
    topic: "Attitude",
    prompt: "You're feeling angry or upset. How might this affect your driving?",
    options: [
      "It improves your focus",
      "It can reduce your concentration and judgement",
      "It has no effect",
      "It makes you a safer driver",
    ],
    answer: 1,
    explanation:
      "Strong emotions distract you and impair judgement. Calm down before you drive, or pull over safely until you feel settled.",
  },
  {
    id: "q0130",
    topic: "Attitude",
    prompt: "There's a bus lane on your route with operating times shown on a sign. When may you drive in it?",
    options: [
      "Whenever it's empty",
      "Only outside its hours of operation, as shown on the sign",
      "Never",
      "Only at night",
    ],
    answer: 1,
    explanation:
      "Check the sign — you may use the bus lane only outside the times it's reserved for buses (and permitted users).",
  },
  {
    id: "q0131",
    topic: "Vehicle loading",
    prompt: "While towing a trailer, it starts to swing from side to side (snaking). What should you do?",
    options: [
      "Brake hard",
      "Ease off the accelerator and slow down gently",
      "Accelerate to straighten it",
      "Steer sharply against the swing",
    ],
    answer: 1,
    explanation:
      "Ease off gently and let your speed drop. Braking hard or steering sharply can make the snaking worse.",
  },
  {
    id: "q0132",
    topic: "Vehicle loading",
    prompt: "How should a load be arranged in or on your vehicle?",
    options: [
      "Piled to one side",
      "Spread evenly and secured",
      "Loose so it can settle",
      "As high as possible",
    ],
    answer: 1,
    explanation:
      "Distribute weight evenly and secure it so the load can't move, which keeps the vehicle stable and safe.",
  },
  {
    id: "q0133",
    topic: "Alertness",
    prompt: "Which of these should you avoid doing?",
    options: [
      "Reversing into a side road from a main road",
      "Reversing from a side road into a main road",
      "Checking your blind spots",
      "Using your mirrors",
    ],
    answer: 1,
    explanation:
      "Never reverse from a side road into a main road. If you need to turn around, reverse into a side road instead.",
  },
  {
    id: "q0134",
    topic: "Incidents and emergencies",
    prompt: "You can smell petrol and see smoke from under the bonnet. What should you do?",
    options: [
      "Open the bonnet fully to look",
      "Stop, get everyone out and well away, and call 999",
      "Keep driving to a garage",
      "Pour water over the engine",
    ],
    answer: 1,
    explanation:
      "Stop safely, get everyone out and clear of the car, and call the fire service. Don't open the bonnet fully — air can feed the fire.",
  },
  {
    id: "q0135",
    topic: "Incidents and emergencies",
    prompt: "Someone involved in a crash appears to be in shock. How should you help?",
    options: [
      "Give them a hot drink",
      "Keep them warm, comfortable and reassured",
      "Make them walk it off",
      "Leave them alone",
    ],
    answer: 1,
    explanation:
      "Reassure them, keep them warm and comfortable, and don't give food or drink. Get medical help.",
  },
  {
    id: "q0136",
    topic: "Alertness",
    prompt: "What is the minimum distance you must be able to read a car number plate from?",
    options: ["10 metres", "20 metres", "50 metres", "100 metres"],
    answer: 1,
    explanation:
      "You must be able to read a modern number plate from 20 metres, with glasses or lenses if you need them.",
  },
  {
    id: "q0137",
    topic: "Alertness",
    prompt: "On a long motorway journey, how often should you take a break?",
    options: [
      "Only when you feel exhausted",
      "At least every two hours",
      "Every six hours",
      "Breaks aren't necessary",
    ],
    answer: 1,
    explanation:
      "Plan a rest of at least 15 minutes after every two hours of driving to stay alert.",
  },
  {
    id: "q0138",
    topic: "Attitude",
    prompt: "You're behind a learner driver who stalls at a junction. What should you do?",
    options: [
      "Sound your horn repeatedly",
      "Be patient and give them time",
      "Drive very close to hurry them",
      "Overtake on a blind bend",
    ],
    answer: 1,
    explanation:
      "Stay patient with learners — everyone has to start somewhere. Pressuring them makes mistakes more likely.",
  },
  {
    id: "q0139",
    topic: "Attitude",
    prompt: "When is it appropriate to sound your horn?",
    options: [
      "To show anger at another driver",
      "To let other road users know you're there",
      "To tell someone to hurry up",
      "To greet a friend",
    ],
    answer: 1,
    explanation:
      "The horn is only to warn others of your presence — never to vent anger. Don't use it when stationary or in a built-up area at night.",
  },
  {
    id: "q0140",
    topic: "Safety and your vehicle",
    prompt: "Your car pulls to one side whenever you brake. What does this suggest?",
    options: [
      "It's completely normal",
      "A braking fault that should be checked",
      "The tyres are over-inflated",
      "You're braking too gently",
    ],
    answer: 1,
    explanation:
      "Pulling to one side under braking points to a fault. Get the brakes checked before driving far.",
  },
  {
    id: "q0141",
    topic: "Safety and your vehicle",
    prompt: "What is the purpose of a catalytic converter?",
    options: [
      "To increase top speed",
      "To reduce harmful exhaust emissions",
      "To make the engine louder",
      "To improve the radio signal",
    ],
    answer: 1,
    explanation:
      "A catalytic converter cuts the harmful gases in your exhaust, reducing the car's impact on air quality.",
  },
  {
    id: "q0142",
    topic: "Safety and your vehicle",
    prompt: "Your steering suddenly becomes much heavier than usual. What's the likely cause?",
    options: [
      "Perfectly normal in cold weather",
      "A power-steering fault to be checked",
      "The handbrake is on",
      "Low screen-wash",
    ],
    answer: 1,
    explanation:
      "Unusually heavy steering can mean a power-steering fault (low fluid or a broken belt). Have it checked.",
  },
  {
    id: "q0143",
    topic: "Vehicle loading",
    prompt: "When should you fit extended towing mirrors?",
    options: [
      "Never — standard mirrors are fine",
      "When the caravan or trailer is wider than the car",
      "Only at night",
      "Only on motorways",
    ],
    answer: 1,
    explanation:
      "If your trailer or caravan is wider than the car, fit towing mirrors so you can see clearly behind.",
  },
  {
    id: "q0144",
    topic: "Safety margins",
    prompt: "In icy conditions, your stopping distance can be how much greater than on a dry road?",
    options: ["Twice as much", "Up to ten times as much", "The same", "Half as much"],
    answer: 1,
    explanation:
      "On ice, stopping distances can be up to ten times longer. Slow right down and leave a huge gap.",
  },
  {
    id: "q0145",
    topic: "Safety margins",
    prompt: "You're driving through a contraflow system. What should you do?",
    options: [
      "Keep your normal speed",
      "Reduce speed and keep a safe distance from the vehicle ahead",
      "Overtake whenever you can",
      "Drive close to the cones",
    ],
    answer: 1,
    explanation:
      "In a contraflow, lanes are narrower and traffic is two-way. Slow down, obey the limit and keep your distance.",
  },
  {
    id: "q0146",
    topic: "Hazard awareness",
    prompt: "What is the rule about driving after taking illegal drugs?",
    options: [
      "Fine if you feel okay",
      "Never drive — they impair you and can stay in your system for a long time",
      "Allowed after a few hours",
      "Only a problem at night",
    ],
    answer: 1,
    explanation:
      "Never drive on illegal drugs. They impair judgement and reactions and can remain in your system for a long time.",
  },
  {
    id: "q0147",
    topic: "Hazard awareness",
    prompt: "You're approaching a blind bend or a humpback bridge. What should you do?",
    options: [
      "Maintain speed and hope it's clear",
      "Slow down and be ready to stop",
      "Sound your horn and accelerate",
      "Move to the right for a better view",
    ],
    answer: 1,
    explanation:
      "You can't see what's coming, so ease off and be ready to stop — there may be an oncoming vehicle or hazard.",
  },
  {
    id: "q0148",
    topic: "Vulnerable road users",
    prompt: "A school crossing patrol steps out and shows their STOP sign. What must you do?",
    options: [
      "Slow down only",
      "Stop and wait until they return to the kerb",
      "Drive round them",
      "Carry on if no children are visible",
    ],
    answer: 1,
    explanation:
      "You must stop for a school crossing patrol and wait until they've finished and stepped back.",
  },
  {
    id: "q0149",
    topic: "Vulnerable road users",
    prompt: "In slow-moving traffic, a motorcyclist may filter between the lanes. Before you change lane you should:",
    options: [
      "Move over quickly",
      "Check your mirrors and blind spots for motorcyclists",
      "Open your door to signal",
      "Sound your horn",
    ],
    answer: 1,
    explanation:
      "Motorcyclists filtering through traffic are easy to miss. Always check mirrors and blind spots before moving.",
  },
  {
    id: "q0150",
    topic: "Vulnerable road users",
    prompt: "You see an ice cream van stopped on the other side of the road. What should you do?",
    options: [
      "Speed past while you can",
      "Slow down — children may run out to or from it",
      "Sound your horn",
      "Ignore it",
    ],
    answer: 1,
    explanation:
      "Children can dash out around an ice cream van without looking. Slow right down and be ready to stop.",
  },
  {
    id: "q0151",
    topic: "Other types of vehicle",
    prompt: "A long vehicle ahead is signalling left but moves out to the right first. What should you do?",
    options: [
      "Overtake on its left",
      "Stay back and don't try to pass on either side",
      "Sound your horn",
      "Squeeze through on the inside",
    ],
    answer: 1,
    explanation:
      "Long vehicles swing wide to make tight turns. Never try to pass on the inside — hold back and wait.",
  },
  {
    id: "q0152",
    topic: "Other types of vehicle",
    prompt: "It's very windy and there's a motorcyclist ahead. Why should you give them extra room?",
    options: [
      "They always ride too slowly",
      "A gust could blow them off course",
      "They can't see you",
      "Their bike is louder",
    ],
    answer: 1,
    explanation:
      "Strong gusts can push a motorcyclist sideways, so leave plenty of space when following or overtaking.",
  },
  {
    id: "q0153",
    topic: "Vehicle handling",
    prompt: "How should you move off on packed snow or ice?",
    options: [
      "Rev hard in first gear",
      "Pull away gently, using a higher gear to avoid wheelspin",
      "Brake and accelerate together",
      "Spin the wheels to get grip",
    ],
    answer: 1,
    explanation:
      "Gentle acceleration in a higher gear (often second) reduces wheelspin and helps you get moving on snow.",
  },
  {
    id: "q0154",
    topic: "Vehicle handling",
    prompt: "When is it appropriate to use your hazard warning lights?",
    options: [
      "To park on double yellow lines",
      "When stopped and temporarily obstructing traffic, or to warn of a hazard",
      "To drive faster in the rain",
      "Whenever it's dark",
    ],
    answer: 1,
    explanation:
      "Use hazard lights when your stationary vehicle is causing an obstruction, or briefly to warn following traffic of a hazard ahead.",
  },
  {
    id: "q0155",
    topic: "Vehicle handling",
    prompt: "You reach a flooded ford. How should you drive through it?",
    options: [
      "Quickly to avoid stalling",
      "Slowly in a low gear, after checking the depth",
      "In your highest gear",
      "With the engine switched off",
    ],
    answer: 1,
    explanation:
      "Check the depth first, then drive through slowly in a low gear. Test your brakes gently once you're through.",
  },
  {
    id: "q0156",
    topic: "Motorway rules",
    prompt: "What colour are the reflective studs along the left-hand edge of a motorway?",
    options: ["White", "Amber", "Red", "Green"],
    answer: 2,
    explanation:
      "Red studs mark the left edge. White separate the lanes, amber mark the right edge and green mark slip roads.",
  },
  {
    id: "q0157",
    topic: "Motorway rules",
    prompt: "What is a crawler (climbing) lane on a motorway used for?",
    options: [
      "Overtaking at speed",
      "Slow-moving vehicles going uphill",
      "Emergency stops",
      "Turning around",
    ],
    answer: 1,
    explanation:
      "A crawler lane gives slow vehicles, such as heavy lorries, a lane to use on a steep uphill section.",
  },
  {
    id: "q0158",
    topic: "Motorway rules",
    prompt: "Your car has broken down on the hard shoulder. How do you find the nearest emergency phone?",
    options: [
      "Walk in any direction",
      "Follow the arrows on the marker posts",
      "Cross the carriageway",
      "Wait by the car",
    ],
    answer: 1,
    explanation:
      "Marker posts along the hard shoulder have arrows pointing to the nearest emergency telephone.",
  },
  {
    id: "q0159",
    topic: "Rules of the road",
    prompt: "Two lanes of traffic are merging into one. What's the correct approach?",
    options: [
      "Force your way in first",
      "Merge in turn, taking it in turns with the other lane",
      "Block the other lane",
      "Speed up to get ahead",
    ],
    answer: 1,
    explanation:
      "Where lanes merge, take turns ('merge in turn'). It keeps traffic flowing and avoids conflict.",
  },
  {
    id: "q0160",
    topic: "Rules of the road",
    prompt: "How close to a junction are you allowed to park?",
    options: [
      "Right up to the corner",
      "Not within 10 metres, unless in a marked bay",
      "Within 2 metres",
      "Anywhere outside rush hour",
    ],
    answer: 1,
    explanation:
      "Don't park within 10 metres (32 feet) of a junction — it blocks visibility for everyone turning.",
  },
  {
    id: "q0161",
    topic: "Rules of the road",
    prompt: "How should you turn left into a side road?",
    options: [
      "Swing out to the right first",
      "Keep well to the left and don't swing wide",
      "Cut the corner across the kerb",
      "Straddle both lanes",
    ],
    answer: 1,
    explanation:
      "Keep to the left and turn tidily. Swinging out can mislead others and put cyclists on your left at risk.",
  },
  {
    id: "q0162",
    topic: "Documents",
    prompt: "A car kept on a public road must be:",
    options: [
      "Taxed and insured",
      "Only insured",
      "Only taxed",
      "Neither, if it's not driven",
    ],
    answer: 0,
    explanation:
      "A vehicle on a public road must be taxed and insured. If it's kept off-road and unused, you must declare a SORN.",
  },
  {
    id: "q0163",
    topic: "Incidents and emergencies",
    prompt: "Your vehicle breaks down in a tunnel. What should you do?",
    options: [
      "Stay in the car with the engine running",
      "Switch on hazard lights, leave the vehicle and call from an emergency point",
      "Attempt repairs in the lane",
      "Reverse out of the tunnel",
    ],
    answer: 1,
    explanation:
      "Put your hazard lights on, switch off the engine, leave the vehicle and use an emergency point to call for help.",
  },
  {
    id: "q0164",
    topic: "Incidents and emergencies",
    prompt: "How should you treat someone's burn at the scene of an incident?",
    options: [
      "Apply butter or cream",
      "Cool it with clean, cold water for at least ten minutes",
      "Burst any blisters",
      "Cover it tightly and leave it",
    ],
    answer: 1,
    explanation:
      "Cool a burn with clean cold water for at least ten minutes. Don't remove anything stuck to it.",
  },
  {
    id: "q0165",
    topic: "Incidents and emergencies",
    prompt: "You reverse into a parked car and the owner is nowhere to be found. What must you do?",
    options: [
      "Drive off — it was an accident",
      "Leave your details, or report it to the police within 24 hours",
      "Leave a note only if there's damage you can see",
      "Wait five minutes then go",
    ],
    answer: 1,
    explanation:
      "You must leave your details for the owner. If you can't, report it to the police as soon as you can and within 24 hours.",
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
