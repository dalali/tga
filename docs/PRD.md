# TGA — Product Requirements Document

**Version:** 1.0 (Analysis iteration 1)
**Status:** Draft — awaiting architecture decision on tech stack
**Date:** 2026-05-21
**Author:** systems-analyst (autonomous)

---

## 1. Vision

TGA is a love-letter clone of *Grand Theft Auto* (DMA Design, 1997) — a top-down, tile-based open-world crime game where the player drives, shoots, steals cars, completes missions, and evades the police across a single fictional city. The MVP is a single-player browser-playable game that captures the **feel** of GTA 1: zoomed-out vehicular chaos with a four-star wanted system, a phone-triggered mission loop, and a money-and-multiplier scoring system.

We are **not** rebuilding the full game. We are shipping the smallest playable slice that recognisably feels like GTA 1.

## 2. Why now / who cares

- Audience: nostalgia-driven indie game players and the project owner. This is a portfolio / hobby build, not a commercial product.
- Distribution: browser-playable (zero install). The user explicitly wants to know the tech stack before code is written — see §10.
- Success: a single player can load the page, drive a car, run over a pedestrian, get a wanted star, evade or die, earn money, complete one mission, and finish a level.

## 3. Scope

### 3.1 In scope (MVP)

- **One city** (Liberty City flavour) rendered as a tile-based 2D top-down map roughly 128×128 tiles (~2048×2048 px at 16 px/tile). Streets, sidewalks, buildings (as impassable tiles), water/edges.
- **Player character** rendered as a top-down sprite. Walks on foot, can enter/exit any car within proximity.
- **Vehicles** (≥3 distinct types: sedan, sports, truck) with simple car-feel physics (acceleration, top speed, turn radius, drift on hard turn). Cars can be driven, parked, crashed, and destroyed.
- **NPCs** — pedestrians wandering sidewalks (simple wander AI), driver NPCs in cars (basic lane-follow AI). Limited counts (target: 20 pedestrians, 10 cars on screen).
- **Wanted system** — 0 to 4 "stars" (police heads). Stars rise from crimes (running people over, shooting them, damaging cop cars). Cops chase at higher stars; SWAT analogue at 4 stars. Stars bleed off after a "Pay 'n Spray" equivalent or time spent un-spotted.
- **Combat** — player can carry a pistol (and one upgrade: machine gun). Top-down click-to-shoot or facing-direction-fire. Pedestrians and cops die in 1–3 hits. Player has HP (no armour in MVP).
- **Money / score** — running people over, finishing missions, blowing up cars all award $. Multiplier increments by completing a mission. Reach **$50,000 target score** to "complete the level."
- **Missions (≥1 working, target 3)** — answer a ringing payphone to start. Mission types for MVP: (a) deliver-a-car (drive vehicle X to point Y in time T), (b) kill-a-target (assassinate a marked NPC), (c) bank-getaway (drive away after a crime trigger). Failure if player dies, runs out of time, or destroys the mission vehicle.
- **Death/respawn** — losing all HP "busts" the player: respawn at the nearest hospital tile, lose weapons + some money, wanted level cleared.
- **HUD** — score (top-left), wanted stars (top-right), mini-map (bottom-left), HP/weapon (bottom-right), mission-prompt strip (top-centre when active).
- **Sound** — engine, gunshot, siren, pedestrian scream, money pickup. Single looping "city ambience" music track. All optional / muteable.
- **Save** — none in MVP. Each page-load is a fresh run.

### 3.2 Out of scope (NOT MVP)

- Multiple cities, Vice City and San Andreas levels.
- Multiplayer.
- Persistent save / accounts.
- Mobile/touch controls (desktop keyboard + mouse only).
- Full mission tree from original game.
- Original GTA 1 assets (we will use newly-made or CC-licensed art).
- Boats, trains, tanks, motorcycles.
- Customisation (skins, cars, paint).
- Achievement/leaderboard system.
- Translations (English only).

### 3.3 Stretch goals (post-MVP, not for v1)

- Day/night cycle.
- Radio stations with multiple tracks.
- Pay 'n Spray + Ammu-Nation pickup tiles as interactable POIs.
- Tank/SWAT escalation at 5+ stars.

