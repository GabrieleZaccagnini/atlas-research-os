import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCycleView, cleanDaily, type DailyPoint } from '../lib/bitcoin-cycle';

const start = Date.UTC(2012, 0, 1);
const points: DailyPoint[] = Array.from({ length: 5500 }, (_, index) => ({
  date: new Date(start + index * 86400000).toISOString().slice(0, 10),
  priceUsd: 10 * Math.exp(index / 650),
  hashRateEhs: 1 + index / 100,
  minerRevenueUsd: 1000000,
}));

test('cycle views calculate historical comparisons and named model bounds from dated prices', () => {
  const rainbow = buildCycleView(points, 'original-rainbow');
  assert.ok(rainbow.rows.length > 100);
  assert.ok(rainbow.rows.some(row => typeof row.band1 === 'number' && typeof row.band5 === 'number' && row.band1 < row.band5));
  const reward = buildCycleView(points, 'reward-era');
  const startRow = reward.rows.find(row => row.date === '0');
  assert.equal(startRow?.y2012, 1);
  assert.equal(startRow?.y2016, 1);
  assert.equal(startRow?.y2020, 1);
  const progress = buildCycleView(points, 'halving-progress', 2020, 945000);
  assert.equal(progress.currentProgress, 50);
  assert.ok(progress.rows.some(row => typeof row.y2024 === 'number'));
});

test('monthly and quarterly returns exclude unfinished periods and use prior period closes', () => {
  const monthly = buildCycleView(points, 'monthly');
  const quarterly = buildCycleView(points, 'quarterly');
  assert.equal(monthly.rows[0].date, '2012-02');
  assert.equal(quarterly.rows[0].date, '2012 Q2');
  assert.ok(monthly.rows.every(row => typeof row.returnPct === 'number'));
  assert.ok(quarterly.rows.every(row => typeof row.returnPct === 'number'));
  assert.ok(quarterly.rows.length < monthly.rows.length);
});

test('mining indicators use complete rolling windows and do not invent missing data', () => {
  const puell = buildCycleView(points, 'puell');
  assert.equal(puell.rows[0].multiple, 1);
  const ribbons = buildCycleView(points, 'hash-ribbons');
  assert.ok(Number(ribbons.rows[0].short) > Number(ribbons.rows[0].long));
  const missing = points.map((point, index) => index % 10 === 0 ? { ...point, minerRevenueUsd: undefined } : point);
  assert.throws(() => buildCycleView(missing, 'puell'), /sparse/);
  assert.deepEqual(cleanDaily([points[1], points[0], points[0]]).map(point => point.date), [points[0].date, points[1].date]);
});

test('cycle repeat changes with the selected historical era and marks projections as scenarios', () => {
  const earlier = buildCycleView(points, 'cycle-repeat', 2016);
  const later = buildCycleView(points, 'cycle-repeat', 2020);
  assert.match(earlier.note ?? '', /scenario/i);
  assert.notEqual(earlier.note, later.note);
});
