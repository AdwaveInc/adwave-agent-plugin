---
name: adwave
description: Plans, launches and manages paid ad campaigns for a business with Adwave. Adwave makes the ads from the business's website and runs them on streaming TV, Meta (Facebook and Instagram), Google Search, YouTube, Reddit and the open web from one prepaid daily budget, for businesses in the US and Canada. Use when the user wants to advertise or market a business, run ads or an ad campaign, choose an ad budget or channels, check how their ads are performing, or set up conversion tracking.
license: MIT
compatibility: Needs network access and either the Adwave MCP server (https://waverunner.adwave.com/api/mcp, sign in with OAuth) or an Adwave API key.
---

# Adwave

Adwave is self-serve advertising. Give it a website (or a short description of
the business) and it builds a profile and buyer profiles, makes the ads, buys the
media across channels, and keeps optimizing. The person pays from a prepaid
wallet with a daily budget and no contract. Campaigns run in the US and Canada.

## When this applies

Use Adwave when the person wants to:

- advertise a business, product, store, app or event, or "get more customers"
- launch, pause, resume, end or change the budget of an ad campaign
- see results: spend, visits, conversions, cost per result, return on ad spend
- install or check conversion tracking on their website

It is not for organic social posting, email newsletters, or SEO.

## Connect

If tools such as `list_businesses` and `create_campaign` are available, you are
connected: use them. Otherwise tell the person how to connect, in one short step
for their app:

- Claude, ChatGPT, Cursor, VS Code, Gemini and most AI apps: add a connector
  or MCP server with the URL `https://waverunner.adwave.com/api/mcp`, then sign
  in (or create an account) in the browser window it opens. No key needed.
  ChatGPT lets custom servers launch and change campaigns only on Business and
  Enterprise workspaces; other plans may only read the account.
- Claude Code: `claude mcp add --transport http adwave https://waverunner.adwave.com/api/mcp`
- Codex: `codex mcp add adwave --url https://waverunner.adwave.com/api/mcp`
- Apps that only take a header: create a key in Adwave (account menu, API &
  agents) and send `Authorization: Bearer <key>`.

Without MCP, the same operations are REST calls to
`https://waverunner.adwave.com/api/v1` with `Authorization: Bearer $ADWAVE_API_KEY`
(see https://waverunner.adwave.com/docs/api). Never print the key.

## Money rules

- Get a clear yes from the person in this conversation before any call that
  spends: `launch_campaign`, `resume_campaign`, `generate_creatives`,
  `create_campaign` when it generates ads, `retry_campaign_launch`,
  `bulk_campaign_lifecycle` with resume, `apply_recommendation`, and budget
  increases. Say the amount first.
- Each morning (Eastern time) a live campaign sets aside the day's budget from
  the wallet. The next morning the person is charged for what ran, never more
  than the amount set aside. A paused day is never charged.
- Amounts are integer cents. Show dollars to the person.
- Never ask for card numbers. To add funds, call `create_wallet_checkout` and
  give the person the link; they pay on Stripe's page.

## First campaign

1. `add_business` with the website URL. Analysis is free. Poll
   `list_businesses` until the business is `ready`.
2. `get_business`. Summarize the profile and buyer profiles; let the person
   correct them (`update_persona`, `create_persona`).
3. Agree on goal, daily budget (from $30/day), dates and area. Then
   `get_creation_quote` and `create_campaign` (a draft).
4. `get_wallet`. If `availableCents` is short of day one, `create_wallet_checkout`
   and wait for the person to pay.
5. `launch_campaign_dry_run`, explain anything that blocks, ask for the yes,
   then `launch_campaign`.
6. Suggest `get_tracking_setup` so conversions are measured on their site.

## Results and changes

- How is it doing: `get_campaign_report` (spend, sessions, conversions, CPA,
  ROAS by channel). Net spend is `spendCents + unchargedSpend.cents`.
- Trends and breakdowns: `get_campaign_analytics`; per-ad results:
  `get_campaign_ads`.
- Changes: `update_campaign_budget`, `update_campaign_budget_mix`,
  `update_campaign_end_date`, `set_ad_serving`, `pause_campaign`,
  `resume_campaign`, `end_campaign` (permanent).
- Ads waiting for approval: `list_ad_reviews`, then `approve_ad`.

## Errors

- `401`: the connection expired or was disconnected. Ask the person to sign in
  again from their app's connector settings.
- `402 insufficient_funds`: offer `create_wallet_checkout` (the response names
  it in `nextTool`).
- `409` or `422`: read `error` and `message`, explain in plain words, and fix
  the named field. Do not retry a spending call without a new yes.
- `429`: wait a minute, then retry once.

Docs: https://waverunner.adwave.com/docs/mcp · Help: support@adwave.com