## 4. Users & user stories

**Persona:** "Casual nostalgist." Sits at a desktop, fires up a browser, plays for 5–20 minutes, expects WASD/arrow movement and recognisable GTA feel.

User stories (numbered for QA traceability):

1. **US-1** — As a player, when I load the game URL, I see a city map and my character on the street within 5 seconds of first contentful paint.
2. **US-2** — As a player, I can walk in 8 directions using WASD/arrow keys.
3. **US-3** — As a player, I can approach a parked car and press E (or Enter) to get in.
4. **US-4** — As a player, while driving, I can accelerate (W), brake/reverse (S), and steer (A/D) with momentum-feel physics.
5. **US-5** — As a player, I can press E (or Enter) again to exit the car; the car remains where I left it.
6. **US-6** — As a player, if I run over a pedestrian, I get $100 and my wanted level increases by 1 star (max 4).
7. **US-7** — As a player, when I have ≥1 star, cop cars spawn and pursue me. At 4 stars, multiple cops spawn aggressively.
8. **US-8** — As a player, if I stay out of cop sight for ~30 seconds, my wanted level decreases by 1 star.
9. **US-9** — As a player, I can fire my weapon at NPCs (left mouse click or Space). NPCs die in 1–3 hits.
10. **US-10** — As a player, if I take too much damage, I am "busted" — screen fades, I respawn at a hospital, lose weapons, wanted level resets.
11. **US-11** — As a player, when I walk near a ringing payphone (icon + sound), I can press E to accept a mission. A mission-prompt strip appears.
12. **US-12** — As a player, I see the mission objective on the HUD ("Drive the red sedan to the marker before 02:00") and a marker waypoint on the mini-map.
13. **US-13** — As a player, when I complete a mission, I earn money + score multiplier; the HUD shows a "MISSION PASSED" banner for 3s.
14. **US-14** — As a player, when I reach the target score ($50,000), a "LEVEL COMPLETE" overlay shows and the run ends.
15. **US-15** — As a player, I can mute audio with a single key (M).
16. **US-16** — As a player, I can pause the game (P or Esc) and resume.

## 5. Mechanics — concrete spec

### 5.1 Camera

Camera follows the player. When in a car, camera zooms out 1.25–1.5× compared to on-foot. Smoothed lerp (no snap-to). View frustum ~25×18 tiles at on-foot zoom.

### 5.2 Movement & physics

- **On foot:** 4 m/s walk, optional sprint (Shift) at 6 m/s. No collision with pedestrians; collision with buildings and water.
- **Vehicles:** simple bicycle-model or velocity+heading. Acceleration 6 m/s², top speed 22 m/s (sedan), 30 m/s (sports), 16 m/s (truck). Turn rate scales inverse to speed. Light drift via velocity decay. Crashes deal damage to car HP; at 0 the car explodes (radius damage + 5 s timer).
- **Collisions:** AABB or simple polygon vs tile-grid. Cars vs cars push & damage both.

### 5.3 Wanted level

| Stars | Effect |
|-------|--------|
| 0 | Police ignore player. |
| 1 | One cop on foot or 1 cop car spawns, gives chase, attempts to ram or shoot. |
| 2 | 2 cop cars + faster reaction. |
| 3 | 3 cop cars + roadblocks (static cop-car obstacles at chokepoints). |
| 4 | 4 cop cars + SWAT analogue (one heavily-armed NPC type). |

Cool-down: if no cop has line-of-sight for 30 s, stars drop by 1 (every 30 s).

### 5.4 Crimes → star deltas

| Action | Δ Stars | $ |
|--------|---------|---|
| Run over civilian | +1 | +$100 |
| Shoot civilian | +1 | +$50 |
| Damage cop car | +1 | 0 |
| Kill cop | +2 | +$300 |
| Damage SWAT | +1 | 0 |
| Steal car (only if owner is in it) | +1 | $0 |

(Stars are capped at 4. Multiple events stack until cap.)

### 5.5 Missions

