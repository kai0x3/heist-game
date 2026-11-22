// VAULTBREAK — tuning constants. One place for every number the game balances on,
// so the level, guards and cameras all read the same truth.
'use strict';

const CFG = {
  W: 1280, H: 800,
  TILE: 40,
  PLAYER_R: 13,
  WALK_SPEED: 165,
  SNEAK_SPEED: 95,
  GUARD_SPEED: 105,
  GUARD_CHASE_SPEED: 175,
  GUARD_VIEW_DIST: 185,
  GUARD_VIEW_HALF_ANGLE: 0.62, // ~35 degrees each side
  CAM_VIEW_DIST: 215,
  CAM_VIEW_HALF_ANGLE: 0.5,
  ALARM_MAX: 100,
  LIVES: 3,
  COINS_START: 5,
  CRACK_TIME: 2.6, // seconds holding E at the diamond case
  VENT_TIME: 0.7,
  CATCH_DIST: 26,
  // suspicion: how fast a guard goes calm -> suspicious -> alert while watching you
  SUSPICION_RATE: 95,   // per second, standing in the open
  SUSPICION_SNEAK: 55,  // per second while sneaking
  SUSPICION_SHADOW: 38, // per second while standing in a shadow tile
  SUSPICION_DECAY: 30,
  SUSPICIOUS_AT: 55,
  ALERT_AT: 100,
  SEARCH_TIME: 4.0,
  ALARM_RISE: 26,   // per second while any guard is alert
  ALARM_RISE_CAM: 18,
  ALARM_DECAY: 7,
  ALARM_LOCKDOWN: 100,
  // colours
  COL: {
    floor: '#1d2333', floorAlt: '#202839', wall: '#0d1120', wallTop: '#39415e',
    shadow: 'rgba(6,8,18,0.55)', carpet: '#232c44',
    coneCalm: 'rgba(250,204,21,0.16)', coneSusp: 'rgba(249,115,22,0.28)',
    coneAlert: 'rgba(239,68,68,0.34)', coneCam: 'rgba(56,189,248,0.20)',
    loot: '#fbbf24', diamond: '#7dd3fc', guard: '#f87171', guardSuit: '#334155',
    player: '#4ade80', exit: '#34d399', vault: '#a78bfa',
  },
};
