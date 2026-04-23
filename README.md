# React.js Conf 2015 — Conference Companion

A spatial conference day app built as a take-home for tldraw.

---

## The idea

Most people see "conference schedule" and build a list. I didn't want to build a list.

tldraw is a spatial company. It builds tools where thinking happens on a canvas, not in a scroll. So the question I asked myself wasn't "how do I display this data?" — it was "what does this conference feel like as a place, and how do I make the software feel like being there?"

The answer was a festival map. Time flows left to right on the X axis. Stages stack on the Y axis. You don't scroll — you pan and zoom. You can pull back and see the shape of the entire day at once, or lean in close to read a single talk's description. The schedule becomes a surface you move through, not a document you read.

I have an art history background before I moved into engineering, and I think that's where a lot of these decisions come from. There's a concept in museum design called "progressive disclosure" — the idea that information has distance. You earn the detail by getting close. A Rothko reads differently from across the room than it does from two feet away. That's the interaction model here: coloured blocks at a distance, speaker names as you approach, full descriptions only when you're right up close.

---

## Design decisions worth talking through

**The festival metaphor over a grid**

Conference schedules are usually presented as grids or lists — passive documents. I wanted this to feel like a Glastonbury lineup poster that you can actually interact with. The most important talks are visually dominant: bigger, bolder, full colour fill. Supporting talks are quieter. You understand the hierarchy before you read a single word.

The priority ranking is evidence-based, not arbitrary. The Keynote, React Native announcement, and Relay preview are headliners because of their historical significance — React Native was its world premiere, Relay became one of the most impactful things to come out of the conference. That's a product opinion I'm willing to defend.

**The two-lane layout**

The real React Conf 2015 had one stage. I split talks into a Main Stage and Workshop lane based on audience intent, not physical location. This is a deliberate fiction in service of the festival metaphor — it makes overlaps visible, which is the most useful thing a conference schedule can do. When two talks share the same time window, a faint amber band highlights the clash so you can make an informed choice.

**The Now line and scrubber**

Attendees care most about two things: what's happening right now, and what they need to go to next. The red Now line cuts through the canvas at the current time. The "Now" and "Up Next" badges update in real time as you drag the scrubber. The currently playing talk pulses red. The next talk pulses amber. This is the feature I'd point to as the clearest UX opinion in the app.

**The networking lobby**

The biggest unsolved problem at conferences isn't the schedule — it's the hallway. You meet someone, connect on LinkedIn, and three weeks later you have no idea who they are or where you met them. The My Card feature gives you a QR code that links to your LinkedIn, and logs every scan with a name, role, company, and timestamp tied to the scrubber time. You leave the conference with a record of exactly who you met and when.

**The Minimap**

A minimap showing your current viewport position within the world is a core spatial navigation pattern. Building it here was a deliberate signal that I understand the product and the design space.

---

## Technical decisions

**Coordinate engine**

Everything spatial in the app derives from one formula:

```ts
worldX  = (screenX - pan.x) / zoom   // screen → world
screenX = worldX * zoom + pan.x       // world → screen
```

Talk positions are calculated from `startTime` in minutes-from-midnight and a `PIXELS_PER_MINUTE` constant. This means the layout is entirely data-driven — change a talk's start time and it moves on the canvas automatically.

**Performance**

The canvas uses `transform: translate3d()` for pan and zoom rather than updating individual element positions. This keeps layout thrashing out of the hot path and ensures smooth 60fps panning even with many talk blocks rendered simultaneously.

**TypeScript**

Types aren't bolted on — they drove the design. `Priority`, `Stage`, `Tag`, and `Day` are all union types, not strings. The coordinate helpers are typed. The style objects use `satisfies Record<string, React.CSSProperties>` for compile-time checking. Shared constants live in one place and are imported everywhere they're needed.

**Progressive disclosure**

Text opacity is tied to zoom level with separate thresholds for speaker names and talk titles. At minimum zoom (0.5x) you see coloured blocks. Speaker names appear fully at 0.6x. Titles fade in between 0.7x and 0.9x. Full descriptions appear above 1.2x. This is implemented as a simple linear interpolation, not a breakpoint system — it feels smooth rather than snapping.

---

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- qrcode.react for QR generation

The spatial engine is built from scratch using DOM transforms — partly as a challenge, partly because understanding it from first principles is the point. I built it this way to demonstrate my understanding of coordinate math and DOM transforms, which would allow me to contribute more effectively to tldraw's own core engine.

---

## What I'd do with more time

**Conflict detector**

Let attendees star talks they want to attend, then flag when two starred talks overlap in time. The product opinion behind this: attendees shouldn't have to do the mental arithmetic themselves — the tool should surface the conflict and force a conscious choice.

**Talk duration tooltip on hover**

On mouse hover, a small floating label appears showing the talk's time window — `10:00am — 10:30am · 30 min`. Positioned using the `worldToScreen` conversion so it follows the block correctly at any zoom level. Small detail, but the kind of thing that makes a tool feel finished.

**Venue map layer**

A floor plan of Facebook HQ overlaid on the canvas showing where each stage physically is, with a "You Are Here" marker. The most spatial feature on the list and the one most directly inspired by tldraw's DNA.

**Real scan tracking**

Right now connections are simulated. A lightweight backend — even just a Supabase table — would make the QR feature genuinely useful. The interaction model is complete and ready to wire up.

**Persist state to localStorage**

Your saved talks, connections, and LinkedIn URL should survive a page refresh. One `useEffect` per piece of state.