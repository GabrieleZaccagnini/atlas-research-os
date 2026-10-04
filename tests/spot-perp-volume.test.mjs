import assert from 'node:assert/strict';
import test from 'node:test';
import { aggregateVolume, alignVolumeBars, parseVolumeKlines, volumeHourMs } from '../lib/spot-perp-volume.ts';

const hour = volumeHourMs;
const start = Date.UTC(2026, 9, 4, 10);
const row = (time, volume) => [time, '100', '101', '99', '100', '5', time + hour - 1, volume, 100, '2', '200', '0'];

test('volume parser uses quote-asset USDT, excludes the open hour and rejects malformed or duplicated bars', () => {
  assert.deepEqual(parseVolumeKlines([row(start, '250.5'), row(start + hour, '900')], start + hour), [{ time: start, quoteUsdt: 250.5 }]);
  assert.throws(() => parseVolumeKlines([row(start, '-1')], start + hour));
  assert.throws(() => parseVolumeKlines([row(start, 'NaN')], start + hour));
  assert.throws(() => parseVolumeKlines([row(start, '10'), row(start, '11')], start + hour));
});

test('alignment omits unmatched hours and aggregation marks incomplete buckets unknown', () => {
  const spot = parseVolumeKlines([row(start, '100'), row(start + hour, '200'), row(start + 2 * hour, '300')], start + 3 * hour);
  const perp = parseVolumeKlines([row(start, '400'), row(start + 2 * hour, '600')], start + 3 * hour);
  const aligned = alignVolumeBars(spot, perp, start, start + 2 * hour);
  assert.deepEqual(aligned, [{ time: start, spotUsdt: 100, perpUsdt: 400 }, { time: start + 2 * hour, spotUsdt: 300, perpUsdt: 600 }]);
  assert.deepEqual(aggregateVolume(aligned, start, 3, 1).map(item => item.spotUsdt), [100, null, 300]);
  assert.deepEqual(aggregateVolume(aligned, start, 3, 3), [{ time: start, spotUsdt: null, perpUsdt: null, matchedHours: 2 }]);
});