A mission has: a **trigger** (proximity to payphone + E), an **objective** (deliver/kill/escape), a **timer** (60–180 s), a **reward** ($5,000–$15,000 + multiplier +0.1), and **fail conditions** (timer ≤ 0, player dies, mission vehicle destroyed). On accept, the mini-map shows a waypoint and a HUD strip announces the goal.

For MVP, hand-author 3 missions in a JSON file under `assets/missions.json`. Each is one of the three types.

### 5.6 Scoring

`score = floor(money * multiplier)`. Multiplier starts at 1.0, +0.1 per mission passed, capped at 3.0. Win condition: `score >= 50_000`.

### 5.7 HUD

```
+---------------------------------------------------------+
| $00,000   x1.0                          [* * * *]       |  <- score + stars
|                                                         |
|                                                         |
|       (game viewport — top-down city + player)          |
|                                                         |
|                                                         |
| [mini-map]                              HP:100  PISTOL  |
|                                                         |
| > Drive the red SEDAN to the marker. 01:42 left.        |  <- mission strip
+---------------------------------------------------------+
```

Mini-map: ~120×120 px, shows player as a dot, mission waypoint as a flashing marker, cops as red dots when chasing.

## 6. Content requirements

| Asset | Count | Notes |
|-------|-------|-------|
| Tile types | ~20 | Asphalt, sidewalk, building roof (multiple), grass, water, road-marking variants, payphone, hospital, parking |
| Character sprites | 4 | Player (8-dir), generic civilian (M, F), cop, SWAT |
| Vehicle sprites | 4 | Sedan, sports, truck, cop car |
| Weapons | 2 | Pistol, machine gun (reuse a single sprite slot in MVP) |
| SFX | 8 | Engine loop, gunshot ×2, siren, scream, explosion, pickup, UI click |
| Music | 1 | City ambience loop (≤2 MB OGG) |
| Mission scripts | 3 | JSON-driven |
| City map | 1 | 128×128 Tiled `.tmx` map exported to JSON |

Art direction: clean low-fi pixel art, 16 px tiles, 32 px sprites, palette evoking 1997 GTA without copying it. We will source from itch.io / Kenney.nl CC0 packs where possible — every asset must be CC0/CC-BY or original.

## 7. Non-functional requirements

- **Performance:** 60 fps target on a 2020-era laptop in Chrome. Allow graceful 30 fps on lower hardware.
- **Load time:** First playable frame ≤ 5 s on a 50 Mbps connection.
- **Browser support:** latest 2 versions of Chrome, Firefox, Safari, Edge. Desktop only.
- **Bundle size:** ≤ 10 MB total (incl. art and audio).
- **Accessibility:** rebindable keys not required for MVP; mute button is required; pause is required.
- **Persistence:** none. Refresh is acceptable to restart.
- **Multiplayer:** none.
- **Cheats / dev mode:** a hidden console (~) that prints state; can be turned off via env var. Not exposed to users.

## 8. Technical research — tech stack candidates

The user has explicitly requested that the tech stack be **proposed for review before any coding begins.** The architecture iteration will own the final decision. Below is the analyst's preliminary survey to inform that work.

### 8.1 Form factor: browser, native, or hybrid?

**Recommendation: browser.** Rationale: zero install, easy to share, modern Canvas/WebGL is more than fast enough for a 16-px top-down 2D game at 60 fps. Native (e.g. Godot, raylib, LÖVE) would offer better performance headroom but adds distribution friction the user has not asked for.

### 8.2 Top candidate game frameworks (browser, 2D)

| Engine | Language | Pros for TGA | Cons for TGA |
|--------|----------|--------------|--------------|
| **Phaser 3** | JS/TS | Batteries-included: scenes, tile maps (Tiled `.tmx`/JSON support), Arcade + Matter.js physics, input, audio. Huge community + tutorials specifically for top-down tilemap games and car-physics. Mature (since 2017). | Heavier bundle (~1.2 MB). Opinionated structure. |
| **PixiJS + custom** | JS/TS | 3× smaller, 2× faster raw rendering. Total control. | We re-implement scenes, physics, tile rendering, input — significant effort for a 4–8-week MVP. |
| **Kaboom / Kaplay** | JS/TS | Very fast to start, declarative API, popular for jams. | Smaller ecosystem, fewer tilemap-game references; physics is basic. |
| **Excalibur** | TS | Strongly-typed, good DX, scene + actor model. | Smaller community, less GTA-style precedent. |
| **MelonJS** | JS | Has top-down support, Tiled-native. | Lower activity, smaller community. |
| **Godot HTML5 export** | GDScript | Full editor, great tile map editor, can export to web. | Web export size is 20+ MB; debugging in browser is awkward. |

