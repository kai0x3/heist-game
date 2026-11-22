// VAULTBREAK — everything the eye sees: the bank floor, the cones, the guards,
// the loot and the thief. Canvas only; the HUD lives in the DOM (index.html).
'use strict';

function drawFloor(ctx, game) {
  const level = game.level;
  ctx.fillStyle = CFG.COL.floor;
  ctx.fillRect(0, 0, CFG.W, CFG.H);
  // carpet checker
  ctx.fillStyle = CFG.COL.floorAlt;
  for (let y = 0; y < CFG.H; y += 80) {
    for (let x = 0; x < CFG.W; x += 80) {
      if (((x + y) / 80) % 2 === 0) ctx.fillRect(x, y, 80, 80);
    }
  }
  // room labels
  ctx.fillStyle = 'rgba(148,163,184,0.35)';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('O F F I C E', 60, 60);
  ctx.fillText('G A L L E R Y', 480, 260);
  ctx.fillText('V A U L T', 1000, 60);
  ctx.fillText('L O B B Y', 90, 470);
  // shadow tiles: the dark cover a careful thief uses
  for (const s of level.shadows) {
    ctx.fillStyle = CFG.COL.shadow;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = 'rgba(125,211,252,0.18)';
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(s.x + 1, s.y + 1, s.w - 2, s.h - 2);
    ctx.setLineDash([]);
  }
  // exit vent zone
  const e = level.exit;
  ctx.strokeStyle = CFG.COL.exit;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = CFG.COL.exit;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT · VENT', e.x, e.y + e.r + 20);
}

function drawWalls(ctx, game) {
  for (const w of game.level.walls) {
    ctx.fillStyle = CFG.COL.wallTop;
    ctx.fillRect(w.x, w.y, w.w, 4);
    ctx.fillStyle = CFG.COL.wall;
    ctx.fillRect(w.x, w.y + 4, w.w, w.h - 4);
  }
}

