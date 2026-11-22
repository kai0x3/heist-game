// VAULTBREAK — geometry: segment tests, line of sight, vision-cone polygons and a
// grid pathfinder the game uses to validate every patrol leg at load time.
'use strict';

function segIntersectsRect(x1, y1, x2, y2, r) {
  // True when the segment crosses the rectangle (slab test).
  const dx = x2 - x1, dy = y2 - y1;
  let tmin = 0, tmax = 1;
  const axes = [[dx, x1, r.x, r.x + r.w], [dy, y1, r.y, r.y + r.h]];
  for (const [d, o, lo, hi] of axes) {
    if (Math.abs(d) < 1e-9) { if (o < lo || o > hi) return false; continue; }
    let t1 = (lo - o) / d, t2 = (hi - o) / d;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

function losBlocked(x1, y1, x2, y2, solids) {
  for (const s of solids) {
    if (segIntersectsRect(x1, y1, x2, y2, s)) return true;
  }
  return false;
}

function castRay(x, y, ang, solids, maxDist) {
  // March along the ray; stop at the first solid hit (or the max distance).
  const step = 6;
  const dx = Math.cos(ang), dy = Math.sin(ang);
  for (let d = step; d <= maxDist; d += step) {
    const px = x + dx * d, py = y + dy * d;
    for (const s of solids) {
      if (px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h) return d - step / 2;
    }
  }
  return maxDist;
}

function conePolygon(x, y, ang, halfAngle, dist, solids) {
  // A vision cone clipped by walls: sample rays across the arc and shorten each one
  // at the first wall it hits.
  const pts = [[x, y]];
  const steps = 22;
  for (let i = 0; i <= steps; i++) {
    const a = ang - halfAngle + (2 * halfAngle * i) / steps;
    const d = castRay(x, y, a, solids, dist);
    pts.push([x + Math.cos(a) * d, y + Math.sin(a) * d]);
  }
  return pts;
}

function circleHitsRect(cx, cy, r, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nx, dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// Grid pathfinder over the floor (used to validate patrol legs and to steer guards
// around furniture when they chase or investigate).
function buildGrid(walls, obstacles, w, h, cell) {
  const cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
  const blocked = new Uint8Array(cols * rows);
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const cx = gx * cell + cell / 2, cy = gy * cell + cell / 2;
      for (const s of walls.concat(obstacles)) {
        if (pointInRect(cx, cy, s)) { blocked[gy * cols + gx] = 1; break; }
      }
    }
  }
  return { cols, rows, cell, blocked };
}

function gridPath(grid, sx, sy, tx, ty) {
  // Breadth-first search; returns a list of world points, or null when unreachable.
  const { cols, rows, cell, blocked } = grid;
  const sxi = Math.max(0, Math.min(cols - 1, Math.floor(sx / cell)));
  const syi = Math.max(0, Math.min(rows - 1, Math.floor(sy / cell)));
  const txi = Math.max(0, Math.min(cols - 1, Math.floor(tx / cell)));
  const tyi = Math.max(0, Math.min(rows - 1, Math.floor(ty / cell)));
  const start = syi * cols + sxi, goal = tyi * cols + txi;
  if (blocked[start] || blocked[goal]) return null;
  const prev = new Int32Array(cols * rows).fill(-1);
  const q = [start];
  prev[start] = start;
  const dirs = [1, -1, cols, -cols];
  while (q.length) {
    const cur = q.shift();
    if (cur === goal) break;
    for (const d of dirs) {
      const nx = cur + d;
      if (nx < 0 || nx >= cols * rows) continue;
      if (d === 1 && cur % cols === cols - 1) continue;
      if (d === -1 && cur % cols === 0) continue;
      if (prev[nx] !== -1 || blocked[nx]) continue;
      prev[nx] = cur;
      q.push(nx);
    }
  }
  if (prev[goal] === -1) return null;
  const path = [];
  let cur = goal;
  while (cur !== start) {
    path.push([(cur % cols) * cell + cell / 2, Math.floor(cur / cols) * cell + cell / 2]);
    cur = prev[cur];
  }
  path.reverse();
  return path;
}
