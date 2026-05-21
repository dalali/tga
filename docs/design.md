# TGA — Design Document

**Version:** 1.0  
**Status:** Final — Design phase complete  
**Date:** 2026-05-21  
**Author:** ui-ux-designer (autonomous)  
**References:** PRD v1.0 §3.1, §4, §5.5, §5.7

---

## 1. Design Philosophy

TGA evokes 1997 GTA without copying it. The original game used a sparse, functional HUD: police heads bobbing at the top of the screen, a score counter, a multiplier, and a bottom-left radar showing a simplified city overhead. Text was chunky and pixel-rendered — readability at low resolution was the constraint, not elegance.

Our version respects that constraint intentionally. The HUD should feel like it belongs to a $2 game from a petrol-station bargain bin — in a good way. Every element earns its screen space. Nothing decorates. The city is the star; the HUD is the crew.

**Three rules that govern every decision:**
1. The game viewport is sacred. HUD elements hug the edges. They never cover the play area more than necessary.
2. Chunky pixel text only in the HUD. Overlays (pause, mission complete, death) may use a slightly cleaner font but stay blocky.
3. Neon on dark. The city is grimy asphalt grey. Accents are radioactive — yellow, red, cyan. They pop because the background earns it.

---

## 2. Colour Palette

Six core colours plus two utility values. All HUD elements draw from this set exclusively.

```
NAME            HEX       USE
────────────────────────────────────────────────────────────────────
Asphalt         #1A1A1F   Game background, HUD panel fill
Concrete        #2E2E38   Secondary surfaces, mini-map background
Smog            #4A4A55   Inactive UI, disabled states, tile mid-tone
Bone            #E8E4D4   Primary text, score, HP bar fill
Neon Yellow     #F5D800   Score value, multiplier text, waypoint dot
Siren Red       #E03030   Wanted stars, cop dots on mini-map,
                          WASTED/BUSTED text
Signal Cyan     #00E5CC   Mission strip background tint,
                          player dot on mini-map
Slime Green     #3DCC3D   MISSION PASSED / LEVEL COMPLETE text,
                          money-earned sub-text, HP bar when > 50%
```

**Usage guidance:**

- Never put Neon Yellow text on Bone — too similar in perceived brightness.
- Siren Red is reserved for danger and crime. Do not use it for decorative purposes.
- Signal Cyan as a background always needs 60–70% opacity so the city shows through the mission strip.
- Slime Green HP bar transitions to Siren Red when HP falls below 30%.

---

## 3. Typography

Two font roles. No exceptions.

### 3.1 HUD Font — Pixel

**Font:** `Press Start 2P` (Google Fonts, OFL license)  
**Fallback:** any monospace pixel bitmap font  
**Sizes:** 8px base unit. HUD labels = 8px. Score/money value = 12px. Wanted stars drawn as glyphs or sprites, not text.

Characteristics: fixed-width, fully pixelated, no anti-aliasing. Render with `image-rendering: pixelated` and `font-smooth: never`. This is the only font used inside the game viewport HUD frame.

### 3.2 Overlay Font — Chunky Sans

**Font:** `Oswald` Bold (Google Fonts, OFL license)  
**Fallback:** Impact, Arial Narrow  
**Sizes:**
- "MISSION PASSED" / "LEVEL COMPLETE" / "WASTED" / "BUSTED" = 72px
- Sub-labels (money earned, score summary) = 28px
- Body copy on level-complete card = 18px
- Button labels = 16px uppercase letter-spacing 0.15em

Oswald Bold is not pixel-perfect but it is chunky and aggressive — it reads like a newspaper headline about a crime, which is exactly right for a GTA clone.

---

## 4. HUD Layout

### 4.1 Full Screen Wireframe

The HUD is a canvas overlay on top of the game viewport. All measurements are in CSS pixels at 1080p target (1920×1080). Elements scale proportionally on smaller screens.

```
╔══════════════════════════════════════════════════════════════════════╗
║  $00,000  x1.0           ░░░░░░░░░░░░░░░░          [●][●][●][●]   ║  ← 48px tall
║                                                                      ║
║                                                                      ║
║                                                                      ║
║                                                                      ║
║              G A M E   V I E W P O R T                              ║
║                    (top-down city)                                   ║
║                                                                      ║
║                                                                      ║
║                                                                      ║
║  ┌──────────┐                               HP ██████████  PISTOL   ║  ← 120px tall
║  │  MINI-   │                                  ██████████           ║
║  │   MAP    │                                                        ║
║  │  120×120 │                                                        ║
║  └──────────┘                                                        ║
║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║
║  > DRIVE THE RED SEDAN TO THE MARKER.              01:42             ║  ← mission strip
╚══════════════════════════════════════════════════════════════════════╝
```