function drawObstacles(ctx, game) {
  for (const o of game.level.obstacles) {
    if (o.kind === 'case') {
      ctx.fillStyle = '#2b3350';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = 'rgba(125,211,252,0.25)';
      ctx.fillRect(o.x + 4, o.y + 4, o.w - 8, o.h - 8);
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x + 2, o.y + 2, o.w - 4, o.h - 4);
    } else if (o.kind === 'desk') {
      ctx.fillStyle = '#4a3421';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#6b4a2f';
      ctx.fillRect(o.x + 6, o.y + 6, o.w - 12, o.h - 12);
      ctx.fillStyle = '#2f2115';
      ctx.fillRect(o.x + 8, o.y + o.h / 2 - 8, 26, 16);
    } else if (o.kind === 'safe') {
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#52525b';
      ctx.fillRect(o.x + 6, o.y + 6, o.w - 12, o.h - 12);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(o.x + o.w / 2, o.y + o.h / 2, 16, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(o.x + o.w / 2, o.y + o.h / 2, 4, 0, Math.PI * 2); ctx.fillStyle = '#fbbf24'; ctx.fill();
    } else if (o.kind === 'diamondCase') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 3;
      ctx.strokeRect(o.x + 2, o.y + 2, o.w - 4, o.h - 4);
      ctx.fillStyle = 'rgba(167,139,250,0.18)';
      ctx.fillRect(o.x + 4, o.y + 4, o.w - 8, o.h - 8);
    } else if (o.kind === 'planter') {
      ctx.fillStyle = '#14532d';
      ctx.beginPath(); ctx.arc(o.x + 20, o.y + 20, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#166534';
      ctx.beginPath(); ctx.arc(o.x + 14, o.y + 14, 10, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(o.x + 27, o.y + 25, 9, 0, Math.PI * 2); ctx.fill();
    } else if (o.kind === 'pillar') {
      ctx.fillStyle = '#475569';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(o.x + 4, o.y + 4, o.w - 8, o.h - 8);
    }
  }
}

function drawLoot(ctx, game, t) {
  for (const item of game.level.loot) {
    if (item.taken) continue;
    const pulse = 1 + Math.sin(t * 3 + item.x) * 0.12;
    if (item.kind === 'diamond') {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = CFG.COL.diamond;
      ctx.beginPath();
      ctx.moveTo(0, -16); ctx.lineTo(12, -4); ctx.lineTo(8, 12); ctx.lineTo(-8, 12); ctx.lineTo(-12, -4);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      ctx.fillStyle = CFG.COL.vault;
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MERIDIAN DIAMOND · $50,000', item.x, item.y + 34);
    } else if (item.kind === 'cash') {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(item.x - 12, item.y - 7, 24, 14);
      ctx.fillStyle = '#bbf7d0';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$', item.x, item.y + 4);
    } else if (item.kind === 'gold') {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(item.x - 12, item.y + 7); ctx.lineTo(item.x - 7, item.y - 7);
      ctx.lineTo(item.x + 7, item.y - 7); ctx.lineTo(item.x + 12, item.y + 7);
      ctx.closePath(); ctx.fill();
    }
  }
}

function drawCone(ctx, x, y, ang, halfAngle, dist, fill) {
  const poly = conePolygon(x, y, ang, halfAngle, dist, gameSolids);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(poly[0][0], poly[0][1]);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
  ctx.closePath();
  ctx.fill();
}

let gameSolids = [];

function drawCones(ctx, game) {
  gameSolids = game.solids;
  for (const cam of game.cameras) {
    drawCone(ctx, cam.x, cam.y, cam.angle, CFG.CAM_VIEW_HALF_ANGLE, CFG.CAM_VIEW_DIST,
      cam.spotting ? 'rgba(239,68,68,0.30)' : CFG.COL.coneCam);
  }
  for (const g of game.guards) {
    const fill = g.state === 'alert' ? CFG.COL.coneAlert
      : g.state === 'suspicious' ? CFG.COL.coneSusp : CFG.COL.coneCalm;
    drawCone(ctx, g.x, g.y, g.dir, CFG.GUARD_VIEW_HALF_ANGLE, CFG.GUARD_VIEW_DIST, fill);
  }
}

function drawCameras(ctx, game) {
  for (const cam of game.cameras) {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(cam.x, cam.y, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = cam.spotting ? '#ef4444' : '#38bdf8';
    ctx.beginPath(); ctx.arc(cam.x, cam.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cam.x, cam.y);
    ctx.lineTo(cam.x + Math.cos(cam.angle) * 18, cam.y + Math.sin(cam.angle) * 18);
    ctx.stroke();
  }
}

function drawGuards(ctx, game, t) {
  for (const g of game.guards) {
    // body
    ctx.fillStyle = CFG.COL.guardSuit;
    ctx.beginPath(); ctx.arc(g.x, g.y, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = CFG.COL.guard;
    ctx.beginPath(); ctx.arc(g.x, g.y, 9, 0, Math.PI * 2); ctx.fill();
    // facing tick
    ctx.strokeStyle = '#fecaca';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.dir) * 18, g.y + Math.sin(g.dir) * 18);
    ctx.stroke();
    // state ring + marker
    if (g.state === 'suspicious') {
      ctx.strokeStyle = '#f97316'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(g.x, g.y, 19 + Math.sin(t * 6) * 2, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fdba74'; ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.fillText('?', g.x, g.y - 24);
    } else if (g.state === 'alert') {
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(g.x, g.y, 19 + Math.sin(t * 10) * 2, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#fca5a5'; ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.fillText('!', g.x, g.y - 24);
    }
    // suspicion arc while watching
    if (g.suspicion > 4 && g.state !== 'alert') {
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 22, -Math.PI / 2, -Math.PI / 2 + (g.suspicion / 100) * Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(226,232,240,0.75)';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.name.toUpperCase(), g.x, g.y + 32);
  }
}

function drawPlayer(ctx, game, t) {
  const p = game.player;
  if (p.venting > 0) return; // inside the vent: invisible
  const blink = p.invuln > 0 && Math.floor(t * 10) % 2 === 0;
  if (blink) return;
  // sneak halo
  if (p.sneaking) {
    ctx.strokeStyle = 'rgba(74,222,128,0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 6, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = '#14532d';
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = CFG.COL.player;
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#052e16';
  ctx.beginPath(); ctx.arc(p.x + Math.cos(p.dir) * 5, p.y + Math.sin(p.dir) * 5, 5, 0, Math.PI * 2); ctx.fill();
  // crack progress ring
  if (p.cracking) {
    ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + 11, -Math.PI / 2, -Math.PI / 2 + (p.crackProgress / CFG.CRACK_TIME) * Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(220,252,231,0.85)';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YOU', p.x, p.y + 30);
}

function drawCoins(ctx, game) {
  for (const c of game.coins) {
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(c.x, c.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(c.x, c.y, 6, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(251,191,36,0.5)';
    ctx.beginPath(); ctx.arc(c.x, c.y, 12 + c.t * 14, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawVents(ctx, game) {
  for (const v of game.level.vents) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(v.x - 16, v.y - 10, 32, 20);
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(v.x - 12, v.y + i * 5);
      ctx.lineTo(v.x + 12, v.y + i * 5);
      ctx.stroke();
    }
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(v.label, v.x, v.y + 26);
  }
}

function renderGame(ctx, game, t) {
  drawFloor(ctx, game);
  drawVents(ctx, game);
  drawCones(ctx, game);
  drawObstacles(ctx, game);
  drawWalls(ctx, game);
  drawLoot(ctx, game, t);
  drawCoins(ctx, game);
  drawCameras(ctx, game);
  drawGuards(ctx, game, t);
  drawPlayer(ctx, game, t);
  // alarm vignette
  if (game.alarm > 55) {
    const a = (game.alarm - 55) / 45 * 0.22;
    ctx.fillStyle = 'rgba(239,68,68,' + a.toFixed(3) + ')';
    ctx.fillRect(0, 0, CFG.W, CFG.H);
  }
}