**Analyst's preliminary recommendation:** **Phaser 3 with TypeScript**, Tiled for the city map, Arcade Physics for car/pedestrian collisions, Vite for the build, vanilla Web Audio for SFX (or Phaser's built-in audio). This is the lowest-risk path for a 4–8-week MVP and has by far the most directly-applicable tutorial material for "top-down tile-based driving game in the browser."

The architect's job is to challenge this, look at alternatives, and produce the binding decision.

### 8.3 Map authoring

Tiled (free, cross-platform) → export to JSON → Phaser loads. Standard pipeline.

### 8.4 Deployment

Local Docker Compose for v1 (per workspace convention) serving a static site (nginx). Cloud (Firebase Hosting, Cloudflare Pages, etc.) deferred. A `run.sh` wrapping the standard commands (`start/up/stop/restart/logs/build/status/test/shell/clean/help`) is required.

### 8.5 Testing

- Unit tests with Vitest for pure logic (mission state machine, wanted-level cool-down, scoring, AI helpers).
- Integration tests via Playwright loading the game, sending keystrokes, asserting score updates and DOM/Canvas snapshots.

## 9. Risks & open questions

1. **Scope creep on the city map.** A 128×128 hand-authored city is already a week of work. Mitigation: start with 64×64 and grow.
2. **Vehicle physics feel.** Bicycle-model can feel mushy at low speeds. We may need to iterate to find the right values; budget time for a tuning pass.
3. **AI: cop pursuit pathfinding.** Naïve "drive toward player" causes cops to get stuck on buildings. We'll need basic A* or flow-field pathfinding on the road network.
4. **Asset availability.** We need CC0 sprites that match the visual target. If they aren't found we either commission art (out of scope) or accept lower fidelity.
5. **Audio licensing.** Same as above — only CC0/CC-BY tracks.
6. **Browser fingerprinting / fullscreen.** Players will expect fullscreen mode. Add a button.

### 9.1 Open questions for the user (the analyst's recommendation in italics)

- Q1: Are we OK with **Phaser 3 + TypeScript** as the leading recommendation? *Analyst's pick: yes — see §8.2.*
- Q2: Is **English-only / desktop-only** acceptable for MVP? *Analyst's pick: yes.*
- Q3: Does the MVP need to **persist save state**? *Analyst's pick: no — refresh resets.*
- Q4: Score target $50,000 with 3 missions — too short, too long? *Analyst's pick: tune during QA, this is a placeholder.*
- Q5: Are we OK using **CC0 art** rather than commissioning sprites? *Analyst's pick: yes.*

These are recorded for the architect and the user; the project will proceed under the analyst's picks until/unless overridden.

## 10. Decision gate before coding

Per user instruction, **no coding begins** until the user has seen and approved the tech-stack recommendation produced by the architect in a later iteration. The architecture phase will produce `docs/architecture.md` with a binding decision; the user will be shown the summary and asked to confirm before the pipeline advances to the coding phase.

## 11. Acceptance criteria (MVP done = all of the below)

- All 16 user stories (US-1 … US-16) demonstrably work.
- At least 3 missions are completable.
- Reaching $50,000 triggers the "LEVEL COMPLETE" overlay.
- Game runs at ≥ 30 fps on a 2020-era laptop, 60 fps target.
- Bundle ≤ 10 MB.
- `run.sh start` serves the game at `http://localhost:<port>` via Docker Compose.
- All assets are CC0, CC-BY, or original — license file listing sources is committed.
- Unit + integration tests pass; QA agent reports PASS.
- Security agent reports PASS (no eval, no remote code load, no PII collection).

---

**End of PRD v1.0.**
