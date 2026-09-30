# Next research additions: connections and relative strength

Recorded 2026-09-28 from the user's VirtualBacon livestream notes and two screenshots (17.07.38 / 17.07.59). **Planning only.** Finish the market dashboard before selecting the next implementation slice. Screenshot numbers, ISO/Overledger labels and trade conclusions are not verified data.

## Proposed board

Choose a leader (for example QNT or ADA), a verified ecosystem or a named narrative basket. Display a sortable table and two linked charts. Start with manually curated membership/evidence and one trustworthy daily-price dataset; expand only after that works.

| Column | Required definition |
| --- | --- |
| Token / chain / role | Canonical provider and contract IDs; native asset, deployed app, integration partner, shared organization or narrative membership kept distinct |
| Connection | Exact relationship, counterparty, direct/inferred/disputed status, source, announcement and last-verified dates; technical compatibility does not establish partnership |
| 24h / 7d / 30d / relative return | Same currency, endpoint convention and aligned time window; relative performance against selected leader/BTC/basket |
| Beta | Cov(asset daily returns, benchmark daily returns) / Var(benchmark); chosen benchmark/basket weights, lookback, sampling, overlap count and return convention visible |
| Correlation / stability | Separate from beta; show coverage, uncertainty and sensitivity to window changes; no value when variance/history is insufficient |
| Below ATH / cycle high | Different anchors: ATH across available history vs explicitly defined cycle window. Store source, price type and date; price drawdown is not market-cap upside potential |
| Above 12-month low / bear low | Distinct horizons and low dates. No comparing one token's 12-month low with another's older bear-market low under the same label |
| Historical event move | User-defined exact start/end dates (e.g. a selected November 2024 run), reproducible close-to-close return; unavailable when token/history did not exist |
| 50 MA | Default 50-day SMA using 50 completed UTC daily candles; distance, slope and recent crossings. Later optional EMA/timeframe. No interpolated missing candles |
| Liquidity / risk | Volume, usable venue/pool context and missing coverage alongside relative strength, so a thin-market spike is visible |
| Watch state | Explainable observation such as “outperforming benchmark” or “below 50D SMA”; never promise a laggard is next to pump |

Scatter plot: x = measured beta, y = rebound from the **same low definition**. With those axes, high beta and lower rebound is the lower-right area; do not copy contradictory screenshot labels. Keep all plotted axes honest: use an inset/explicit range toggle for extreme values, not silently omitted tokens. Companion bar chart compares historical-event returns and current drawdown with distinct dates and labels.

## Relationship types and why they matter

Track deployments on the same chain, verified protocol integrations, shared infrastructure dependencies, disclosed organizational/VC connections and narrative classifications as separate edges. A chain's native token rising is a hypothesis for investigating ecosystem assets, not proof those tokens must rise. Multi-chain projects may have several edges. Correlation without relationship evidence remains a statistical observation; relationship evidence does not prove lead/lag causality.

ISO 20022 / Quant membership needs a specific sourced rationale. Record a market narrative separately from a documented standards role or verified product integration. Do not mark tokens “ISO certified” or “Overledger connected” based on a social graphic or generic EVM compatibility.

## Macro additions

- CME: investigate licensed/public FedWatch or futures-implied rate data, calculation method and update schedule. Do not assume free API rights from an accessible chart.
- Kalshi: investigate public market data, event contract wording, resolution rules, bid/ask/liquidity and expiry. Contract prices are market-implied observations, separate from forecasts and policy decisions.
- PCE: headline/core price indexes, MoM/YoY, reference period, release date and revisions from BEA/FRED. Investigate Investing.com for calendar/consensus data only with supported access; actual/prior/consensus must remain distinct.

## Sourced price targets

ATLAS-050 starts with manual records: asset identity; forecaster/organization; publication and retrieval dates; source link and short evidence; bull/base/bear; target value/currency; target date or explicit unknown horizon; assumptions/invalidation; revisions and expiry. Separate user scenarios from external calls and reported quotes from Atlas calculations. Show a distribution with sample size and source mix only after comparable horizons are available; no synthetic consensus or implied probability from headline counts.

## Suggested build order after dashboard feedback

1. PCE observation cards, if official series access and definitions validate.
2. Daily candle foundation (ATLAS-034), then 50D SMA and like-for-like high/low distances.
3. Typed relationship/membership records (ATLAS-049 with ATLAS-009), followed by the beta/relative-strength board (ATLAS-031).
4. Manual sourced forecast records (ATLAS-050), then permitted news enrichment.
5. CME/Kalshi expectations after access/terms and instrument methodology are verified.

These additions are recorded as planned while dashboard verification finishes. Provider access and historical inputs must be verified as each slice is implemented.
