import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarginClusters, parseMarginEvents, parseMarginRecent, parseSpecialistHistory } from '../lib/specialist-feeds.ts';

const days = Array.from({ length: 31 }, (_, index) => {
  const time = Date.UTC(2026, 8, index + 1);
  return { d: new Date(time).toISOString().slice(0, 10), unixTs: String(time / 1000), sthRealizedPrice: String(70000 + index), etfFlow: String(index % 2 ? -100 : 150), hashprice: String(0.07 + index / 10000) };
});

test('specialist histories preserve cohort price, signed ETF flow and dated hashprice', () => {
  assert.equal(parseSpecialistHistory(days, 'sth-realized-price').rows.at(-1)?.value, 70030);
  assert.equal(parseSpecialistHistory(days, 'etf-flow').rows[1].value, -100);
  assert.equal(parseSpecialistHistory(days, 'hashprice').rows[0].value, 0.07);
  assert.throws(() => parseSpecialistHistory(days.map(item => ({ ...item, unixTs: '0' })), 'sth-realized-price'), /Insufficient/);
});

test('MarginPad price profiles are observed buckets while clusters must be explicitly modeled', () => {
  const observed = parseMarginRecent({ symbol: 'BTC', minutes: 1440, updatedAt: 1000, buckets: [{ price: 85000, long: 2500, short: 0, count: 2 }] });
  assert.equal(observed.buckets[0].longUsd, 2500);
  const modeled = parseMarginClusters({ symbol: 'BTC', model: true, updatedAt: 1000, clusters: [{ price: 86000, side: 'short_liquidated', est_notional: 5000 }] });
  assert.equal(modeled.clusters[0].estimatedUsd, 5000);
  assert.throws(() => parseMarginClusters({ symbol: 'BTC', model: false, updatedAt: 1000, clusters: [] }), /Invalid/);
});

test('MarginPad event parser requires BTC identity and positive execution values', () => {
  const events = parseMarginEvents({ symbol: 'BTC', events: [
    { ts: 1000, exchange: 'binance', symbol: 'BTC', side: 'long_liquidated', price: 85000, notional: 100 },
    { ts: 2000, exchange: 'gate', symbol: 'ETH', side: 'short_liquidated', price: 3000, notional: 200 },
  ] });
  assert.equal(events.length, 1);
  assert.equal(events[0].exchange, 'binance');
});
