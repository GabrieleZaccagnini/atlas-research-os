import test from 'node:test';
import assert from 'node:assert/strict';
import { appendLiquidation, coveredMilliseconds, emptyLiquidationTape, mergeLiquidationTapes, observedHeatmap, parseBinanceLiquidation, parseCoinalyzeHistory, parseLiquidationTape, recordCoverage } from '../lib/liquidations.ts';

const now = Date.UTC(2026, 9, 4, 12);

test('Binance stream parser uses filled execution fields and liquidation side', () => {
  const long = parseBinanceLiquidation({ e: 'forceOrder', E: now, o: { s: 'BTCUSDT', S: 'SELL', ap: '85000', z: '0.2', T: now } });
  assert.deepEqual(long, { time: now, price: 85000, btc: 0.2, usdt: 17000, side: 'long' });
  assert.equal(parseBinanceLiquidation({ e: 'forceOrder', o: { s: 'BTCUSDT', S: 'BUY', p: '85000', q: '1', T: now } }), null);
  assert.equal(parseBinanceLiquidation({ e: 'forceOrder', o: { s: 'ETHUSDT', S: 'SELL', ap: '1000', z: '1', T: now } }), null);
});

test('Coinalyze parser preserves USD long/short totals and rejects wrong contracts', () => {
  const rows = parseCoinalyzeHistory([{ symbol: 'BTCUSDT_PERP.A', history: [
    { t: now / 1000, l: 500, s: 700 }, { t: (now - 3600000) / 1000, l: 0, s: 100 },
  ] }]);
  assert.deepEqual(rows.map(row => row.longUsd), [0, 500]);
  assert.throws(() => parseCoinalyzeHistory([{ symbol: 'ETHUSDT_PERP.A', history: [{ t: now / 1000, l: 1, s: 1 }] }]));
});

test('observed heatmap and connection coverage do not turn gaps into observations', () => {
  const event = { time: now - 60000, price: 85000, btc: 0.2, usdt: 17000, side: 'long' };
  let tape = appendLiquidation(emptyLiquidationTape(), event, now);
  tape = appendLiquidation(tape, event, now);
  assert.equal(tape.events.length, 1);
  tape = recordCoverage(tape, now - 120000, now - 60000, now);
  tape = recordCoverage(tape, now - 90000, now, now);
  tape = recordCoverage(tape, now - 120000, now, now);
  assert.equal(tape.coverage.length, 2);
  assert.equal(coveredMilliseconds(tape.coverage, now - 3600000, now), 120000);
  const map = observedHeatmap(tape.events, now);
  assert.equal(map.cells.length, 1);
  assert.equal(map.cells[0].longUsdt, 17000);
  assert.equal(map.cells[0].shortUsdt, 0);
  assert.equal(observedHeatmap(tape.events, now + 25 * 3600000).cells.length, 0);
  assert.deepEqual(parseLiquidationTape(JSON.stringify(tape)), tape);
  assert.throws(() => parseLiquidationTape('{"version":1,"events":[{"time":1}],"coverage":[]}'));
  const anotherTab = appendLiquidation(emptyLiquidationTape(), { ...event, time: now - 30000, side: 'short' }, now);
  assert.equal(mergeLiquidationTapes(tape, anotherTab, now).events.length, 2);
  assert.equal(mergeLiquidationTapes(tape, anotherTab, now + 8 * 86400000).events.length, 0);
});