### 4.2 Top Bar — Score, Multiplier, Wanted Level

Height: 48px. Background: `#1A1A1F` at 80% opacity (game faintly visible behind).  
Padding: 12px horizontal, 8px vertical.

```
┌──────────────────────────────────────────────────────────────────────┐
│  $00,000    x1.0         [    ghost    ]         [●] [●] [ ] [ ]   │
│  ↑ Bone     ↑ Yellow     ↑ empty       ↑ right   ↑ police heads     │
│  12px PPF   12px PPF       space       aligned   24×24px each        │
└──────────────────────────────────────────────────────────────────────┘
```

**Score:** `$` prefix + zero-padded 6-digit number. Colour: Bone `#E8E4D4`. Font: Press Start 2P 12px.  
**Multiplier:** `x` prefix + one decimal place (x1.0 → x3.0). Colour: Neon Yellow `#F5D800`. Font: Press Start 2P 12px. Left-separated from score by 20px gap.  
**Wanted stars (right-aligned):** 4 slots. Each slot is a 24×24px police head icon sprite. Active stars: full colour (Siren Red tinted). Empty slots: same sprite at 20% opacity (ghost). When police have line-of-sight, active heads animate with a 2-frame vertical bob at 4fps. Spacing between heads: 4px.

### 4.3 Bottom-Right — HP and Weapon

Anchored: bottom-right, 12px margin from edges.

```
┌────────────────────────────────┐
│  HP  ████████████████  100    │  ← bar 140px wide, 10px tall
│                                │
│  PISTOL                        │  ← weapon name, 8px PPF
└────────────────────────────────┘
```

**HP bar:** 140px wide × 10px tall. Fill colour: Slime Green `#3DCC3D` above 30% HP, transitions to Siren Red `#E03030` below 30% HP. Background track: Concrete `#2E2E38`. No border. Numeric HP value `#E8E4D4` 8px to the right of bar.  
**Weapon name:** Press Start 2P 8px, Bone colour. Shown below HP bar. Empty string if unarmed (rare — player always has fists, but fists are not displayed).

### 4.4 Mission Strip

Anchored: bottom of screen, full width, 36px tall. Slides up from below when a mission starts. Hidden (translated off-screen) when no mission is active.

```
╔══════════════════════════════════════════════════════════════════════╗
║  ▶  DRIVE THE RED SEDAN TO THE MARKER BEFORE TIME RUNS OUT.  01:42  ║
╚══════════════════════════════════════════════════════════════════════╝
```

Background: Signal Cyan `#00E5CC` at 65% opacity. Text: `#1A1A1F` (Asphalt) — dark on cyan for contrast. Font: Press Start 2P 8px.  
The `▶` triangle glyph is a fixed prefix. Objective text is left-aligned. Timer (`MM:SS`) is right-aligned, same row.

**Timer colour logic:**
- > 30s remaining: Asphalt `#1A1A1F`
- 10–30s remaining: Neon Yellow `#F5D800`
- < 10s remaining: Siren Red `#E03030` + pulse animation (opacity 100%→60%→100%, 0.5s cycle)

**Animation:** CSS `transform: translateY(+36px)` → `translateY(0)` over 300ms ease-out on mission accept. Reverse on mission end.

---

## 5. Mini-Map

### 5.1 Dimensions and Position

Anchored: bottom-left, 12px margin. Size: 120×120px. Rendered to an off-screen canvas and composited each frame.

### 5.2 Visual Spec

```
┌────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░  │  <- city tiles (greyscale simplified)
│  ░░░░████████░░░░░░░░░░░  │
│  ░░░░█ roads █░░░░░░░░░░  │  streets = #3A3A42
│  ░░░░████████░░░░░░░░░░░  │  buildings = #2E2E38
│  ░░░░░░░●░░░░░░░░░░░░░░░  │  player = white #FFFFFF dot 3×3px
│  ░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░◆░░░░░░░░░░░  │  waypoint = #F5D800 diamond 4×4px
│  ░░░░░░░░░░░░░░░░○░░░░░░  │  cop = #E03030 dot 2×2px
│  ░░░░░░░░░░░░░░░░░░░░░░░  │
└────────────────────────────┘
  ↑ border: 1px solid #4A4A55 (Smog)
  background fill: #1A1A1F at 85% opacity
```

**City tiles on mini-map (simplified greyscale render):**

