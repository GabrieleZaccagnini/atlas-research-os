# Your first Atlas research session

> Homepage update: the anytime market overview is documented in [DASHBOARD.md](DASHBOARD.md). The research workflow below now lives at `/research`; backup exports now use version 4.

Open http://localhost:3000 in the same browser each time. The current version runs locally on this Mac; it is not deployed. If the server has stopped, double-click `Start Atlas.command` in the repository and keep that Terminal window open. If Node/npm is unavailable, the launcher explains the problem instead of installing anything.

1. Sign in for your private cloud workspace, or choose **Continue in this browser** for local research. These are separate workspaces; signing in does not transfer local records. Keep the browser/address consistent for local work.
2. On **Daily Dashboard**, scan market cap, volume, BTC dominance, BTC/ETH and their timestamps. **Refresh markets** respects a five-minute shared cache.
3. Choose **Explore market**, search an asset and select **Watch**. Open the project. For an asset outside the available universe, create it manually in Projects.
4. On **Overview**, load its sourced profile, inspect it, choose **Use profile in draft**, then **Save research**. Write your own summary/thesis/risks separately. Reported team/links still need verification.
5. Write a next action, next review date and today's note. **Save research & log review** saves the project and adds the note to **Journal**. Ordinary Save research does not log the unfinished review text.
6. In **News & Catalysts**, add an event title, calendar date and source. Choose **Add event to draft**, then **Save research**. It appears on **Calendar** and the dashboard.
7. Use **Backup research** at the end. Backups contain private, unencrypted research. The latest 100 reviews per project are retained, so export regularly.

Unfinished reviews/events survive switching project sections, but not a page reload or closing the browser. Warnings help prevent accidental loss; save explicitly.

## What is ready versus next

Ready for testing: market snapshots/discovery, mapped project prices, sourced profile references, manual research, saved reviews/next actions, catalyst dates, journal, calendar and backups. Browser-only flow has been exercised end to end. Cloud database saves/isolation/conflicts have been tested; a signed-in browser save/reload is still to verify.

Still planned: global rates and money supply, policy/trade events, chain TVL/RWA comparison and revenue, automatic news, institutional connections, charts/signals, CMC personal-account import and portfolio accounting. Preview pages remain clearly labeled. This release creates a daily research loop, not the full terminal.

## Capture feedback

Send the page name, what you wanted to learn/do, and what was confusing or missing. We will connect it to an existing ATLAS feature ID or add a new idea in BACKLOG.md, adjust ROADMAP.md and record material decisions. No need to rewrite the master plan each time.
