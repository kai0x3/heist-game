// VAULTBREAK — wall cameras: a sweeping cone that watches on its own. A camera
// that holds you in its cone raises the alarm even when no guard is looking.
'use strict';

function makeCamera(def) {
  return {
    x: def.x, y: def.y, baseAngle: def.baseAngle,
    sweep: def.sweep, speed: def.speed, phase: def.phase,
    angle: def.baseAngle, t: def.phase, spotting: false,
  };
}

function updateCamera(cam, dt, game) {
  cam.t += dt;
  cam.angle = cam.baseAngle + Math.sin(cam.t * cam.speed) * cam.sweep;
  const p = game.player;
  cam.spotting = false;
  if (p.venting > 0 || p.invuln > 0) return;
  const dx = p.x - cam.x, dy = p.y - cam.y;
  const dist = Math.hypot(dx, dy);
  if (dist > CFG.CAM_VIEW_DIST) return;
  let diff = Math.atan2(dy, dx) - cam.angle;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  if (Math.abs(diff) > CFG.CAM_VIEW_HALF_ANGLE) return;
  if (losBlocked(cam.x, cam.y, p.x, p.y, game.solids)) return;
  cam.spotting = true;
  game.alarm = Math.min(CFG.ALARM_MAX, game.alarm + CFG.ALARM_RISE_CAM * dt);
  if (game.alarm >= CFG.ALARM_LOCKDOWN && !game.lockdown) game.onLockdown();
}
