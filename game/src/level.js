// VAULTBREAK — the Meridian Bank floor. One big night-time floor: an office, a
// gallery of display cases, a vault room holding the Meridian Diamond, and the
// service vent the thief came in through (and must escape through).
'use strict';

const LEVEL = {
  name: 'The Meridian Job',
  spawn: { x: 78, y: 726 },
  exit: { x: 78, y: 726, r: 34 }, // the vent: escape here once the diamond is yours
  walls: [
    // outer shell
    { x: 0, y: 0, w: 1280, h: 16 }, { x: 0, y: 784, w: 1280, h: 16 },
    { x: 0, y: 0, w: 16, h: 800 }, { x: 1264, y: 0, w: 16, h: 800 },
    // vault room (top right), door in the left wall and in the bottom wall
    { x: 880, y: 16, w: 16, h: 170 }, { x: 880, y: 250, w: 16, h: 130 },
    { x: 880, y: 364, w: 200, h: 16 }, { x: 1160, y: 364, w: 104, h: 16 },
    // office (top left), doors in the right and bottom walls
    { x: 414, y: 16, w: 16, h: 120 }, { x: 414, y: 190, w: 16, h: 80 },
    { x: 16, y: 254, w: 180, h: 16 }, { x: 280, y: 254, w: 150, h: 16 },
    // freestanding partitions in the open floor
    { x: 560, y: 420, w: 16, h: 200 }, { x: 560, y: 680, w: 16, h: 104 },
    { x: 920, y: 420, w: 16, h: 140 }, { x: 920, y: 620, w: 16, h: 164 },
  ],
  obstacles: [
    // glass display cases
    { x: 300, y: 120, w: 120, h: 50, kind: 'case' },
    { x: 520, y: 120, w: 120, h: 50, kind: 'case' },
    { x: 300, y: 560, w: 120, h: 50, kind: 'case' },
    { x: 520, y: 560, w: 120, h: 50, kind: 'case' },
    // office desks
    { x: 80, y: 80, w: 140, h: 60, kind: 'desk' },
    { x: 240, y: 80, w: 120, h: 60, kind: 'desk' },
    // the vault safe and the diamond's glass case
    { x: 1150, y: 60, w: 90, h: 70, kind: 'safe' },
    { x: 1010, y: 120, w: 80, h: 80, kind: 'diamondCase' },
    // reception desk, planters, pillars
    { x: 700, y: 640, w: 180, h: 50, kind: 'desk' },
    { x: 640, y: 300, w: 40, h: 40, kind: 'planter' },
    { x: 640, y: 500, w: 40, h: 40, kind: 'planter' },
    { x: 100, y: 640, w: 40, h: 40, kind: 'planter' },
    { x: 1180, y: 640, w: 40, h: 40, kind: 'planter' },
    { x: 480, y: 380, w: 36, h: 36, kind: 'pillar' },
    { x: 800, y: 380, w: 36, h: 36, kind: 'pillar' },
  ],
  // shadow tiles: standing in one makes guards notice you far more slowly
  shadows: [
    { x: 40, y: 300, w: 180, h: 120 },
    { x: 1060, y: 420, w: 180, h: 120 },
    { x: 460, y: 620, w: 200, h: 140 },
    { x: 700, y: 60, w: 160, h: 100 },
    { x: 40, y: 660, w: 140, h: 100 },
  ],
  vents: [
    { x: 78, y: 726, link: 1, label: 'VENT A' },
    { x: 940, y: 330, link: 0, label: 'VENT B' },
  ],
  loot: [
    { id: 'diamond', kind: 'diamond', x: 1050, y: 160, value: 50000, taken: false, needsCrack: true },
    { id: 'cash1', kind: 'cash', x: 360, y: 145, value: 4000, taken: false },
    { id: 'cash2', kind: 'cash', x: 150, y: 110, value: 4000, taken: false },
    { id: 'cash3', kind: 'cash', x: 790, y: 665, value: 4000, taken: false },
    { id: 'gold', kind: 'gold', x: 1195, y: 95, value: 12000, taken: false },
  ],
  cameras: [
    { x: 700, y: 20, baseAngle: Math.PI / 2, sweep: 0.85, speed: 0.55, phase: 0 },
    { x: 1150, y: 384, baseAngle: Math.PI / 2, sweep: 0.7, speed: 0.8, phase: 1.4 },
    { x: 20, y: 420, baseAngle: 0, sweep: 0.75, speed: 0.65, phase: 2.6 },
  ],
  guards: [
    { name: 'Rook', route: [[200, 700], [200, 500], [450, 500], [450, 700]], pause: 1.2 },
    { name: 'Bishop', route: [[350, 320], [600, 320], [600, 520], [350, 520]], pause: 0.8 },
    { name: 'Knight', route: [[1120, 430], [1120, 330], [950, 330], [950, 430]], pause: 1.0 },
    { name: 'Pawn', route: [[100, 330], [380, 330], [380, 180], [100, 180]], pause: 1.5 },
  ],
};

function solidsOf(level) {
  return level.walls.concat(level.obstacles);
}