| Tile type       | Mini-map colour |
|-----------------|----------------|
| Street/road     | `#3A3A42`      |
| Sidewalk        | `#2A2A32`      |
| Building        | `#222228`      |
| Grass           | `#1E251E`      |
| Water           | `#14141E`      |

**Dots and markers:**

| Entity          | Shape        | Colour    | Size   | Animation          |
|-----------------|--------------|-----------|--------|--------------------|
| Player          | Circle       | `#FFFFFF` | 3×3px  | None               |
| Mission waypoint| Diamond ◆   | `#F5D800` | 4×4px  | 1s blink (on/off)  |
| Cop (chasing)   | Circle       | `#E03030` | 2×2px  | None               |

The mini-map always shows north-up (no rotation). The viewport rectangle is centred on the player. Scale: each mini-map pixel represents approximately 17 world tiles.

---

## 6. Pause Screen Overlay

Triggered by `P` or `Escape`. Game loop freezes (requestAnimationFrame stops). Audio pauses.

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║                                                                      ║
║                                                                      ║
║                           P A U S E D                               ║
║                                                                      ║
║                    Press P or ESC to resume                          ║
║                                                                      ║
║                                                                      ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
   ↑ full-screen overlay: #1A1A1F at 70% opacity (blurred game behind)
```

**"PAUSED":** Oswald Bold 72px, Bone `#E8E4D4`, centred. Letter-spacing: 0.3em to spread the word out.  
**Sub-label:** Press Start 2P 10px, Smog `#4A4A55`, centred, 32px below title. Lower contrast than title — it is secondary information.  
**Backdrop:** full-screen `#1A1A1F` div at 70% opacity. No blur filter (performance). The darkened-but-visible city behind creates context without distraction.  
**Entry animation:** opacity 0 → 1 over 150ms.  
**Exit animation:** opacity 1 → 0 over 150ms, then game resumes.

---

## 7. Mission Complete Banner

Triggers when `missionState === 'passed'`. Auto-dismisses after 3 seconds.

```
                    ┌──────────────────────────┐
                    │                          │
                    │    MISSION PASSED        │
                    │                          │
                    │       + $12,500          │
                    │                          │
                    └──────────────────────────┘
                    centred on screen, vertically ~35% from top
```

**"MISSION PASSED":** Oswald Bold 72px, Slime Green `#3DCC3D`. Centred.  
**Money earned:** `+ $XX,XXX` — Oswald Bold 28px, Neon Yellow `#F5D800`. 16px below title.  
**Background panel:** none. Text only, with a `text-shadow: 0 2px 12px #000000` for legibility over any backdrop.  
**Animation sequence:**
1. Fade in: 0 → 1 opacity, 300ms ease-out
2. Hold: 2.1s
3. Fade out: 1 → 0 opacity, 600ms ease-in
4. Total: 3.0s

The game continues running during this banner. The player can still move and be shot. This matches GTA 1 behaviour — you celebrate while staying alive.

---

## 8. Level Complete Overlay

Triggers when `score >= 50,000`. Game loop pauses. Cannot be dismissed by the player until the "Play Again" button is clicked.

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║                                                                      ║
║                       LEVEL COMPLETE                                 ║
║                                                                      ║
║               ┌──────────────────────────────────┐                  ║
║               │  FINAL SCORE       $87,500        │                  ║
║               │  MULTIPLIER        x2.3           │                  ║
║               │  MISSIONS PASSED   3              │                  ║
║               │  TIME              14:27          │                  ║
║               └──────────────────────────────────┘                  ║
║                                                                      ║
║                       [ PLAY AGAIN ]                                 ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
   ↑ full-screen overlay: #1A1A1F at 92% opacity
```

**"LEVEL COMPLETE":** Oswald Bold 72px, Slime Green `#3DCC3D`, centred, 24px letter-spacing.  
**Stats card:** background `#2E2E38` (Concrete), 400px wide, border `1px solid #4A4A55` (Smog), padding 24px. Two-column layout: label left (Smog colour, 14px Oswald), value right (Bone colour, 18px Oswald Bold).  
**Play Again button:**
- Background: Neon Yellow `#F5D800`
- Text: Asphalt `#1A1A1F`, Oswald Bold 16px, letter-spacing 0.15em, uppercase
- Padding: 14px 48px
- No border-radius (flat pixel aesthetic)
- Hover state: background `#FFE033` (10% brighter), cursor pointer
- Focus state: `outline: 2px solid #FFFFFF` (accessibility)
**Entry animation:** fade in over 500ms. No slide — it is a final state, not a transition.

---

## 9. Death / Bust Screen

Two variants: "WASTED" (HP reaches 0) and "BUSTED" (cop arrest — not in MVP scope, but designed for completeness). Both use the same animation flow.

