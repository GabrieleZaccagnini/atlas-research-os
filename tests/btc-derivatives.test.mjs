import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCurrentOpenInterest, parseFundingHistory, parseOpenInterestHistory } from '../lib/btc-derivatives.ts';

const t1 = Date.UTC(2026, 9, 2);
const t2 = Date.UTC(2026, 9, 3);

test('BTC futures parsers preserve contract units and order provider observations', () => {
  assert.deepEqual(parseCurrentOpenInterest({ symbol: 'BTCUSDT', openInterest: '97328.758', time: t2 }), { time: t2, btc: 97328.758 });
  assert.deepEqual(parseOpenInterestHistory([
    { symbol: 'BTCUSDT', sumOpenInterest: '98', sumOpenInterestValue: '8300000', timestamp: t2 },
    { symbol: 'BTCUSDT', sumOpenInterest: '97', sumOpenInterestValue: '8200000', timestamp: t1 },
  ]), [{ time: t1, btc: 97, usdt: 8200000 }, { time: t2, btc: 98, usdt: 8300000 }]);
  assert.deepEqual(parseFundingHistory([{ symbol: 'BTCUSDT', fundingRate: '-0.0001', fundingTime: t2 }]), [{ time: t2, rate: -0.0001 }]);
});

test('BTC futures parsers reject wrong contracts, missing history and nonfinite values', () => {
  assert.throws(() => parseCurrentOpenInterest({ symbol: 'ETHUSDT', openInterest: '5', time: t1 }));
  assert.throws(() => parseOpenInterestHistory([{ symbol: 'BTCUSDT', sumOpenInterest: '0', sumOpenInterestValue: 'Infinity', timestamp: t1 }]));
  assert.throws(() => parseFundingHistory([{ symbol: 'BTCUSDT', fundingRate: 'NaN', fundingTime: t1 }]));
});
