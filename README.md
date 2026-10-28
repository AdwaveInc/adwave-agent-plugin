# Adwave for AI assistants

Run paid advertising for a business from the AI assistant you already use. Adwave
makes the ads from the business's website and runs them on streaming TV, Meta
(Facebook and Instagram), Google Search, YouTube, Reddit and the open web from one
prepaid daily budget, then reports spend, visits, conversions and return on ad
spend. Campaigns run in the US and Canada.

This repository is the Adwave plugin for Claude, Claude Code, ChatGPT and Codex,
Cursor, Grok, VS Code and GitHub Copilot, Gemini, Kiro, OpenClaw and Hermes. It
bundles the remote Adwave MCP server and one skill that teaches the assistant when
and how to use it.

| | |
| --- | --- |
| MCP server | `https://waverunner.adwave.com/api/mcp` (Streamable HTTP) |
| Sign-in | OAuth 2.1 with PKCE. No key to paste. New accounts can sign up in the same window |
| Header-only clients | `Authorization: Bearer <API key>` from Adwave, account menu, API & agents |
| Agent signup without a browser | `https://waverunner.adwave.com/api/mcp/signup` (`signup_start`, `signup_poll`) |
| Docs | https://waverunner.adwave.com/docs/mcp |

## Install

**Claude (web, desktop, mobile).** Settings, Connectors, Add custom connector, URL
`https://waverunner.adwave.com/api/mcp`. Or open
[this prefilled link](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Adwave&connectorUrl=https%3A%2F%2Fwaverunner.adwave.com%2Fapi%2Fmcp).

**Claude Code.**

```bash
/plugin marketplace add AdwaveInc/adwave-agent-plugin
/plugin install adwave@adwave
```

Or just the server: `claude mcp add --transport http adwave https://waverunner.adwave.com/api/mcp`

**ChatGPT.** Settings, Apps (or Plugins), Add custom MCP server, URL
`https://waverunner.adwave.com/api/mcp`, authentication OAuth.

**Codex.** `codex mcp add adwave --url https://waverunner.adwave.com/api/mcp`, then
`codex mcp login adwave`.

**Cursor.** Install **Adwave** from the marketplace, or
[add the server in one click](https://cursor.com/en/install-mcp?name=adwave&config=eyJ1cmwiOiJodHRwczovL3dhdmVydW5uZXIuYWR3YXZlLmNvbS9hcGkvbWNwIn0%3D).

**VS Code and GitHub Copilot.**
`code --add-mcp '{"name":"adwave","type":"http","url":"https://waverunner.adwave.com/api/mcp"}'`

**Grok.** grok.com, Connectors, New connector, Custom, URL
`https://waverunner.adwave.com/api/mcp`. Grok CLI:
`grok mcp add --transport http adwave https://waverunner.adwave.com/api/mcp`

**Gemini CLI.** `gemini extensions install https://github.com/AdwaveInc/adwave-agent-plugin`

**Hermes Agent.** Add to `~/.hermes/config.yaml`, then restart the session and
approve the sign-in window:

```yaml
mcp_servers:
  adwave:
    url: https://waverunner.adwave.com/api/mcp
    auth: oauth
```

**OpenClaw.** Add to `openclaw.json`:

```json
{ "mcp": { "servers": { "adwave": { "url": "https://waverunner.adwave.com/api/mcp", "transport": "streamable-http" } } } }
```

then `openclaw mcp login adwave`.

**Anything else.** Point any MCP client that supports Streamable HTTP at
`https://waverunner.adwave.com/api/mcp`. If it cannot do OAuth, send an API key as
`Authorization: Bearer <key>`.

## What you can ask

- "Advertise my bakery from its website with $40 a day around Austin."
- "How did my Adwave campaigns do last week? Which channel had the best cost per lead?"
- "Move $20 a day from the brand campaign to the spring sale."
- "Pause everything until Monday."
- "Install conversion tracking on my Shopify store."

## Money and safety

Adwave spends from a prepaid wallet you fund. The skill tells the assistant to get
your yes before every call that spends, to show amounts first, and never to ask for
card details (top-ups happen on Stripe's page). Read-only tools are marked read-only,
so assistants can run them without asking; launch, resume, end and budget tools are
marked as changing your account. Disconnect an assistant any time in Adwave,
Settings, For developers, Connected apps.

## Repository layout

| File | Used by |
| --- | --- |
| `plugin.json`, `mcp.json` | Agent Plugins 1.0: ChatGPT and Codex, Cursor, VS Code, Copilot CLI, Kiro |
| `.claude-plugin/`, `.mcp.json` | Claude Code plugin and marketplace, Claude plugin directory |
| `.cursor-plugin/` | Cursor Marketplace and Grok Bot |
| `gemini-extension.json` | Gemini CLI extension gallery |
| `skills/adwave/SKILL.md` | Every agent that reads Agent Skills (Claude, Codex, Cursor, Copilot, Gemini, OpenClaw, Hermes and more) |
| `server.json` | Official MCP Registry (`io.github.AdwaveInc/adwave`) |

Check every manifest with `node scripts/validate.mjs`.

## Support and policies

- Help: https://adwave.com/help/mcp/ and support@adwave.com
- Privacy: https://waverunner.adwave.com/privacy
- Terms: https://waverunner.adwave.com/terms
- Security reports: security@adwave.com

MIT licensed. © Adwave Digital Inc