### 9.1 Animation Sequence

```
Frame 0ms:    Game is running normally.
Frame 1ms:    Player HP hits 0. Trigger death sequence.
              Game loop: no more player input accepted.
Frame 0-800ms: Full-screen overlay fades IN: #1A1A1F 0% → 85% opacity.
              Camera stays locked to player's last position.
Frame 800ms:  Large text appears.
Frame 800-1100ms: Text scales up: 120% → 100% (overshoot feel).
Frame 1100-2500ms: Text holds.
Frame 2500-3000ms: Overlay fades OUT to reveal respawn location.
              Player dot appears at hospital tile.
              Wanted stars reset to 0. Weapons cleared. HP = 100.
```

### 9.2 Visual

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║                                                                      ║
║                                                                      ║
║                           W A S T E D                               ║
║                                                                      ║
║                                                                      ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
   ↑ overlay: #1A1A1F at 85% opacity
```

**"WASTED":** Oswald Bold 96px, Siren Red `#E03030`. Centred. Letter-spacing 0.35em.  
**"BUSTED":** Same treatment. Same colour (both mean punishment).  
**No sub-text.** No explanation. GTA 1 didn't explain. Neither do we.  
**Sound cue:** engine-off sound + flat tone on "WASTED" appear. Handled by audio system, not design.

---

## 10. Start Screen

Minimal. The city map is already loaded and rendering in the background. The start screen is a translucent overlay only.

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║                                                                      ║
║                                                                      ║
║                             T G A                                    ║
║                                                                      ║
║                      PRESS ENTER TO START                            ║
║                                                                      ║
║                                                                      ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
   ↑ live city renders and idles behind — camera pans slowly
```

**"TGA":** Oswald Bold 120px, Neon Yellow `#F5D800`. Centred. Letter-spacing 0.5em. No drop shadow — the yellow is bright enough to own the space.  
**"PRESS ENTER TO START":** Press Start 2P 12px, Bone `#E8E4D4`, centred, 48px below title. Slow blink: opacity 100% → 30% → 100% on a 1.4s cycle. The blink is the oldest video-game convention for "waiting for input" — use it.  
**Backdrop:** `#1A1A1F` at 75% opacity. The city underneath is visible — it shows what you're about to enter. A slow auto-scroll pan of the city map plays (camera drifts at 0.5 tile/s, no player).  
**No credits, no settings, no options screen.** This is not a menu. It is a vibe.  
**Entry to game:** `Enter` key dismisses overlay. Game begins. No loading bar — assets are preloaded.

---

## 11. Interaction Patterns by Screen State

### 11.1 State Machine Overview

```
┌─────────────┐   Enter       ┌─────────────┐
│ START_SCREEN│──────────────>│   PLAYING   │
└─────────────┘               └──────┬──────┘
                                     │ P / Esc
                              ┌──────v──────┐
                              │   PAUSED    │<──────┐
                              └──────┬──────┘       │
                                     │ P / Esc      │
                              ┌──────v──────┐       │
                              │   PLAYING   │───────┘
                              └──────┬──────┘
                             HP=0 │  │ Score≥50k
                     ┌────────────┘  └────────────┐
              ┌──────v──────┐             ┌────────v──────┐
              │  DEATH_SEQ  │             │ LEVEL_COMPLETE│
              └──────┬──────┘             └───────┬───────┘
                     │ auto (3s)                   │ "Play Again"
              ┌──────v──────┐             ┌────────v──────┐
              │   PLAYING   │             │ START_SCREEN  │
              │  (respawned)│             └───────────────┘
              └─────────────┘
```

### 11.2 Key Bindings by State

| Key          | START_SCREEN    | PLAYING                      | PAUSED          |
|--------------|-----------------|------------------------------|-----------------|
| `Enter`      | Start game      | Enter/exit vehicle           | —               |
| `W` / `↑`   | —               | Move up / accelerate         | —               |
| `S` / `↓`   | —               | Move down / brake-reverse    | —               |
| `A` / `←`   | —               | Move/steer left              | —               |
| `D` / `→`   | —               | Move/steer right             | —               |
| `Shift`      | —               | Sprint (on foot)             | —               |
| `E`          | —               | Interact (phone, vehicle)    | —               |
| `Space`      | —               | Fire weapon                  | —               |
| `LMB`        | —               | Fire weapon (aim-to-click)   | —               |
| `P`          | —               | Pause                        | Resume          |
| `Esc`        | —               | Pause                        | Resume          |
| `M`          | —               | Mute/unmute audio            | Mute/unmute     |
| `~` (tilde)  | —               | Dev console toggle           | —               |

