// VAULTBREAK — guards: patrol loops, vision cones, and the
// calm -> suspicious -> alert -> search state machine.
'use strict';

function makeGuard(def, grid, solids) {
  // Pre-compute the patrol as grid-pathed legs so no guard ever walks through a wall.
  const legs = [];
  let ok = true;
  for (let i = 0; i < def.route.length; i++) {
    const a = def.route[i], b = def.route[(i + 1) % def.route.length];
    const path = gridPath(grid, a[0], a[1], b[0], b[1]);
    if (!path) { ok = false; break; }
    legs.push(path);
  }
  return {
    name: def.name, x: def.route[0][0], y: def.route[0][1],
    dir: 0, state: 'calm', suspicion: 0, pause: def.pause,
    legs, leg: 0, legStep: 0, waitTimer: 0,
    lastSeen: null, searchTimer: 0, investigate: null,
    chasePath: null, chaseTimer: 0, patrolOk: ok,
    bob: Math.random() * 6.28,
  };
}

function guardSees(g, px, py, solids, sneaking, inShadow) {
  const dx = px - g.x, dy = py - g.y;
  const dist = Math.hypot(dx, dy);
  if (dist > CFG.GUARD_VIEW_DIST) return 0;
  let angDiff = Math.atan2(dy, dx) - g.dir;
  while (angDiff > Math.PI) angDiff -= 2 * Math.PI;
  while (angDiff < -Math.PI) angDiff += 2 * Math.PI;
  if (Math.abs(angDiff) > CFG.GUARD_VIEW_HALF_ANGLE) return 0;
  if (losBlocked(g.x, g.y, px, py, solids)) return 0;
  // Closer and standing tall is easier to spot; sneaking and shadow slow it down.
  let rate = CFG.SUSPICION_RATE * (1.25 - dist / CFG.GUARD_VIEW_DIST);
  if (sneaking) rate = CFG.SUSPICION_SNEAK * (1.1 - dist / CFG.GUARD_VIEW_DIST);
  if (inShadow) rate = Math.min(rate, CFG.SUSPICION_SHADOW);
  return Math.max(8, rate);
}

function guardStepToward(g, tx, ty, speed, dt, solids) {
  const dx = tx - g.x, dy = ty - g.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) return true;
  const nx = g.x + (dx / dist) * speed * dt;
  const ny = g.y + (dy / dist) * speed * dt;
  if (!solids.some(s => circleHitsRect(nx, g.y, 12, s))) g.x = nx;
  if (!solids.some(s => circleHitsRect(g.x, ny, 12, s))) g.y = ny;
  g.dir = Math.atan2(dy, dx);
  return dist < 14;
}

function updateGuard(g, dt, game) {
  const p = game.player, solids = game.solids;
  g.bob += dt * 6;
  const seenRate = p.venting > 0 || p.invuln > 0 ? 0
    : guardSees(g, p.x, p.y, solids, p.sneaking, p.inShadow);

  if (seenRate > 0) {
    g.suspicion += seenRate * dt;
    g.lastSeen = { x: p.x, y: p.y };
    if (g.state === 'calm' && g.suspicion >= CFG.SUSPICIOUS_AT) {
      g.state = 'suspicious'; Sfx.suspicious();
    }
    if (g.suspicion >= CFG.ALERT_AT && g.state !== 'alert') {
      g.state = 'alert'; game.onSpotted(g); Sfx.spotted();
    }
  } else {
    g.suspicion = Math.max(0, g.suspicion - CFG.SUSPICION_DECAY * dt);
    if (g.state === 'suspicious' && g.suspicion < CFG.SUSPICIOUS_AT * 0.5) g.state = 'calm';
  }

  if (g.state === 'alert') {
    // Chase the player, re-pathing twice a second around furniture.
    g.chaseTimer -= dt;
    if (g.chaseTimer <= 0) {
      g.chasePath = gridPath(game.grid, g.x, g.y, p.x, p.y);
      g.chaseTimer = 0.5;
    }
    let target = { x: p.x, y: p.y };
    if (g.chasePath && g.chasePath.length) target = { x: g.chasePath[0][0], y: g.chasePath[0][1] };
    const arrived = guardStepToward(g, target.x, target.y, CFG.GUARD_CHASE_SPEED, dt, solids);
    if (g.chasePath && g.chasePath.length && arrived) g.chasePath.shift();
    if (seenRate === 0) {
      g.searchTimer += dt;
      if (g.searchTimer > 3.5) { g.state = 'search'; g.searchTimer = 0; }
    } else g.searchTimer = 0;
    if (Math.hypot(p.x - g.x, p.y - g.y) < CFG.CATCH_DIST && p.invuln <= 0) game.onCaught(g);
    return;
  }

  if (g.state === 'search' && g.lastSeen) {
    const arrived = guardStepToward(g, g.lastSeen.x, g.lastSeen.y, CFG.GUARD_SPEED * 1.15, dt, solids);
    if (arrived) {
      g.state = 'calm'; g.suspicion = 0; g.lastSeen = null;
      g.waitTimer = 1.0;
    }
    return;
  }

  if (g.investigate) {
    const arrived = guardStepToward(g, g.investigate.x, g.investigate.y, CFG.GUARD_SPEED * 1.1, dt, solids);
    if (arrived) {
      g.investigate = null;
      g.state = 'suspicious'; g.suspicion = CFG.SUSPICIOUS_AT * 0.7;
      g.waitTimer = 1.6;
    }
    return;
  }

  // Patrol: follow the pre-pathed legs, pausing at each waypoint.
  if (g.waitTimer > 0) { g.waitTimer -= dt; return; }
  const leg = g.legs[g.leg];
  if (!leg || g.legStep >= leg.length) {
    g.leg = (g.leg + 1) % g.legs.length;
    g.legStep = 0;
    g.waitTimer = g.pause;
    return;
  }
  const wp = leg[g.legStep];
  const arrived = guardStepToward(g, wp[0], wp[1], CFG.GUARD_SPEED, dt, solids);
  if (arrived) g.legStep++;
}
