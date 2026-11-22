// VAULTBREAK — the thief: movement, sneaking, coin tosses, cracking the diamond
// case, grabbing loot and crawling through vents.
'use strict';

function makePlayer(level) {
  return {
    x: level.spawn.x, y: level.spawn.y, r: CFG.PLAYER_R,
    dir: -Math.PI / 2, moving: false, sneaking: false,
    coins: CFG.COINS_START, lives: CFG.LIVES,
    lootValue: 0, lootCount: 0, hasDiamond: false,
    crackProgress: 0, cracking: false,
    venting: 0, ventTarget: null,
    stepTimer: 0, invuln: 0,
  };
}

function moveCircle(p, dx, dy, solids) {
  // Axis-separated movement so the thief slides along walls instead of sticking.
  const nx = p.x + dx;
  if (!solids.some(s => circleHitsRect(nx, p.y, p.r, s))) p.x = nx;
  const ny = p.y + dy;
  if (!solids.some(s => circleHitsRect(p.x, ny, p.r, s))) p.y = ny;
  p.x = Math.max(16 + p.r, Math.min(CFG.W - 16 - p.r, p.x));
  p.y = Math.max(16 + p.r, Math.min(CFG.H - 16 - p.r, p.y));
}

function updatePlayer(p, input, dt, game) {
  const level = game.level, solids = game.solids;
  if (p.venting > 0) {
    p.venting -= dt;
    if (p.venting <= 0 && p.ventTarget) {
      p.x = p.ventTarget.x; p.y = p.ventTarget.y; p.ventTarget = null;
      Sfx.vent();
    }
    return;
  }
  if (p.invuln > 0) p.invuln -= dt;

  let mx = 0, my = 0;
  if (input.up) my -= 1;
  if (input.down) my += 1;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  p.moving = mx !== 0 || my !== 0;
  p.sneaking = !!input.sneak;
  if (p.moving) {
    const len = Math.hypot(mx, my);
    const speed = (p.sneaking ? CFG.SNEAK_SPEED : CFG.WALK_SPEED) * (p.cracking ? 0 : 1);
    p.dir = Math.atan2(my / len, mx / len);
    moveCircle(p, (mx / len) * speed * dt, (my / len) * speed * dt, solids);
    p.stepTimer -= dt;
    if (p.stepTimer <= 0) { Sfx.step(); p.stepTimer = p.sneaking ? 0.55 : 0.34; }
  }

  // Shadow check: standing in a dark tile slows every guard's suspicion.
  p.inShadow = level.shadows.some(s => pointInRect(p.x, p.y, s));

  // Cracking the diamond case: hold E beside the glass case.
  const d = game.level.loot[0];
  const nearDiamond = !d.taken && Math.hypot(p.x - d.x, p.y - d.y) < 78;
  p.cracking = nearDiamond && !!input.action;
  if (p.cracking) {
    p.crackProgress += dt;
    if (Math.floor(p.crackProgress * 8) !== Math.floor((p.crackProgress - dt) * 8)) Sfx.crackTick();
    if (p.crackProgress >= CFG.CRACK_TIME) {
      d.taken = true; p.hasDiamond = true; p.lootValue += d.value; p.lootCount++;
      game.alarm = Math.min(CFG.ALARM_MAX, game.alarm + 12);
      Sfx.diamond();
      game.flash = 'DIAMOND SECURED — GET TO THE VENT!';
      game.flashTimer = 2.6;
    }
  } else if (!d.taken) {
    p.crackProgress = Math.max(0, p.crackProgress - dt * 2);
  }

  // Walk-over loot: cash stacks and the gold bar.
  for (const item of level.loot) {
    if (item.taken || item.needsCrack) continue;
    if (Math.hypot(p.x - item.x, p.y - item.y) < 30) {
      item.taken = true; p.lootValue += item.value; p.lootCount++;
      Sfx.pickup();
      game.flash = '+$' + item.value.toLocaleString('en-US');
      game.flashTimer = 1.2;
    }
  }

  // Vents: press E beside one to crawl to its pair.
  if (input.actionPressed) {
    for (const v of level.vents) {
      if (Math.hypot(p.x - v.x, p.y - v.y) < 44) {
        const other = level.vents[v.link];
        p.venting = CFG.VENT_TIME; p.ventTarget = other;
        Sfx.vent();
        break;
      }
    }
  }

  // Coin toss: click (or F) throws a coin toward the mouse; guards investigate.
  if (input.toss) {
    input.toss = null;
    if (p.coins > 0) {
      p.coins--;
      game.coins.push({ x: input.toss.x, y: input.toss.y, t: 0 });
      Sfx.clink();
    }
  }
}
