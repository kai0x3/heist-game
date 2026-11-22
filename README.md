![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)
![rank](https://make.fun/badge/kai0x3/heist-game/rank.svg)
![reward](https://make.fun/badge/kai0x3/heist-game/reward.svg)

# VAULTBREAK — The Meridian Job

A complete top-down heist game that runs offline in a desktop browser from static
files. One night, one diamond: sneak through the Meridian Bank after dark, past
four patrolling guards with raycast-clipped vision cones, three sweeping security
cameras and a rising alarm meter — crack the glass case in the vault, grab the
Meridian Diamond ($50,000) plus any cash and gold on the way, and escape through
the service vent.

## How it plays

- **Move** WASD / arrows · **Sneak** Shift (slower, harder to spot) · **E** crack the
  diamond case / crawl through a vent · **Click or F** toss a coin — the nearest
  guard walks over to investigate · **P** pause
- Guards run calm → suspicious (?) → alert (!) → search, and remember where they
  last saw you. Cameras sweep on their own and raise the alarm. Shadow tiles slow
  a guard's suspicion; at 100% alarm the bank locks down and every guard hunts you.
- Three lives. Caught three times and the job is busted. Escape through the vent
  with the diamond for the clean getaway — loot, time and lives all pay into the
  final score.
- Two vents link the lobby to the vault, so there is always more than one route.
- All sound is synthesized live with WebAudio — no audio files.

## Files

- `main.ts` — hands the game in (copies `game/` + `screenshots/` to `/output`,
  writes `dossier.json`)
- `game/index.html` — opens in desktop Chrome and plays, no network requests
- `game/src/config.js` — every tuning number in one place
- `game/src/level.js` — the bank floor: rooms, cases, vents, loot, cameras, patrols
- `game/src/geometry.js` — line of sight, cone raycasting, grid pathfinding
- `game/src/guards.js` — guard AI: patrols, vision, suspicion, chase, search
- `game/src/cameras.js` — sweeping security cameras
- `game/src/player.js` — the thief: movement, sneaking, coins, cracking, vents
- `game/src/audio.js` — WebAudio synth sound effects
- `game/src/render.js` — all canvas drawing
- `game/src/main.js` — game loop, state machine, HUD, screenshot staging, self-test
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## Screenshots

Real renders of the game's own code (headless Chromium, `?shot=…`):

1. `1-cover.png` — mid-heist: the thief sneaking past a suspicious guard, cones,
   cameras, loot and alarm all in frame
2. `2-patrol.png` — the floor at calm: guards on patrol, cones sweeping
3. `3-alarm.png` — lockdown: alarm at 82%, a guard in full chase
4. `4-escape.png` — diamond secured, the thief slipping back to the vent
