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
    prompt: "Another driver flashes their headlights at you. What should you assume this means?",
    options: [
      "They are letting you know they are there",
      "It is always an invitation to go",
      "They are angry with you",
      "Their lights are faulty",
    ],
    answer: 0,
    explanation:
      "Officially, flashing headlights just means 'I am here'. Don't assume it's an invitation — check for yourself before acting.",
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
    prompt: "You've been prescribed medicine that can cause drowsiness. What should you do?",
    options: [
      "Drive only on short trips",
      "Not drive until you know it won't affect you",
      "Drive with the window open",
      "Take a double dose to wear it off",
    ],
    answer: 1,
    explanation:
      "Check with your doctor or pharmacist. Don't drive if a medicine could make you drowsy or affect your driving.",
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
    prompt: "What should you NOT wear when driving at night?",
    options: [
      "A clear pair of glasses",
      "Tinted or dark glasses",
      "Comfortable shoes",
      "A warm coat",
    ],
    answer: 1,
    explanation:
      "Tinted or dark glasses reduce how much you can see at night and should not be worn while driving in the dark.",
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