**Notes:**
- During `DEATH_SEQ` and `LEVEL_COMPLETE`, all input is suspended except `Enter` on the level-complete screen's "Play Again" button.
- During the mission-complete banner (3s auto-dismiss), all gameplay input continues normally.
- `Esc` does not close the level-complete overlay — only the "Play Again" button does.

### 11.3 Mission Accept Flow

```
Player walks within 2 tiles of ringing payphone
              ↓
HUD shows: "Press E to answer"  (8px PPF, Bone, bottom-centre of screen)
              ↓
Player presses E
              ↓
Mission strip animates in from below (300ms)
Waypoint appears on mini-map
Timer starts counting down
"Press E to answer" prompt disappears
```

### 11.4 Mission Failure Flow

```
Timer hits 00:00  OR  player dies during mission  OR  mission vehicle destroyed
              ↓
Mission strip animates out (reverse slide, 300ms)
Mini-map waypoint disappears
If player death → DEATH_SEQ plays first, then respawn with mission cleared
No "mission failed" banner in MVP — strip disappearing is the signal
```

---

## 12. Component Specifications

### 12.1 HUD Overlay Canvas

The HUD is a separate `<canvas>` element positioned `absolute` over the game canvas, pointer-events: none (so clicks pass through to game). Redrawn every frame via a dedicated `drawHUD(ctx, state)` function. All HUD rendering is synchronous with the game loop.

### 12.2 Mini-Map Canvas

The mini-map is a 120×120px `<canvas>` element drawn as a sub-call within `drawHUD`. City tile data is sampled from the tilemap at 1/17 scale. Dots are drawn last (on top). The whole mini-map canvas is cleared and redrawn each frame.

### 12.3 Overlay Div Layers

Non-HUD overlays (pause, mission passed, level complete, start screen, death) are HTML `<div>` elements positioned `fixed`, z-index layering:

```
z-index  Layer
───────  ────────────────────────────────────────
100      Start screen overlay
200      Death / bust overlay
300      Mission passed banner (auto-dismiss)
400      Level complete overlay
500      Pause overlay
```

Higher z-index wins. The pause overlay must always appear on top of everything else. Mission passed banner must appear above the level-complete trigger check (though both active simultaneously is an edge case the game logic should prevent).

### 12.4 Mission Strip DOM

```html
<div id="mission-strip" class="mission-strip mission-strip--hidden">
  <span class="mission-strip__arrow">▶</span>
  <span class="mission-strip__objective" id="mission-objective-text">
    Drive the red sedan to the marker.
  </span>
  <span class="mission-strip__timer" id="mission-timer">01:42</span>
</div>
```

CSS class `mission-strip--hidden` applies `transform: translateY(36px)`. Removing it triggers the slide-up transition. The timer element's colour class is swapped by the game loop based on remaining seconds.

---

## 13. Responsive Considerations

The game targets 1920×1080 at 100% zoom. It scales down proportionally if the viewport is smaller. The HUD uses `vw`/`vh` units or is drawn to canvas relative to canvas dimensions.

**Minimum supported viewport:** 1024×600. Below this, the game renders at fixed canvas size and the browser shows scrollbars. No mobile support in MVP.

**Canvas scaling:** the game canvas uses CSS `width: 100%; height: auto` with a fixed pixel resolution. The HUD canvas matches the game canvas exactly. The mini-map remains 120×120 logical pixels regardless of viewport scale.

---

## 14. Design Decisions Log

| Decision | Rationale |
|----------|-----------|
| No HUD border/frame | Original GTA 1 had none. Borders add visual weight without function. |
| Mission strip at bottom, not top-centre | PRD §5.7 shows it at bottom; keeps mission text close to mini-map. Waypoint and strip are spatially related. |
| No mission-failed banner | GTA 1 gave you a "mission failed" message but it was terse. In MVP, the strip disappearing is clear enough. Add a banner in v1.1. |
| Police heads as sprites, not stars | GTA 1 used bobbing police head icons. Our version uses the same concept (police head sprites per star) to honour the source. Stars are a GTA III convention. |
| Oswald + Press Start 2P | Press Start 2P is the industry-standard "I mean pixel game" font. Oswald Bold punches hard for large overlays. Together they cover both use cases without a third typeface. |
| No level-select / main menu | Not in scope. Single level, single run. The start screen is decorative, not functional navigation. |
| HP as bar, not number-only | Number alone is hard to parse at a glance while driving. Bar gives at-a-glance read. Number next to bar gives precision. Both. |

---

**End of Design Document v1.0**
